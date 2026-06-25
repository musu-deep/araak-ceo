import asyncio
import bcrypt
from sqlalchemy import text
from database_pg import engine

PASSWORD = "Arak@2026"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

async def main():
    password_hash = hash_password(PASSWORD)

    async with engine.begin() as conn:
        await conn.execute(
            text("UPDATE users SET password_hash = :password_hash"),
            {"password_hash": password_hash}
        )

    print("SUCCESS: All users password reset to Arak@2026")

if __name__ == "__main__":
    asyncio.run(main())
