from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

# class MBTIType(str, Enum):
#     ISTJ = "ISTJ"
#     ISFJ = "ISFJ"
#     INFJ = "INFJ"
#     INTJ = "INTJ"
#     ISTP = "ISTP"
#     ISFP = "ISFP"
#     INFP = "INFP"
#     INTP = "INTP"
#     ESTP = "ESTP"
#     ESFP = "ESFP"
#     ENFP = "ENFP"
#     ENTP = "ENTP"
#     ESTJ = "ESTJ"
#     ESFJ = "ESFJ"
#     ENFJ = "ENFJ"
#     ENTJ = "ENTJ"


# class CompanionType(str, Enum):
#     SOLO = "나홀로"
#     COUPLE = "커플"
#     FRIENDS = "친구"
#     FAMILY = "가족"


# class TransportationType(str, Enum):
#     CAR = "자동차"
#     PUBLIC = "대중교통"
#     BIKE = "자전거"


class TripGenerateRequest(BaseModel):
    location: str = Field(..., description="여행지", max_length=30)
    days: int = Field(..., description="여행 기간 (숙박 일수)", ge=1, le=28)
    mbti: str = Field(..., description="MBTI 유형")
    tripStyle: str = Field(..., description="여행 스타일", max_length=200)
    tendency: str = Field(..., description="식당 및 숙소 성향", max_length=200)
    asking: str = Field(..., description="특별 요청사항", max_length=200)
    companion: str = Field(..., description="동반자 유형")
    transportation: str = Field(..., description="이동 수단")
    pace: int = Field(
        ...,
        description="여행 일정 페이스 (1=매우 빡센 일정, 10=매우 여유로운 일정)",
        ge=1,
        le=10,
    )


######################################


class DestinationDetail(BaseModel):
    place_name: str = Field(..., description="방문지 이름")
    description: str = Field(..., description="이 장소에 대한 간략한 소개")
    proposed_reason: str = Field(..., description="이 장소를 권하는 이유")
    latitude: float = Field(
        ..., description="해당 장소의 위도 (Latitude)", ge=-90.0, le=90.0
    )
    longitude: float = Field(
        ...,
        description="해당 장소의 경도 (Longitude)",
        ge=-180.0,
        le=180.0,
    )


class DailyItinerary(BaseModel):
    day: int = Field(..., description="여행 일차 (1일차, 2일차, 3일차, ...)")
    places: List[DestinationDetail] = Field(
        ..., description="해당 일차의 동선 리스트 (방문 순서대로 배열)"
    )


class TripGenerateResponse(BaseModel):
    title: str = Field(..., description="유저의 취향을 저격한 여행 테마 타이틀")
    overview: str = Field(
        ..., description="유저의 MBTI와 취향, 동반자를 고려한 여행의 전체 개요"
    )
    custom_tips: List[str] = Field(
        ..., description="유저 맞춤형 여행 전 주의사항 및 꿀팁 리스트"
    )
    itinerary: List[DailyItinerary] = Field(
        ..., description="일차별 상세 여행 일정 정보"
    )


######################################


class TripSaveRequest(BaseModel):
    location: str = Field(..., description="여행지")
    title: str = Field(..., description="여행 타이틀")
    overview: str = Field(..., description="여행 개요")
    custom_tips: List[str] = Field(..., description="맞춤형 꿀팁 리스트")
    itinerary: List[DailyItinerary] = Field(..., description="일차별 상세 일정 리스트")


class TripSaveResponse(BaseModel):
    id: int = Field(..., description="DB에 저장된 고유 일정 ID")
    message: str = Field(..., description="성공 메시지")

    class Config:
        from_attributes = True


######################################


class TripListElement(BaseModel):
    id: int
    location: str
    title: str
    overview: str
    itinerary: List[Dict[str, Any]]


class TripListResponse(BaseModel):
    trips: List[TripListElement]


class TripDetailResponse(BaseModel):
    id: int
    location: str
    title: str
    overview: str
    custom_tips: List[str]
    itinerary: List[Dict[str, Any]]

    model_config = {"from_attributes": True}


######################################


class TripUpdateRequest(BaseModel):
    title: Optional[str] = None
    overview: Optional[str] = None
    custom_tips: Optional[List[str]] = None
    itinerary: Optional[List[DailyItinerary]] = None


class TripUpdateResponse(BaseModel):
    id: int
    title: str
    overview: str
    custom_tips: List[str]
    itinerary: List[DailyItinerary]
    message: str


######################################


class TripRegenerateRequest(BaseModel):
    feedback: str = Field(
        ...,
        description="유저가 기존 일정에 대해 AI에게 전달할 피드백",
    )


class TripRegenerateResponse(BaseModel):
    id: int = Field(..., description="DB에 저장된 고유 일정 ID")
    location: str = Field(..., description="여행지")
    title: str = Field(..., description="여행 타이틀")
    overview: str = Field(..., description="여행 개요")
    custom_tips: List[str] = Field(..., description="맞춤형 꿀팁")
    itinerary: List[Dict[str, Any]] = Field(..., description="일차별 상세 일정 리스트")
    message: str = Field(..., description="재생성 성공 메시지")

    class Config:
        from_attributes = True


#####################################


class UserCreateRequest(BaseModel):
    username: str
    password: str
    password_confirm: str


class UserCreateResponse(BaseModel):
    id: int
    username: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


##################################


class UserLoginRequest(BaseModel):
    username: str
    password: str


class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
