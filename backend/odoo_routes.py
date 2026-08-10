"""Odoo + ARAAK Marketing routes registered inside the existing CEO API router."""
from __future__ import annotations

from typing import Any

from fastapi import Depends, HTTPException
from sqlalchemy import text

try:
    from .server import api_router, get_current_user, require_roles
    from .database_pg import AsyncSessionLocal
    from .odoo_connector import OdooConnectorError, get_odoo_connector
    from .marketing_gateway import execute as execute_marketing
except ImportError:
    from server import api_router, get_current_user, require_roles
    from database_pg import AsyncSessionLocal
    from odoo_connector import OdooConnectorError, get_odoo_connector
    from marketing_gateway import execute as execute_marketing

EMPLOYEE_FIELDS = [
    "id", "name", "active", "work_email", "work_phone", "mobile_phone",
    "department_id", "job_id", "parent_id", "coach_id", "company_id",
    "work_location_id", "employee_type", "barcode", "first_contract_date",
    "create_date", "write_date",
]
PROJECT_FIELDS = [
    "id", "name", "description", "active", "company_id", "user_id",
    "date_start", "date", "stage_id", "create_date", "write_date",
]
TASK_FIELDS = [
    "id", "name", "description", "active", "project_id", "company_id",
    "user_ids", "date_deadline", "stage_id", "priority", "kanban_state",
    "create_date", "write_date",
]


def _m2o_id(value: Any) -> int | None:
    if isinstance(value, (list, tuple)) and value:
        try:
            return int(value[0])
        except (TypeError, ValueError):
            return None
    return value if isinstance(value, int) else None


def _m2o_name(value: Any) -> str:
    if isinstance(value, (list, tuple)) and len(value) > 1:
        return str(value[1] or "")
    return str(value or "") if isinstance(value, str) else ""


def _role_from_title(title: str, email: str = "") -> str:
    value = str(title or "").lower()
    email_value = str(email or "").lower()
    if "admin" in email_value or any(token in value for token in ("تقنية", "نظام", "منصة")):
        return "admin"
    if "الرئيس التنفيذي" in value and "نائب" not in value:
        return "ceo"
    if "نائب" in value and "تنمية" in value:
        return "vp_development"
    if "نائب" in value and any(token in value for token in ("استثمار", "محافظ")):
        return "vp_investment"
    if any(token in value for token in ("متابعة", "سكرتارية")):
        return "tracker"
    return "dev_manager"


def _employee(record: dict[str, Any]) -> dict[str, Any]:
    employee_id = int(record.get("id") or 0)
    title = _m2o_name(record.get("job_id"))
    email = str(record.get("work_email") or "").strip()
    name = record.get("name") or f"Employee {employee_id}"
    return {
        "id": f"odoo-employee-{employee_id}",
        "odoo_id": employee_id,
        "source": "odoo",
        "employee_number": record.get("barcode") or f"ODOO-{employee_id}",
        "name": name,
        "full_name": name,
        "email": email,
        "work_email": email,
        "work_phone": record.get("work_phone") or "",
        "mobile_phone": record.get("mobile_phone") or "",
        "title": title,
        "job_title": title,
        "department": _m2o_name(record.get("department_id")),
        "department_id": _m2o_id(record.get("department_id")),
        "manager": _m2o_name(record.get("parent_id")),
        "manager_id": _m2o_id(record.get("parent_id")),
        "coach": _m2o_name(record.get("coach_id")),
        "entity": _m2o_name(record.get("company_id")),
        "location": _m2o_name(record.get("work_location_id")),
        "employee_type": record.get("employee_type") or "employee",
        "hire_date": record.get("first_contract_date") or record.get("create_date"),
        "active": bool(record.get("active", True)),
        "role": _role_from_title(title, email),
        "created_at": record.get("create_date"),
        "updated_at": record.get("write_date"),
    }


async def _platform_fallback() -> list[dict[str, Any]]:
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT id, email, name, role, created_at FROM users ORDER BY name ASC, id ASC"))
        rows = result.mappings().all()
    return [
        {
            "id": str(row["id"]),
            "odoo_id": None,
            "source": "platform",
            "employee_number": str(row["id"]),
            "name": row["name"],
            "full_name": row["name"],
            "email": row["email"],
            "work_email": row["email"],
            "work_phone": "",
            "mobile_phone": "",
            "title": "",
            "job_title": "",
            "department": "",
            "department_id": None,
            "manager": "",
            "manager_id": None,
            "coach": "",
            "entity": "مجموعة اراك للتنمية",
            "location": "",
            "employee_type": "employee",
            "hire_date": row["created_at"].isoformat() if row["created_at"] else None,
            "active": True,
            "role": row["role"],
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            "updated_at": None,
        }
        for row in rows
    ]


@api_router.get("/odoo/status")
async def odoo_status(user=Depends(get_current_user)):
    return await get_odoo_connector().status(check=False)


@api_router.post("/odoo/test")
async def odoo_test(user=Depends(require_roles("admin", "ceo"))):
    return await get_odoo_connector(refresh=True).status(check=True)


@api_router.get("/odoo/projects")
async def odoo_projects(user=Depends(get_current_user)):
    try:
        records = await get_odoo_connector().compatible_search_read(
            "project.project", [], PROJECT_FIELDS, 500, "write_date desc, id desc"
        )
        return {"source": "odoo", "projects": records, "total": len(records)}
    except OdooConnectorError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@api_router.get("/odoo/tasks")
async def odoo_tasks(user=Depends(get_current_user)):
    try:
        records = await get_odoo_connector().compatible_search_read(
            "project.task", [], TASK_FIELDS, 1500, "write_date desc, id desc"
        )
        return {"source": "odoo", "tasks": records, "total": len(records)}
    except OdooConnectorError as exc:
        raise HTTPException(status_code=503, detail=str(exc))


@api_router.get("/employees")
async def employee_directory(user=Depends(get_current_user)):
    try:
        rows = await get_odoo_connector().compatible_search_read(
            "hr.employee", [], EMPLOYEE_FIELDS, 1000, "name asc, id asc"
        )
        employees = [_employee(row) for row in rows]
        return {
            "source": "odoo",
            "employees": employees,
            "total": len(employees),
            "warning": None,
            "compensation_visible": False,
        }
    except Exception as exc:
        employees = await _platform_fallback()
        return {
            "source": "platform",
            "employees": employees,
            "total": len(employees),
            "warning": f"Odoo unavailable: {str(exc)[:220]}",
            "compensation_visible": False,
        }


@api_router.post("/marketing")
async def marketing_gateway(payload: dict, user=Depends(get_current_user)):
    try:
        return await execute_marketing(payload, user)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except (OdooConnectorError, RuntimeError) as exc:
        raise HTTPException(status_code=503, detail=str(exc))
