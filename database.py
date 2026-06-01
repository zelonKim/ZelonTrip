from typing import Annotated
from sqlmodel import SQLModel
from fastapi import Depends
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker


DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_MiXQbZf9VDC4@ep-shiny-darkness-aoj4b0ur-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?ssl=require"


engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=600,
    connect_args={"statement_cache_size": 0},
)

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_db_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_db():
    async with async_session_factory() as session:
        yield session


SessionDep = Annotated[AsyncSession, Depends(get_db)]
