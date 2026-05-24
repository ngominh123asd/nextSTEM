import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT false NOT NULL"))
            print("Added column successfully")
        except Exception as e:
            print("Error:", e)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
