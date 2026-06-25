import asyncio

from database_pg import engine, Base
from models_pg import *

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("SUCCESS: PostgreSQL tables created.")

if __name__ == "__main__":
    asyncio.run(create_tables())
