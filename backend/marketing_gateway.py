"""PostgreSQL-backed enterprise records gateway for ARAAK Marketing.

CEO OFFICE 360 is the canonical institutional gateway. Marketing opportunities,
tenders, and private attachments live in the CEO PostgreSQL database so the
integration works independently of Odoo plan limitations.
"""
from __future__ import annotations

import base64
import json
import os
import re
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import text

try:
    from .database_pg import AsyncSessionLocal
    from .odoo_connector import get_odoo_connector
except ImportError:
    from database_pg import AsyncSessionLocal
    from odoo_connector import get_odoo_connector

SOURCES = ["اعتماد", "فرصة", "منافس", "مناقصات", "إحالة مباشرة", "مصدر داخلي"]
MAX_FILES = max(1, int(os.getenv("MARKETING_MAX_FILES", "5")))
MAX_FILE_SIZE = max(1024, int(os.getenv("MARKETING_MAX_FILE_SIZE", str(3 * 1024 * 1024))))
WRITE_ROLES = {"admin", "ceo", "vp_development", "vp_investment", "dev_manager", "tracker"}
_SCHEMA_READY = False

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS marketing_records (
    id BIGSERIAL PRIMARY KEY,
    kind VARCHAR(20) NOT NULL CHECK (kind IN ('opportunity', 'tender')),
    title TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by_email TEXT,
    created_by_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_records_kind_created
ON marketing_records(kind, created_at DESC);
CREATE TABLE IF NOT EXISTS marketing_attachments (
    id BIGSERIAL PRIMARY KEY,
    record_id BIGINT NOT NULL REFERENCES marketing_records(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    file_size BIGINT NOT NULL DEFAULT 0,
    data BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketing_attachments_record
ON marketing_attachments(record_id);
"""


def _ensure_write(user: dict[str, Any]) -> None:
    if str(user.get("role") or "") not in WRITE_ROLES:
        raise PermissionError("لا يملك هذا الحساب صلاحية إنشاء سجلات أو مرفقات.")


async def _ensure_schema() -> None:
    global _SCHEMA_READY
    if _SCHEMA_READY:
        return
    async with AsyncSessionLocal() as session:
        for statement in [part.strip() for part in SCHEMA_SQL.split(";") if part.strip()]:
            await session.execute(text(statement))
        await session.commit()
    _SCHEMA_READY = True


def _iso(value: Any) -> str | None:
    if value is None:
        return None
    return value.isoformat() if hasattr(value, "isoformat") else str(value)


def _payload_dict(value: Any) -> dict[str, Any]:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {}


def _record_view(row: dict[str, Any], attachments: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    payload = _payload_dict(row.get("payload"))
    return {
        "id": int(row["id"]),
        "kind": row["kind"],
        "title": row["title"],
        "reference": payload.get("reference"),
        "client": payload.get("client"),
        "entity": payload.get("entity"),
        "city": payload.get("city"),
        "value": payload.get("value"),
        "deadline": payload.get("deadline"),
        "publication_date": payload.get("publication_date"),
        "description": payload.get("description"),
        "requirements": payload.get("requirements"),
        "source": payload.get("source") or "مصدر داخلي",
        "source_url": payload.get("source_url"),
        "status": payload.get("status") or "new",
        "current_stage": payload.get("current_stage") or "الدراسة الأولية",
        "stage_label": payload.get("current_stage") or "الدراسة الأولية",
        "probability": float(payload.get("probability") or 0),
        "owner": payload.get("owner"),
        "team": payload.get("team"),
        "created_at": _iso(row.get("created_at")),
        "updated_at": _iso(row.get("updated_at")),
        "attachments": attachments or [],
    }


async def list_records(kind: str | None = None) -> list[dict[str, Any]]:
    await _ensure_schema()
    params: dict[str, Any] = {}
    where = ""
    if kind in {"opportunity", "tender"}:
        where = "WHERE kind = :kind"
        params["kind"] = kind

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text(f"""
                SELECT id, kind, title, payload, created_at, updated_at
                FROM marketing_records
                {where}
                ORDER BY created_at DESC, id DESC
                LIMIT 500
            """),
            params,
        )
        rows = [dict(row) for row in result.mappings().all()]
        ids = [int(row["id"]) for row in rows]
        grouped: dict[int, list[dict[str, Any]]] = {}
        if ids:
            attachment_result = await session.execute(
                text("""
                    SELECT id, record_id, name, mime_type, file_size, created_at
                    FROM marketing_attachments
                    WHERE record_id = ANY(CAST(:record_ids AS BIGINT[]))
                    ORDER BY created_at DESC, id DESC
                """),
                {"record_ids": ids},
            )
            for item in attachment_result.mappings().all():
                grouped.setdefault(int(item["record_id"]), []).append({
                    "id": int(item["id"]),
                    "name": item["name"],
                    "mime_type": item["mime_type"],
                    "file_size": int(item["file_size"] or 0),
                    "created_at": _iso(item["created_at"]),
                })
    return [_record_view(row, grouped.get(int(row["id"]), [])) for row in rows]


def _decode_file_data(value: Any) -> bytes:
    raw = re.sub(r"^data:[^;]+;base64,", "", str(value or ""))
    try:
        return base64.b64decode(raw, validate=True)
    except Exception as exc:
        raise ValueError("بيانات أحد المرفقات غير صالحة.") from exc


async def create_record(payload: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    _ensure_write(user)
    await _ensure_schema()
    kind = "tender" if payload.get("kind") == "tender" else "opportunity"
    record = payload.get("record") if isinstance(payload.get("record"), dict) else {}
    title = str(record.get("title") or "").strip()
    if not title:
        raise ValueError("عنوان الفرصة أو المنافسة مطلوب.")

    value = None
    if record.get("value") not in (None, ""):
        try:
            value = float(record["value"])
        except (TypeError, ValueError):
            raise ValueError("قيمة الفرصة أو المنافسة غير صالحة.")

    metadata = {
        "reference": str(record.get("reference") or "").strip() or None,
        "client": str(record.get("client") or "").strip() or None,
        "entity": str(record.get("entity") or "").strip() or None,
        "city": str(record.get("city") or "").strip() or None,
        "value": value,
        "deadline": record.get("deadline") or None,
        "publication_date": record.get("publication_date") or None,
        "description": str(record.get("description") or "").strip() or None,
        "requirements": str(record.get("requirements") or "").strip() or None,
        "source": str(record.get("source") or "مصدر داخلي").strip(),
        "source_url": str(record.get("source_url") or "").strip() or None,
        "status": "in_progress" if kind == "tender" else "new",
        "current_stage": "الاستقبال" if kind == "tender" else "الدراسة الأولية",
        "created_by_email": user.get("email"),
        "created_by_role": user.get("role"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    files = payload.get("files") if isinstance(payload.get("files"), list) else []
    encoded_files: list[dict[str, Any]] = []
    for item in files[:MAX_FILES]:
        if not isinstance(item, dict) or not item.get("name") or not item.get("data_base64"):
            continue
        declared_size = int(item.get("size") or 0)
        if declared_size > MAX_FILE_SIZE:
            raise ValueError(f"الملف {item['name']} يتجاوز الحد المسموح.")
        data = _decode_file_data(item["data_base64"])
        if len(data) > MAX_FILE_SIZE:
            raise ValueError(f"الملف {item['name']} يتجاوز الحد المسموح.")
        encoded_files.append({
            "name": str(item["name"]),
            "mime_type": str(item.get("mime_type") or "application/octet-stream"),
            "file_size": len(data),
            "data": data,
        })

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                INSERT INTO marketing_records
                    (kind, title, payload, created_by_email, created_by_role)
                VALUES
                    (:kind, :title, CAST(:payload AS JSONB), :email, :role)
                RETURNING id, kind, title, payload, created_at, updated_at
            """),
            {
                "kind": kind,
                "title": title,
                "payload": json.dumps(metadata, ensure_ascii=False),
                "email": user.get("email"),
                "role": user.get("role"),
            },
        )
        row = dict(result.mappings().one())
        record_id = int(row["id"])
        attachment_views: list[dict[str, Any]] = []
        for item in encoded_files:
            attachment_result = await session.execute(
                text("""
                    INSERT INTO marketing_attachments
                        (record_id, name, mime_type, file_size, data)
                    VALUES
                        (:record_id, :name, :mime_type, :file_size, :data)
                    RETURNING id, name, mime_type, file_size, created_at
                """),
                {"record_id": record_id, **item},
            )
            attachment = attachment_result.mappings().one()
            attachment_views.append({
                "id": int(attachment["id"]),
                "name": attachment["name"],
                "mime_type": attachment["mime_type"],
                "file_size": int(attachment["file_size"] or 0),
                "created_at": _iso(attachment["created_at"]),
            })
        await session.commit()
    return {
        "record": _record_view(row, attachment_views),
        "attachment_ids": [item["id"] for item in attachment_views],
    }


async def download_attachment(attachment_id: Any) -> dict[str, Any]:
    await _ensure_schema()
    try:
        attachment_id = int(attachment_id)
    except (TypeError, ValueError):
        raise ValueError("معرّف الملف غير صالح.")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT a.id, a.name, a.mime_type, a.file_size, a.data
                FROM marketing_attachments a
                JOIN marketing_records r ON r.id = a.record_id
                WHERE a.id = :id
            """),
            {"id": attachment_id},
        )
        item = result.mappings().first()
    if not item:
        raise RuntimeError("الملف المطلوب غير متاح.")
    return {
        "id": int(item["id"]),
        "name": item["name"],
        "mime_type": item["mime_type"],
        "file_size": int(item["file_size"] or 0),
        "data_base64": base64.b64encode(bytes(item["data"])).decode("ascii"),
    }


async def verify_write(user: dict[str, Any]) -> dict[str, Any]:
    _ensure_write(user)
    await _ensure_schema()
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                INSERT INTO marketing_records
                    (kind, title, payload, created_by_email, created_by_role)
                VALUES
                    ('opportunity', 'ARAAK Marketing Gateway Verification',
                     '{"status":"verification","source":"فحص مؤسسي"}'::jsonb,
                     :email, :role)
                RETURNING id
            """),
            {"email": user.get("email"), "role": user.get("role")},
        )
        record_id = int(result.scalar_one())
        await session.execute(text("DELETE FROM marketing_records WHERE id = :id"), {"id": record_id})
        await session.commit()
    return {"write_verified": True, "temporary_record_id": record_id}


async def execute(payload: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    action = str(payload.get("action") or "list")
    if action == "sources":
        return {"ok": True, "sources": SOURCES}
    if action == "status":
        odoo = await get_odoo_connector().status(check=False)
        return {
            "ok": True,
            "storage": "postgresql",
            "connected": True,
            "read_only": False,
            "write_role_allowed": str(user.get("role") or "") in WRITE_ROLES,
            "odoo": {
                "enabled": bool(odoo.get("enabled")),
                "configured": bool(odoo.get("configured")),
                "connected": bool(odoo.get("connected")),
                "message": odoo.get("message"),
            },
            "message": "السجل المركزي للفرص والمنافسات يعمل عبر CEO OFFICE.",
        }
    if action == "list":
        kind = payload.get("kind") if payload.get("kind") in {"opportunity", "tender"} else None
        records = await list_records(kind)
        return {"ok": True, "records": records, "total": len(records)}
    if action == "create":
        return {"ok": True, **(await create_record(payload, user))}
    if action == "download":
        return {"ok": True, "file": await download_attachment(payload.get("attachment_id"))}
    if action == "verify_write":
        return {"ok": True, **(await verify_write(user))}
    raise ValueError("العملية المطلوبة غير مدعومة.")


__all__ = ["execute"]
