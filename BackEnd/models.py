from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON, TIMESTAMP, Text
from pydantic import EmailStr


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True, index=True)
    username: EmailStr = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    nickname: str = Field(
        default="",
        unique=True,
        index=True,
    )
    is_active: bool = Field(default=True)

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(timezone.utc),
        )
    )

    trip_plans: List["Trip_Plan"] = Relationship(back_populates="user")

    ask_location: List["Ask_Location"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    feedbacks: List["User_Feedback"] = Relationship(back_populates="user")


########################################


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


########################################


class Ask_Location(SQLModel, table=True):
    __tablename__ = "ask_location"

    id: int | None = Field(default=None, primary_key=True, index=True)

    keyword: str = Field(nullable=False, index=True, description="유저가 검색한 여행지")

    content: str = Field(
        sa_column=Column(Text, nullable=False),
        description="맞춤 여행 정보",
    )

    image_url: str | None = Field(
        default=None, description="구글 맵에서 매칭된 실사 이미지 URL"
    )

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(timezone.utc),
        )
    )

    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    user: User = Relationship(back_populates="ask_location")


########################################


class User_Feedback(SQLModel, table=True):
    __tablename__ = "user_feedbacks"

    id: int | None = Field(default=None, primary_key=True, index=True)

    content: str = Field(
        sa_column=Column(Text, nullable=False),
        description="유저가 작성한 앱 서비스 이용후기 및 피드백 내용",
    )

    created_at: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=False,
            default=lambda: datetime.now(timezone.utc),
        )
    )

    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)

    user: "User" = Relationship()


##############################################


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


