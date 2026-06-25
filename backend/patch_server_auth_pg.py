from pathlib import Path

p = Path("server.py")
s = p.read_text(encoding="utf-8")

# 1) Add SQLAlchemy text + PostgreSQL session import
s = s.replace(
    "from motor.motor_asyncio import AsyncIOMotorClient\nfrom pydantic import BaseModel, Field, EmailStr",
    "from motor.motor_asyncio import AsyncIOMotorClient\nfrom sqlalchemy import text\nfrom database_pg import AsyncSessionLocal\nfrom pydantic import BaseModel, Field, EmailStr"
)

# 2) Replace get_current_user body
start = s.index("async def get_current_user(request: Request) -> dict:")
end = s.index("\ndef require_roles", start)

new_get_current_user = r'''async def get_current_user(request: Request) -> dict:
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
                {"id": int(payload["sub"])}
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
'''

s = s[:start] + new_get_current_user + s[end:]

# 3) Replace login endpoint
start = s.index('@api_router.post("/auth/login")')
end = s.index('\n@api_router.post("/auth/logout")', start)

new_login = r'''@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("""
                SELECT id, email, name, role, password_hash, created_at
                FROM users
                WHERE email = :email
            """),
            {"email": email}
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
'''

s = s[:start] + new_login + s[end:]

# 4) Disable Mongo seed when PostgreSQL is selected
s = s.replace(
    'async def seed_data():\n    await db.users.create_index("email", unique=True)',
    'async def seed_data():\n    if os.getenv("DB_PROVIDER") == "postgresql":\n        logger.info("PostgreSQL mode: skipping MongoDB seed")\n        return\n    await db.users.create_index("email", unique=True)'
)

# 5) Avoid closing Mongo client in PostgreSQL mode
s = s.replace(
    'async def shutdown():\n    client.close()',
    'async def shutdown():\n    if os.getenv("DB_PROVIDER") != "postgresql":\n        client.close()'
)

p.write_text(s, encoding="utf-8")
print("SUCCESS: server.py patched for PostgreSQL auth.")
