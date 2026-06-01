# models.py
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON, TIMESTAMP


class Trip_Plan(SQLModel, table=True):
    __tablename__ = "trip_plan"

    id: int = Field(default=None, primary_key=True, index=True)
    user_id: str = Field(default="anonymous_user", index=True)
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
