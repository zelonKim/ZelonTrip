from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
import re


class TripGenerateRequest(BaseModel):
    location: str = Field(..., min_length=1, description="목적지")
    days: int = Field(..., ge=0, description="여행 기간")

    mbti: Literal[
        "INFJ",
        "INFP",
        "ENFJ",
        "ENFP",
        "ISTJ",
        "ISFJ",
        "ESTJ",
        "ESFJ",
        "INTJ",
        "INTP",
        "ENTJ",
        "ENTP",
        "ISTP",
        "ISFP",
        "ESTP",
        "ESFP",
    ]

    tripStyle: str = Field(..., min_length=1, description="여행 스타일")
    tendency: str = Field(..., min_length=1, description="식당 및 숙소 성향")
    companion: Literal["혼자", "친구와", "연인과", "가족과", "아이와", "부모님과"]
    transportation: Literal["대중교통", "자차/렌트카", "도보", "자전거"]
    pace: int = Field(..., ge=1, le=10, description="일정 페이스 (1~10)")

    asking: str = Field("", description="나만의 특별 요청사항 (선택)")

    @field_validator("location", "tripStyle", "tendency")
    @classmethod
    def strip_spaces(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("공백 문자열은 사용할 수 없습니다.")
        return stripped


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
    address: str = Field(..., description="해당 장소의 주소지")


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
    # 이메일 검증은 그대로 유지
    username: EmailStr = Field(..., description="유저 이메일 주소")

    # 💡 pattern 속성을 제거하고 일반 str 필드로 둡니다. (최소 길이 제한만 유지)
    password: str = Field(
        ..., min_length=8, description="영문, 숫자 조합 8자 이상 비밀번호"
    )
    password_confirm: str = Field(..., min_length=8)

    # 💡 1. 비밀번호 복잡성 검사 (영문, 숫자 조합 8자 이상)
    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        # 파이썬 re 모듈은 전방탐색(?=...)을 완벽히 지원합니다.
        password_regex = r"^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
        if not re.match(password_regex, v):
            raise ValueError(
                "비밀번호는 영문과 숫자를 조합하여 8자리 이상으로 입력해주세요."
            )
        return v

    # 💡 2. 비밀번호 일치 검사 (기존 코드 유지)
    @field_validator("password_confirm")
    @classmethod
    def match_passwords(cls, v: str, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("비밀번호와 비밀번호 확인이 일치하지 않습니다.")
        return v


class UserCreateResponse(BaseModel):
    id: int
    username: EmailStr
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


###################################


class NicknameUpdateRequest(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=20)


#####################################


class UserMeResponse(BaseModel):
    id: int
    username: EmailStr
    nickname: str | None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


#####################################


class UserStatsResponse(BaseModel):
    total_location: int
    total_days: int

    class Config:
        from_attributes = True


#####################################


class AIRecommendedItem(BaseModel):
    title: str = Field(description="추천 여행지 명칭")
    category: str = Field(description="여행 카테고리 (예: 힐링, 맛집, 액티비티 등)")
    tag: str = Field(description="#으로 시작하는 태그 키워드 (예: #오션뷰, #감성카페)")
    rating: float = Field(description="4.5 ~ 5.0 사이의 가상 평점")


class AIRecommendationList(BaseModel):
    recommendations: List[AIRecommendedItem]


class TripRecommendResponse(BaseModel):
    id: int
    title: str
    category: str
    tag: str
    rating: float
    distance: str = "취향 일치"
    imageUrl: str


###############################


class LocationAskRequest(BaseModel):
    keyword: str = Field(
        ...,
        description="유저가 입력한 궁금한 여행지 (예: 런던, 파리, 뉴욕, 도쿄 등)",
    )


class LocationAskResponse(BaseModel):
    keyword: str = Field(..., description="조회한 여행지 이름")
    content: str = Field(..., description="AI가 생성한 감성적이고 알찬 여행 정보 답변")
    imageUrl: str | None = Field(
        description="구글 맵에서 긁어온 해당 도시의 대표 실사 이미지 URL"
    )


###############################


class FeedbackCreateRequest(BaseModel):
    content: str = Field(
        ...,
        min_length=5,
        max_length=300,
        description="피드백 내용 (5자 이상 300자 이하)",
    )


class FeedbackCreateResponse(BaseModel):
    status: str
    message: str


###############################


class NoticeResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


#############################


class NotificationContents(BaseModel):
    title: str
    body: str
    message: str | None = None


class NotificationRequest(BaseModel):
    pushToken: str
    deviceId: str
    contents: NotificationContents
