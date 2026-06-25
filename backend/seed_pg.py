import asyncio
import bcrypt
from sqlalchemy import text
from database_pg import engine

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

USERS = [
    ("admin@arak.com", "Arak@2026", "مدير النظام", "admin", "System Administrator"),
    ("ceo@arak.com", "Arak@2026", "د. علي العتيبي", "ceo", "الرئيس التنفيذي - مجموعة أراك"),
    ("vp.dev@arak.com", "Arak@2026", "نائب الرئيس - التنمية", "vp_development", "نائب الرئيس التنفيذي لقطاع التنمية"),
    ("vp.invest@arak.com", "Arak@2026", "نائب الرئيس - الاستثمار", "vp_investment", "نائب الرئيس التنفيذي لقطاع الاستثمار"),
    ("dev.manager@arak.com", "Arak@2026", "مدير أراك التنمية - مصر", "dev_manager", "مدير قطاع التنمية - مكتب أراك مصر"),
    ("tracker@arak.com", "Arak@2026", "مسؤول المتابعة التنفيذية", "tracker", "مسؤول المتابعة التنفيذية"),
]

async def seed():
    async with engine.begin() as conn:
        for email, password, name, role, title in USERS:
            result = await conn.execute(
                text("SELECT id FROM users WHERE email = :email"),
                {"email": email}
            )
            exists = result.fetchone()

            if not exists:
                await conn.execute(
                    text("""
                        INSERT INTO users (email, password_hash, name, role, created_at)
                        VALUES (:email, :password_hash, :name, :role, NOW())
                    """),
                    {
                        "email": email,
                        "password_hash": hash_password(password),
                        "name": name,
                        "role": role,
                    }
                )

    print("SUCCESS: PostgreSQL seed users created.")

if __name__ == "__main__":
    asyncio.run(seed())
