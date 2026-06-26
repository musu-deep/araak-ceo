from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import bcrypt
import jwt as pyjwt
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import text
from database_pg import AsyncSessionLocal
from pydantic import BaseModel, EmailStr

# ---------------- Config ----------------
JWT_ALGORITHM = "HS256"
JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")

def _cors_origins():
    raw = os.getenv(
        "CORS_ORIGINS",
        "https://araak-ceo.vercel.app,http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("arak")
logger.info("CORS_ORIGINS=%s", _cors_origins())

# ---------------- DB ----------------
USE_MONGO = os.getenv("USE_MONGO", "false").lower() == "true"

client = None
db = None

if USE_MONGO:
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.getenv("DB_NAME", "arak_executive_platform")]

# ---------------- App ----------------
app = FastAPI(title="Arak Executive Platform")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

api_router = APIRouter(prefix="/api")

# ---------------- Roles & Sectors ----------------
DEV_SECTORS = ["development", "arak_development", "academy", "digital", "corporate"]

def role_sector_filter(role: str) -> Optional[dict]:
    if role in ("admin", "ceo", "tracker"):
        return None
    if role == "vp_development":
        return {"sector": {"$in": DEV_SECTORS}}
    if role == "vp_investment":
        return {"sector": "investment"}
    if role == "dev_manager":
        return {"sector": "arak_development"}
    return {"_id": "__never__"}

def can_manage_users(role: str) -> bool:
    return role == "admin"

# ---------------- Password & JWT helpers ----------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ---------------- Auth Dependency ----------------
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")

    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")

        async with AsyncSessionLocal() as session:
            result = await session.execute(
                text("""
                    SELECT id, email, name, role, created_at
                    FROM users
                    WHERE id = :id
                """),
                {"id": int(payload["sub"])},
            )
            row = result.mappings().first()

        if not row:
            raise HTTPException(status_code=401, detail="User not found")

        return {
            "id": str(row["id"]),
            "email": row["email"],
            "name": row["name"],
            "role": row["role"],
            "active": True,
            "title": "",
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        }

    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_roles(*roles):
    async def _dep(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user

    return _dep

# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["admin", "ceo", "vp_development", "vp_investment", "dev_manager", "tracker"]
    title: Optional[str] = ""
    active: bool = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    title: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = None

class ProjectInput(BaseModel):
    name: str
    description: Optional[str] = ""
    sector: Literal["development", "investment", "arak_development", "academy", "digital", "corporate"]
    owner_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    progress: int = 0
    status: Literal["planning", "active", "on_hold", "completed", "cancelled"] = "active"
    budget: Optional[float] = 0
    priority: Literal["low", "medium", "high", "critical"] = "medium"

class TaskInput(BaseModel):
    title: str
    description: Optional[str] = ""
    project_id: Optional[str] = None
    sector: Literal["development", "investment", "arak_development", "academy", "digital", "corporate"]
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Literal["low", "medium", "high", "critical"] = "medium"
    status: Literal["pending", "in_progress", "awaiting_approval", "delayed", "completed", "cancelled"] = "pending"
    progress: int = 0

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    progress: Optional[int] = None

class ProgressUpdateInput(BaseModel):
    project_id: str
    update_type: Literal["progress", "milestone", "issue", "report", "note"]
    content: str
    progress: Optional[int] = None

# ---------------- Helpers ----------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    return str(uuid.uuid4())

def calc_rag(project: dict) -> str:
    if project.get("status") == "completed":
        return "green"

    if project.get("status") == "cancelled":
        return "gray"

    progress = project.get("progress", 0)
    end_date_str = project.get("end_date")

    if not end_date_str:
        if progress >= 70:
            return "green"
        if progress >= 40:
            return "amber"
        return "red"

    try:
        end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days_left = (end_date - now).days

        if days_left < 0 and progress < 100:
            return "red"
        if days_left < 7 and progress < 80:
            return "amber"
        if progress >= 70:
            return "green"
        if progress >= 40:
            return "amber"
        return "red"

    except Exception:
        return "amber"

def set_cookies(response: Response, access: str, refresh: str):
    secure_cookies = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    same_site = os.getenv("COOKIE_SAMESITE", "lax")

    response.set_cookie(
        "access_token",
        access,
        httponly=True,
        secure=secure_cookies,
        samesite=same_site,
        max_age=12 * 3600,
        path="/",
    )

    response.set_cookie(
        "refresh_token",
        refresh,
        httponly=True,
        secure=secure_cookies,
        samesite=same_site,
        max_age=7 * 86400,
        path="/",
    )

# ---------------- Auth Endpoints ----------------
@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT id, email, name, role, password_hash, created_at
                FROM users
                WHERE email = :email
            """),
            {"email": email},
        )
        user = result.mappings().first()

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")

    access = create_access_token(str(user["id"]), email, user["role"])
    refresh = create_refresh_token(str(user["id"]))

    set_cookies(response, access, refresh)

    user_out = {
        "id": str(user["id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "active": True,
        "title": "",
        "created_at": user["created_at"].isoformat() if user["created_at"] else None,
    }

    return {"user": user_out, "access_token": access}

@api_router.post("/auth/logout")
async def logout(response: Response, user=Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}

@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return {"user": user}

# ---------------- Users ----------------
@api_router.get("/users")
async def list_users(user=Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT id, email, name, role, created_at
                FROM users
                ORDER BY id ASC
            """)
        )
        rows = result.mappings().all()

    return [
        {
            "id": str(row["id"]),
            "email": row["email"],
            "name": row["name"],
            "role": row["role"],
            "active": True,
            "title": "",
            "created_at": row["created_at"].isoformat() if row["created_at"] else None,
        }
        for row in rows
    ]

@api_router.post("/users")
async def create_user(payload: UserCreate, admin=Depends(require_roles("admin"))):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    email = payload.email.lower()

    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="البريد مستخدم مسبقاً")

    doc = {
        "id": new_id(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "role": payload.role,
        "title": payload.title or "",
        "active": payload.active,
        "created_at": now_iso(),
    }

    await db.users.insert_one(doc)

    return {k: v for k, v in doc.items() if k not in ("password_hash", "_id")}

@api_router.patch("/users/{user_id}")
async def update_user(user_id: str, payload: UserUpdate, admin=Depends(require_roles("admin"))):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}

    if "password" in updates:
        updates["password_hash"] = hash_password(updates.pop("password"))

    if not updates:
        return {"ok": True}

    await db.users.update_one({"id": user_id}, {"$set": updates})

    u = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})

    return u

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(require_roles("admin"))):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    await db.users.update_one({"id": user_id}, {"$set": {"active": False}})

    return {"ok": True}

# ---------------- Projects ----------------
@api_router.get("/projects")
async def list_projects(user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        return []

    flt = role_sector_filter(user["role"]) or {}

    projects = await db.projects.find(flt, {"_id": 0}).sort("created_at", -1).to_list(500)

    for p in projects:
        p["rag"] = calc_rag(p)

    return projects

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=404, detail="Project not found")

    p = await db.projects.find_one({"id": project_id}, {"_id": 0})

    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    flt = role_sector_filter(user["role"])

    if flt is not None:
        allowed = True

        if "$in" in (flt.get("sector") or {}):
            allowed = p.get("sector") in flt["sector"]["$in"]
        elif flt.get("sector"):
            allowed = p.get("sector") == flt["sector"]

        if not allowed:
            raise HTTPException(status_code=403, detail="Forbidden")

    p["rag"] = calc_rag(p)

    return p

@api_router.post("/projects")
async def create_project(payload: ProjectInput, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_by"] = user["id"]
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()

    if not doc.get("owner_id"):
        doc["owner_id"] = user["id"]

    await db.projects.insert_one(doc)

    doc["rag"] = calc_rag(doc)
    doc.pop("_id", None)

    return doc

@api_router.patch("/projects/{project_id}")
async def update_project(project_id: str, payload: dict, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    payload["updated_at"] = now_iso()

    await db.projects.update_one({"id": project_id}, {"$set": payload})

    p = await db.projects.find_one({"id": project_id}, {"_id": 0})

    if p:
        p["rag"] = calc_rag(p)

    return p

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(require_roles("admin", "ceo"))):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    await db.projects.delete_one({"id": project_id})
    await db.tasks.delete_many({"project_id": project_id})

    return {"ok": True}

# ---------------- Tasks ----------------
@api_router.get("/tasks")
async def list_tasks(user=Depends(get_current_user), project_id: Optional[str] = None):
    if not USE_MONGO or db is None:
        return []

    flt = role_sector_filter(user["role"]) or {}

    if project_id:
        flt["project_id"] = project_id

    tasks = await db.tasks.find(flt, {"_id": 0}).sort("created_at", -1).to_list(1000)

    return tasks

@api_router.post("/tasks")
async def create_task(payload: TaskInput, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_by"] = user["id"]
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()

    await db.tasks.insert_one(doc)

    doc.pop("_id", None)

    return doc

@api_router.patch("/tasks/{task_id}")
async def update_task(task_id: str, payload: TaskUpdate, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    updates["updated_at"] = now_iso()

    await db.tasks.update_one({"id": task_id}, {"$set": updates})

    t = await db.tasks.find_one({"id": task_id}, {"_id": 0})

    return t

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    await db.tasks.delete_one({"id": task_id})

    return {"ok": True}

@api_router.post("/tasks/{task_id}/approve")
async def approve_task(task_id: str, user=Depends(require_roles("admin", "ceo", "vp_development", "vp_investment"))):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    await db.tasks.update_one(
        {"id": task_id},
        {
            "$set": {
                "status": "completed",
                "approved_by": user["id"],
                "approved_at": now_iso(),
                "updated_at": now_iso(),
            }
        },
    )

    t = await db.tasks.find_one({"id": task_id}, {"_id": 0})

    return t

# ---------------- Progress Updates ----------------
@api_router.get("/progress")
async def list_progress(user=Depends(get_current_user), project_id: Optional[str] = None):
    if not USE_MONGO or db is None:
        return []

    q = {"project_id": project_id} if project_id else {}

    items = await db.progress_updates.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)

    return items

@api_router.post("/progress")
async def create_progress(payload: ProgressUpdateInput, user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        raise HTTPException(status_code=503, detail="MongoDB is disabled for this endpoint")

    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["user_id"] = user["id"]
    doc["user_name"] = user.get("name")
    doc["created_at"] = now_iso()

    await db.progress_updates.insert_one(doc)

    if payload.progress is not None:
        await db.projects.update_one(
            {"id": payload.project_id},
            {"$set": {"progress": payload.progress, "updated_at": now_iso()}},
        )

    doc.pop("_id", None)

    return doc

# ---------------- Dashboard ----------------
@api_router.get("/dashboard")
async def dashboard(user=Depends(get_current_user)):
    if not USE_MONGO or db is None:
        return {
            "totals": {
                "projects": 0,
                "active_projects": 0,
                "completed_projects": 0,
                "tasks": 0,
                "overdue_tasks": 0,
                "avg_progress": 0,
                "total_budget": 0,
            },
            "rag": {"red": 0, "amber": 0, "green": 0, "gray": 0},
            "by_sector": [],
            "task_status": {},
            "recent_projects": [],
        }

    flt = role_sector_filter(user["role"]) or {}

    projects = await db.projects.find(flt, {"_id": 0}).to_list(500)
    tasks = await db.tasks.find(flt, {"_id": 0}).to_list(2000)

    for p in projects:
        p["rag"] = calc_rag(p)

    rag_count = {"red": 0, "amber": 0, "green": 0, "gray": 0}

    for p in projects:
        rag_count[p["rag"]] = rag_count.get(p["rag"], 0) + 1

    by_sector = {}

    for p in projects:
        s = p.get("sector", "other")
        by_sector.setdefault(s, {"count": 0, "progress_sum": 0})
        by_sector[s]["count"] += 1
        by_sector[s]["progress_sum"] += p.get("progress", 0)

    sector_stats = [
        {
            "sector": k,
            "count": v["count"],
            "avg_progress": round(v["progress_sum"] / max(v["count"], 1)),
        }
        for k, v in by_sector.items()
    ]

    task_status = {}

    for t in tasks:
        s = t.get("status", "pending")
        task_status[s] = task_status.get(s, 0) + 1

    avg_progress = round(sum(p.get("progress", 0) for p in projects) / max(len(projects), 1))
    total_budget = sum(p.get("budget", 0) or 0 for p in projects)
    completed_projects = sum(1 for p in projects if p.get("status") == "completed")
    active_projects = sum(1 for p in projects if p.get("status") == "active")

    overdue = 0
    now = datetime.now(timezone.utc)

    for t in tasks:
        if t.get("status") in ("completed", "cancelled"):
            continue

        if t.get("due_date"):
            try:
                d = datetime.fromisoformat(t["due_date"].replace("Z", "+00:00"))
                if d < now:
                    overdue += 1
            except Exception:
                pass

    return {
        "totals": {
            "projects": len(projects),
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "tasks": len(tasks),
            "overdue_tasks": overdue,
            "avg_progress": avg_progress,
            "total_budget": total_budget,
        },
        "rag": rag_count,
        "by_sector": sector_stats,
        "task_status": task_status,
        "recent_projects": sorted(projects, key=lambda x: x.get("updated_at", ""), reverse=True)[:5],
    }

# ---------------- Seed ----------------
SEED_USERS = [
    {
        "email": "admin@arak.com",
        "password": "Arak@2026",
        "name": "مدير النظام",
        "role": "admin",
        "title": "System Administrator",
    },
    {
        "email": "ceo@arak.com",
        "password": "Arak@2026",
        "name": "د. علي العتيبي",
        "role": "ceo",
        "title": "الرئيس التنفيذي - مجموعة أراك",
    },
    {
        "email": "vp.dev@arak.com",
        "password": "Arak@2026",
        "name": "نائب الرئيس - التنمية",
        "role": "vp_development",
        "title": "نائب الرئيس التنفيذي لقطاع التنمية",
    },
    {
        "email": "vp.invest@arak.com",
        "password": "Arak@2026",
        "name": "نائب الرئيس - الاستثمار",
        "role": "vp_investment",
        "title": "نائب الرئيس التنفيذي لقطاع الاستثمار",
    },
    {
        "email": "dev.manager@arak.com",
        "password": "Arak@2026",
        "name": "مدير أراك التنمية - مصر",
        "role": "dev_manager",
        "title": "مدير قطاع التنمية - مكتب أراك مصر",
    },
    {
        "email": "tracker@arak.com",
        "password": "Arak@2026",
        "name": "مسؤول المتابعة التنفيذية",
        "role": "tracker",
        "title": "مسؤول المتابعة التنفيذية",
    },
]

SEED_PROJECTS = [
    {
        "name": "تطوير أكاديمية أراك",
        "description": "إطلاق أكاديمية تدريبية متخصصة في الإدارة التنفيذية",
        "sector": "academy",
        "progress": 65,
        "status": "active",
        "budget": 1500000,
        "priority": "high",
        "end_date": (datetime.now(timezone.utc) + timedelta(days=45)).isoformat(),
    },
    {
        "name": "التحول الرقمي للمجموعة",
        "description": "أتمتة العمليات وتطبيق منصات السحابة في كافة الفروع",
        "sector": "digital",
        "progress": 42,
        "status": "active",
        "budget": 2800000,
        "priority": "critical",
        "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
    },
]

@app.on_event("startup")
async def seed_data():
    if not USE_MONGO or db is None:
        logger.info("MongoDB disabled: skipping MongoDB seed")
        return

    await db.users.create_index("email", unique=True)
    await db.projects.create_index("sector")
    await db.tasks.create_index("project_id")

    logger.info("MongoDB seed complete")

@app.on_event("shutdown")
async def shutdown():
    if USE_MONGO and client is not None:
        client.close()

@api_router.get("/")
async def root():
    return {"message": "Arak Executive Platform API"}

# Import extensions before mounting the router so all routes are registered once.
try:
    from . import arak_extensions  # noqa: F401
except ImportError:
    import arak_extensions  # noqa: F401

# ---------------- Mount ----------------
app.include_router(api_router)
