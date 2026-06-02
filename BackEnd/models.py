from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON, TIMESTAMP


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True, index=True)
    username: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(timezone.utc),
        )
    )

    trip_plans: List["Trip_Plan"] = Relationship(back_populates="user")




class Trip_Plan(SQLModel, table=True):
    __tablename__ = "trip_plan"

    id: int | None = Field(default=None, primary_key=True, index=True)

    location: str = Field(nullable=False)
    title: str = Field(nullable=False)
    overview: str = Field(nullable=False)
    custom_tips: List[str] = Field(sa_type=JSON, nullable=False)
    itinerary: List[Dict[str, Any]] = Field(sa_type=JSON, nullable=False)

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            default=lambda: datetime.now(timezone.utc),
            nullable=False,
        )
    )

    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)

    user: User = Relationship(back_populates="trip_plans")



class BlacklistedToken(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    blacklisted_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(timezone.utc),
        )
    )
