from contextlib import asynccontextmanager
from datetime import timedelta
import os
from fastapi import Depends, FastAPI, HTTPException, APIRouter, Response, status
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import ValidationError
from sqlmodel import desc, select
from schemas import (
    TripListResponse,
    TripDetailResponse,
    TripGenerateRequest,
    TripGenerateResponse,
    TripUpdateRequest,
    TripUpdateResponse,
    TripRegenerateRequest,
    TripRegenerateResponse,
    UserLoginResponse,
    UserCreateRequest,
    UserCreateResponse,
)
from dotenv import load_dotenv
from scalar_fastapi import get_scalar_api_reference
from database import create_db_tables
from dependencies import AuthDep, SessionDep, CurrentUserDep
import models
import auth
from fastapi.security import OAuth2PasswordRequestForm

load_dotenv()


@asynccontextmanager
async def lifespan_handler(app: FastAPI):
    await create_db_tables()
    yield


app = FastAPI(
    title="ZelonTrip API",
    description="AI 유저 분석 여행 플래너 API",
    version="1.0.0",
    lifespan=lifespan_handler,
)


# ---------------------------------------------------------------------------
# CORS 설정: 프론트엔드(Expo 앱 등) 연결을 위함.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 로컬 개발 단계에서는 모두 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


openai_key = os.getenv("OPENAI_API_KEY")

if not openai_key:
    print(
        "⚠️ 경고: OPENAI_API_KEY 환경변수가 설정되지 않았습니다! .env 파일을 확인하거나 터미널에 export 해주세요."
    )

client = AsyncOpenAI(api_key=openai_key)


##########################################


@app.get("/")
def read_root():
    return {"message": "Welcome to ZelonTrip"}


@app.get("/scalar", include_in_schema=False)
def get_scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title="Scalar API",
    )


##########################################


@app.post("/api/v1/trip/generate")
async def generate_trip(
    request: TripGenerateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):

    if not client.api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API Key가 설정되지 않았습니다.",
        )

    system_instruction = (
        "당신은 전세계 최고의 여행 가이드입니다. "
        "유저가 제공한 MBTI, 여행 취향뿐만 아니라 '동반자 유형', '이동 수단', '일정의 촘촘한 페이스'를 완벽히 분석하여 "
        "유저의 감성을 완전히 저격하고 실전 이동 동선까지 고려한 맞춤형 여행 코스를 설계해야 합니다.\n\n"
        "특히 아래 지침을 반드시 준수하세요:\n"
        "- 이동수단(transportation)을 고려하여 일정과 동선을 구성해주세요.\n"
        "- 페이스(pace) 값이 10에 가까울수록(예: 8, 9, 10) 매우 촘촘하고 빡빡한 일정으로 판단하여 하루에 최소 5개 이상의 많은 장소를 채워야 합니다. 반대로 1에 가까울수록(예:1,2,3) 하루에 2개 이하의 적은 장소를 채워야 합니다."
        "- 동반자(companion)의 특성을 고려한 꿀팁(custom_tips)과 추천 이유(curation_reason)를 상세히 작성하세요.\n"
        "- 모든 장소의 위도(latitude)와 경도(longitude)는 소수점 5자리 이하까지 실제 위치 좌표를 정확하게 입력해주세요. 위경도 값이 서로 바뀌지 않도록 주의하세요.\n"
        "- 모든 장소의 주소지(address)는 전세계 유저가 구글 맵에서 쉽게 검색하고 찾아갈 수 있도록 해당 국가/도시에 맞는 글로벌 표준 영문 주소(English Address) 혹은 공식 현지 주소로 정확하게 작성하세요.\n"
        "- 반드시 지정된 응답 형식(TripGenerateResponse JSON Schema)을 엄격히 준수하여 답변해주세요."
        "- 반드시 한국어로 답변해주세요."
    )

    user_prompt = (
        f"유저 프로필 및 요청 사항:\n"
        f"- 목적지: {request.location}\n"
        f"- 기간: {request.days}박 {request.days + 1}일\n"
        f"- MBTI: {request.mbti}\n"
        f"- 여행 스타일: {request.tripStyle}\n\n"
        f"- 식당 및 숙소 성향: {request.tendency}\n\n"
        f"- 특별 요청사항: {request.asking}\n\n"
        f"- 동반자: {request.companion}\n"
        f"- 이동 수단: {request.transportation}\n"
        f"- 일정 페이스: {request.pace} (1=매우 여유로움, 10=매우 빡빡함)\n"
        f"이 유저만을 위한 감성적인 여행 테마 타이틀, 여행 개요, 맞춤형 특별 꿀팁, 그리고 일차별 상세 동선 리스트를 생성해줘."
    )

    try:
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            response_format=TripGenerateResponse,
        )

        parsed_response = completion.choices[0].message.parsed

        if not parsed_response:
            raise HTTPException(
                status_code=500, detail="AI가 올바른 포맷으로 응답하지 못했습니다."
            )

        trip_plan = models.Trip_Plan(
            location=request.location,
            title=parsed_response.title,
            overview=parsed_response.overview,
            custom_tips=parsed_response.custom_tips,
            itinerary=[day.model_dump() for day in parsed_response.itinerary],
            user_id=current_user.id,
        )

        db.add(trip_plan)
        await db.commit()
        await db.refresh(trip_plan)

        return {
            "id": trip_plan.id,
            "message": "AI 일정 생성 및 저장이 완료되었습니다!",
            # "data": parsed_response.model_dump(),
            "data": parsed_response,
        }

    except Exception as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"에러가 발생했습니다: {str(error)}",
        )


##########################################


# ---------------------------------------------------------------------------
# 모든 여행 일정 목록 조회 API
# ---------------------------------------------------------------------------
@app.get("/api/v1/trip/list", response_model=TripListResponse)
async def get_trip_list(db: SessionDep, currentUser: CurrentUserDep):

    try:
        query = (
            select(models.Trip_Plan)
            .where(models.Trip_Plan.user_id == currentUser.id)
            .order_by(desc(models.Trip_Plan.id))
        )
        result = await db.execute(query)
        trip_plans = result.scalars().all()

        return {"trips": trip_plans}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"목록 조회 중 에러 발생: {str(e)}")


# ---------------------------------------------------------------------------
# 특정 여행 일정 상세 조회 API
# ---------------------------------------------------------------------------
@app.get("/api/v1/trip/{trip_id}", response_model=TripDetailResponse)
async def get_trip_detail(trip_id: int, db: SessionDep):
    try:
        trip_plan = await db.get(models.Trip_Plan, trip_id)

        if not trip_plan:
            raise HTTPException(
                status_code=404,
                detail=f"ID {trip_id}에 해당하는 여행 일정을 찾을 수 없습니다.",
            )

        return TripDetailResponse.model_validate(trip_plan)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"상세 조회 중 에러 발생: {str(e)}")


##########################################


# ---------------------------------------------------------------------------
# 여행 일정 타이틀 및 개요 부분 수정 API
# ---------------------------------------------------------------------------
@app.patch("/api/v1/trip/{trip_id}", response_model=TripUpdateResponse)
async def update_trip(trip_id: int, request: TripUpdateRequest, db: SessionDep):
    try:
        trip_plan = await db.get(models.Trip_Plan, trip_id)

        if not trip_plan:
            raise HTTPException(
                status_code=404,
                detail=f"ID {trip_id}에 해당하는 여행 일정을 찾을 수 없어 수정에 실패했습니다.",
            )

        update_data = request.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(trip_plan, key, value)

        db.add(trip_plan)
        await db.commit()
        await db.refresh(trip_plan)

        return {
            "id": trip_plan.id,
            "title": trip_plan.title,
            "overview": trip_plan.overview,
            "custom_tips": trip_plan.custom_tips,
            "itinerary": trip_plan.itinerary,
            "message": "여행 일정이 성공적으로 수정되었습니다!",
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"수정 중 에러 발생: {str(e)}")


##########################################


# ---------------------------------------------------------------------------
# 여행 일정 삭제 API
# ---------------------------------------------------------------------------
@app.delete("/api/v1/trip/{trip_id}")
async def delete_trip(trip_id: int, db: SessionDep):
    try:
        trip_plan = await db.get(models.Trip_Plan, trip_id)

        if not trip_plan:
            raise HTTPException(
                status_code=404,
                detail=f"ID {trip_id}에 해당하는 여행 일정을 찾을 수 없어 삭제에 실패했습니다.",
            )

        await db.delete(trip_plan)
        await db.commit()

        return {"message": f"ID {trip_id}번 여행 일정이 성공적으로 삭제되었습니다."}

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 처리 중 에러 발생: {str(e)}")


##########################################


# ---------------------------------------------------------------------------
#  AI 여행 일정 재생성 API
# ---------------------------------------------------------------------------
@app.post("/api/v1/trip/{trip_id}/regenerate", response_model=TripRegenerateResponse)
async def regenerate_trip(trip_id: int, request: TripRegenerateRequest, db: SessionDep):

    if not client.api_key:
        raise HTTPException(
            status_code=500, detail="OpenAI API Key가 설정되지 않았습니다."
        )

    try:
        old_trip = await db.get(models.Trip_Plan, trip_id)
        if not old_trip:
            raise HTTPException(status_code=404, detail="기존 일정을 찾을 수 없습니다.")

        current_days = len(old_trip.itinerary) if old_trip.itinerary else 0

        system_instruction = (
            "당신은 전세계 최고의 여행 가이드 및 일정 조율 전문가입니다.\n"
            "'기존 여행 일정 데이터'와 유저가 제공한'피드백'을 정확히 분석하여, "
            "기존 일정의 전체적인 톤앤매너는 유지하되 유저의 피드백이 제대로 반영된 여행 코스를 설계해야 합니다.\n\n"
            "특히 아래 지침을 반드시 준수하세요:\n"
            "- 유저가 수정을 요청한 부분을 중점적으로 고치되, 전체 동선이 꼬이지 않도록 자연스럽게 연결해주세요.\n"
            "- 모든 장소의 위도(latitude)와 경도(longitude)는 실제 위치 좌표를 정확하게 입력해주세요.\n"
            "- 반드시 지정된 응답 형식(TripGenerateResponse JSON Schema)을 엄격히 준수하여 답변해주세요.\n"
            "- 반드시 한국어로 답변해주세요."
            "⚠️ [중요: 일정 수리 가이드]\n"
            "  1. 유저가 일차(기간) 변경을 요청하는 경우, 제공된 '목표 총 일수'를 절대적으로 준수하세요.\n"
            "  2. 제공된 목표 총 일수와 결과물인 itinerary 배열의 길이가 정확히 일치해야 합니다.\n"
        )

        user_prompt = (
            f"🗺️ [기존 여행 정보]\n"
            f"- 목적지: {old_trip.location}\n"
            f"- 기존 타이틀: {old_trip.title}\n"
            f"- 기존 개요: {old_trip.overview}\n"
            f"- 기존 특별 꿀팁: {old_trip.custom_tips}\n"
            f"- 기존 일차별 동선:\n{old_trip.itinerary}\n\n"
            f"- 기존 일정의 총 일수: {current_days}일차 구성\n"
            f"👉 [유저의 피드백]:{request.feedback}\n"
            f"기존 여행 정보에 유저의 피드백을 완전히 반영한 여행 테마 타이틀, 전체 개요, 맞춤형 꿀팁, 그리고 일차별 상세 동선 리스트를 다시 생성해주세요."
            f"단, 유저의 피드백을 분석하여 최종 결과물은 반드시 유저가 요구한 정확한 일수로 맞춰서 생성하세요.(만약, 기존 {current_days}일에서 하루 추가면 총 {current_days + 1}일차까지 생성해야 합니다.)\n\n"
        )

        completion = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            response_format=TripGenerateResponse,
        )

        ai_parsed = completion.choices[0].message.parsed
        if not ai_parsed:
            raise HTTPException(
                status_code=500, detail="AI가 올바른 포맷으로 응답하지 못했습니다."
            )

        old_trip.title = ai_parsed.title
        old_trip.overview = ai_parsed.overview
        old_trip.custom_tips = ai_parsed.custom_tips
        old_trip.itinerary = [day.model_dump() for day in ai_parsed.itinerary]

        db.add(old_trip)
        await db.commit()
        await db.refresh(old_trip)

        return {
            "id": old_trip.id,
            "location": old_trip.location,
            "title": old_trip.title,
            "overview": old_trip.overview,
            "custom_tips": old_trip.custom_tips,
            "itinerary": old_trip.itinerary,
            "message": "AI가 유저님의 피드백을 반영하여 여행 일정을 성공적으로 재생성 및 업데이트했습니다! ✨",
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"AI 재생성 중 서버 에러 발생: {str(e)}"
        )


##########################################


@app.post(
    "/api/v1/auth/signup",
    response_model=UserCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def signup(request: UserCreateRequest, db: SessionDep):

    query = select(models.User).where(models.User.username == request.username)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.",
        )

    hashed_password = auth.get_hashed_password(request.password)

    new_user = models.User(
        username=request.username, hashed_password=hashed_password, nickname=None
    )

    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"회원가입 처리 중 서버 오류가 발생했습니다: {str(e)}",
        )


#########################################


@app.post("/api/v1/auth/login", response_model=UserLoginResponse)
async def login(
    db: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
):

    query = select(models.User).where(models.User.username == form_data.username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 혹은 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 혹은 비밀번호가 올바르지 않거나 사용할 수 없는 계정입니다.",
        )

    access_token = auth.generate_access_token(
        data={"sub": user.username},
        expiry=timedelta(hours=12),
    )

    return {"access_token": access_token, "token_type": "bearer"}


##################################


@app.get("/api/v1/auth/me", response_model=UserCreateResponse)
async def get_me(current_user: CurrentUserDep):
    return current_user


##################################


@app.patch(
    "/api/v1/auth/deactivate",
    status_code=status.HTTP_200_OK,
)
async def account_deactivate(db: SessionDep, current_user: CurrentUserDep):
    current_user.is_active = False

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {"message": "계정이 비활성화되었습니다.", "username": current_user.username}


##################################


@app.post(
    "/api/v1/auth/logout",
    status_code=status.HTTP_200_OK,
)
async def logout(db: SessionDep, current_user: CurrentUserDep, token: AuthDep):

    query = select(models.BlacklistedToken).where(
        models.BlacklistedToken.token == token
    )
    result = await db.execute(query)
    is_exists = result.scalar_one_or_none()

    if not is_exists:
        blacklisted = models.BlacklistedToken(token=token)
        db.add(blacklisted)
        await db.commit()

    return {"message": "성공적으로 로그아웃되었습니다. 해당 토큰은 만료되었습니다."}
