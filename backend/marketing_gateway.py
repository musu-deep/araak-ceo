"""Central Odoo records gateway used by the ARAAK Marketing & Tenders platform."""
from __future__ import annotations

import base64
import html
import json
import os
import re
from datetime import datetime, timezone
from typing import Any

try:
    from .odoo_connector import OdooConnectorError, get_odoo_connector
except ImportError:
    from odoo_connector import OdooConnectorError, get_odoo_connector

MARKER = "ARAAK_MARKETING_V1:"
CENTRAL_MODEL = os.getenv("ODOO_MARKETING_MODEL", "project.project").strip() or "project.project"
SOURCES = ["اعتماد", "فرصة", "منافس", "مناقصات", "إحالة مباشرة", "مصدر داخلي"]
MAX_FILES = max(1, int(os.getenv("ODOO_MARKETING_MAX_FILES", "5")))
MAX_FILE_SIZE = max(1024, int(os.getenv("ODOO_MARKETING_MAX_FILE_SIZE", str(3 * 1024 * 1024))))
WRITE_ROLES = {"admin", "ceo", "vp_development", "vp_investment", "dev_manager", "tracker"}


def _encode(metadata: dict[str, Any]) -> str:
    raw = json.dumps(metadata, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def _decode(description: Any) -> dict[str, Any] | None:
    match = re.search(r"ARAAK_MARKETING_V1:([A-Za-z0-9_-]+)", str(description or ""))
    if not match:
        return None
    token = match.group(1) + "=" * (-len(match.group(1)) % 4)
    try:
        value = json.loads(base64.urlsafe_b64decode(token.encode("ascii")).decode("utf-8"))
        return value if isinstance(value, dict) else None
    except Exception:
        return None


def _plain(value: Any) -> str:
    text = re.sub(r"<!--.*?-->", " ", str(value or ""), flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def _m2o_name(value: Any) -> str:
    if isinstance(value, (list, tuple)) and len(value) > 1:
        return str(value[1] or "")
    return str(value or "") if isinstance(value, str) else ""


def _created_id(value: Any) -> int | None:
    if isinstance(value, int):
        return value
    if isinstance(value, list) and value:
        if isinstance(value[0], int):
            return value[0]
        if isinstance(value[0], dict) and isinstance(value[0].get("id"), int):
            return value[0]["id"]
    if isinstance(value, dict) and isinstance(value.get("id"), int):
        return value["id"]
    return None


def _description_html(metadata: dict[str, Any]) -> str:
    marker = f"<!--{MARKER}{_encode(metadata)}-->"
    sections: list[str] = []
    for label, key in (("الوصف", "description"), ("المتطلبات", "requirements"), ("المرجع", "reference"), ("المصدر", "source")):
        if metadata.get(key):
            sections.append(f"<p><strong>{label}:</strong> {html.escape(str(metadata[key]))}</p>")
    return marker + "\n".join(sections)


def _ensure_write(user: dict[str, Any]) -> None:
    connector = get_odoo_connector()
    if str(user.get("role") or "") not in WRITE_ROLES:
        raise PermissionError("لا يملك هذا الحساب صلاحية إنشاء سجلات أو مرفقات.")
    if connector.config.read_only:
        raise PermissionError("تكامل Odoo مضبوط على القراءة فقط؛ فعّل الكتابة المعتمدة على الخادم أولاً.")


def _attachment_view(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": int(row["id"]),
        "name": str(row.get("name") or "ملف"),
        "mime_type": str(row.get("mimetype") or "application/octet-stream"),
        "file_size": int(row.get("file_size") or 0),
        "created_at": row.get("create_date"),
    }


def _record_view(row: dict[str, Any], attachments: dict[int, list[dict[str, Any]]]) -> dict[str, Any]:
    metadata = _decode(row.get("description")) or {}
    row_id = int(row["id"])
    kind = "tender" if metadata.get("kind") == "tender" else "opportunity"
    return {
        "id": row_id,
        "kind": kind,
        "title": str(row.get("name") or ""),
        "reference": metadata.get("reference"),
        "client": metadata.get("client"),
        "entity": metadata.get("entity"),
        "city": metadata.get("city"),
        "value": metadata.get("value"),
        "deadline": metadata.get("deadline"),
        "publication_date": metadata.get("publication_date"),
        "description": metadata.get("description") or _plain(row.get("description")),
        "requirements": metadata.get("requirements"),
        "source": metadata.get("source") or "مصدر داخلي",
        "source_url": metadata.get("source_url"),
        "status": metadata.get("status") or ("cancelled" if row.get("active") is False else "active"),
        "current_stage": metadata.get("current_stage") or "الاستقبال",
        "stage_label": metadata.get("current_stage") or "الاستقبال",
        "probability": float(metadata.get("probability") or 0),
        "owner": _m2o_name(row.get("user_id")) or None,
        "team": _m2o_name(row.get("company_id")) or None,
        "created_at": row.get("create_date"),
        "updated_at": row.get("write_date"),
        "attachments": attachments.get(row_id, []),
    }


async def list_records(kind: str | None = None) -> list[dict[str, Any]]:
    connector = get_odoo_connector()
    rows = await connector.compatible_search_read(
        CENTRAL_MODEL,
        [["description", "ilike", MARKER]],
        ["id", "name", "description", "active", "create_date", "write_date", "user_id", "company_id"],
        250,
        "create_date desc, id desc",
    )
    ids = [int(row["id"]) for row in rows if row.get("id")]
    grouped: dict[int, list[dict[str, Any]]] = {}
    if ids:
        attachments = await connector.compatible_search_read(
            "ir.attachment",
            [["res_model", "=", CENTRAL_MODEL], ["res_id", "in", ids]],
            ["id", "name", "mimetype", "file_size", "create_date", "res_id"],
            1000,
            "create_date desc, id desc",
        )
        for item in attachments:
            grouped.setdefault(int(item.get("res_id") or 0), []).append(_attachment_view(item))
    records = [_record_view(row, grouped) for row in rows]
    return [record for record in records if not kind or record["kind"] == kind]


async def _create_central(values: dict[str, Any]) -> int:
    record_id = _created_id(await get_odoo_connector().call(CENTRAL_MODEL, "create", [[values]], {}))
    if not record_id:
        raise RuntimeError("لم يُرجع Odoo رقمًا صالحًا للسجل الجديد.")
    return record_id


async def _unlink_central(record_id: int) -> None:
    await get_odoo_connector().call(CENTRAL_MODEL, "unlink", [[record_id]], {})


async def _create_attachment(values: dict[str, Any]) -> int | None:
    return _created_id(await get_odoo_connector().call("ir.attachment", "create", [[values]], {}))


async def _read(model: str, ids: list[int], fields: list[str]) -> list[dict[str, Any]]:
    result = await get_odoo_connector().call(model, "read", [ids], {"fields": fields, "load": None})
    return result if isinstance(result, list) else []


async def create_record(payload: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    _ensure_write(user)
    kind = "tender" if payload.get("kind") == "tender" else "opportunity"
    record = payload.get("record") if isinstance(payload.get("record"), dict) else {}
    title = str(record.get("title") or "").strip()
    if not title:
        raise ValueError("عنوان الفرصة أو المنافسة مطلوب.")
    try:
        value = float(record["value"]) if record.get("value") else None
    except (TypeError, ValueError):
        raise ValueError("قيمة الفرصة أو المنافسة غير صالحة.")

    metadata = {
        "kind": kind,
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
    record_id = await _create_central({"name": title, "description": _description_html(metadata)})

    attachment_ids: list[int] = []
    try:
        files = payload.get("files") if isinstance(payload.get("files"), list) else []
        for item in files[:MAX_FILES]:
            if not isinstance(item, dict) or not item.get("name") or not item.get("data_base64"):
                continue
            if int(item.get("size") or 0) > MAX_FILE_SIZE:
                raise ValueError(f"الملف {item['name']} يتجاوز الحد المسموح.")
            attachment_id = await _create_attachment({
                "name": str(item["name"]),
                "type": "binary",
                "datas": re.sub(r"^data:[^;]+;base64,", "", str(item["data_base64"])),
                "mimetype": str(item.get("mime_type") or "application/octet-stream"),
                "res_model": CENTRAL_MODEL,
                "res_id": record_id,
                "public": False,
            })
            if attachment_id:
                attachment_ids.append(attachment_id)
    except Exception:
        try:
            await _unlink_central(record_id)
        finally:
            raise

    records = await list_records(kind)
    return {
        "record": next((row for row in records if row["id"] == record_id), {"id": record_id, "kind": kind, "title": title}),
        "attachment_ids": attachment_ids,
    }


async def download_attachment(attachment_id: Any) -> dict[str, Any]:
    try:
        attachment_id = int(attachment_id)
    except (TypeError, ValueError):
        raise ValueError("معرّف الملف غير صالح.")
    rows = await _read("ir.attachment", [attachment_id], ["id", "name", "mimetype", "datas", "file_size", "res_model", "res_id"])
    item = rows[0] if rows else None
    if not item or item.get("res_model") != CENTRAL_MODEL:
        raise RuntimeError("الملف المطلوب غير متاح.")
    parents = await _read(CENTRAL_MODEL, [int(item["res_id"])], ["id", "description"])
    parent = parents[0] if parents else None
    if not parent or not _decode(parent.get("description")):
        raise RuntimeError("الملف غير مرتبط بسجل مسموح.")
    return {
        "id": int(item["id"]),
        "name": str(item.get("name") or "file"),
        "mime_type": str(item.get("mimetype") or "application/octet-stream"),
        "file_size": int(item.get("file_size") or 0),
        "data_base64": str(item.get("datas") or ""),
    }


async def verify_write(user: dict[str, Any]) -> dict[str, Any]:
    _ensure_write(user)
    metadata = {
        "kind": "opportunity",
        "status": "verification",
        "source": "فحص مؤسسي",
        "created_by_email": user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    record_id = await _create_central({"name": "ARAAK Marketing Gateway Verification", "description": _description_html(metadata)})
    try:
        return {"write_verified": True, "temporary_record_id": record_id}
    finally:
        await _unlink_central(record_id)


async def execute(payload: dict[str, Any], user: dict[str, Any]) -> dict[str, Any]:
    action = str(payload.get("action") or "list")
    if action == "sources":
        return {"ok": True, "sources": SOURCES}
    if action == "status":
        connector = get_odoo_connector()
        state = await connector.status(check=True)
        return {
            "ok": True,
            "configured": bool(connector.config.configured),
            "connected": bool(state.get("connected")),
            "read_only": bool(connector.config.read_only),
            "write_role_allowed": str(user.get("role") or "") in WRITE_ROLES,
            "model": CENTRAL_MODEL,
            "message": state.get("message"),
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


__all__ = ["OdooConnectorError", "execute"]
