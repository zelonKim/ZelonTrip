from contextlib import asynccontextmanager
from datetime import timedelta
import os
from fastapi import Depends, FastAPI, HTTPException, APIRouter, Response, status, Query
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
    NicknameUpdateRequest,
    UserMeResponse,
    UserStatsResponse,
    AIRecommendationList,
    TripRecommendResponse,
    LocationAskResponse,
    LocationAskRequest,
    FeedbackCreateResponse,
    FeedbackCreateRequest,
    NoticeResponse,
    NotificationRequest,
)
from dotenv import load_dotenv
from scalar_fastapi import get_scalar_api_reference
from database import create_db_tables
from dependencies import AuthDep, SessionDep, CurrentUserDep
import models
import auth
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func
from typing import List
import httpx
import firebase_admin
from firebase_admin import credentials, messaging


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


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


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
async def get_trip_list(
    db: SessionDep,
    currentUser: CurrentUserDep,
):

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
async def get_trip_detail(
    trip_id: int,
    db: SessionDep,
    # currentUser: CurrentUserDep,
):
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
async def update_trip(
    trip_id: int,
    request: TripUpdateRequest,
    db: SessionDep,
    currentUser: CurrentUserDep,
):
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
async def delete_trip(trip_id: int, db: SessionDep, currentUser: CurrentUserDep):
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
async def regenerate_trip(
    trip_id: int,
    request: TripRegenerateRequest,
    db: SessionDep,
    currentUser: CurrentUserDep,
):

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
            detail="탈퇴한 계정입니다.",
        )

    access_token = auth.generate_access_token(
        data={"sub": user.username},
        expiry=timedelta(days=1),
    )

    return {"access_token": access_token, "token_type": "bearer"}


##################################


@app.get("/api/v1/auth/me", response_model=UserMeResponse)
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


##################################


@app.patch("/api/v1/user/nickname", status_code=status.HTTP_200_OK)
async def update_nickname(
    request: NicknameUpdateRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
):

    query = select(models.User).where(models.User.nickname == request.nickname)
    result = await db.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 닉네임입니다.",
        )

    current_user.nickname = request.nickname
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "닉네임이 성공적으로 설정되었습니다.",
        "nickname": current_user.nickname,
    }


##################################


@app.get("/api/v1/user/stats", response_model=UserStatsResponse)
async def get_user_trip_stats(db: SessionDep, current_user: CurrentUserDep):

    location_query = select(func.count(func.distinct(models.Trip_Plan.location))).where(
        models.Trip_Plan.user_id == current_user.id
    )

    location_result = await db.execute(location_query)
    total_location = location_result.scalar() or 0

    plans_query = select(models.Trip_Plan.itinerary).where(
        models.Trip_Plan.user_id == current_user.id
    )
    plans_result = await db.execute(plans_query)
    user_plans = plans_result.scalars().all()

    total_days = 0
    for itinerary_list in user_plans:
        if itinerary_list and isinstance(itinerary_list, list):
            total_days += len(itinerary_list)

    return UserStatsResponse(total_location=total_location, total_days=total_days)


#################################


@app.get("/api/v1/trip/recommend/history", response_model=List[TripRecommendResponse])
async def get_history_recommendations(db: SessionDep, currentUser: CurrentUserDep):
    try:
        query = (
            select(models.Trip_Plan)
            .where(models.Trip_Plan.user_id == currentUser.id)
            .order_by(desc(models.Trip_Plan.id))
        )
        result = await db.execute(query)
        trip_plans = result.scalars().all()

        if not trip_plans:
            return []

        user_locations = list(
            set([plan.location for plan in trip_plans if plan.location])
        )
        location_history = ", ".join(user_locations)

        system_prompt = (
            "당신은 대한민국 최고의 AI 여행 큐레이터입니다. "
            "지금까지 유저가 다녀온 여행지 목록을 기반으로, 유저의 취향과 성향을 분석하여 "
            "가장 만족스러워할 만한 새로운 여행지를 엄선하여 최소 5군데를 추천해 주세요."
        )

        user_prompt = (
            f"유저가 다녀온 여행지 목록: [{location_history}]\n"
            f"위 장소들과 유사한 감성, 테마, 혹은 연계 매력이 있는 새로운 추천 여행지 5곳을 포맷에 맞춰 제안해줘."
        )

        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format=AIRecommendationList,
            temperature=0.7,
        )

        ai_result = response.choices[0].message.parsed

        if not ai_result or not ai_result.recommendations:
            raise HTTPException(status_code=500, detail="AI 추천 데이터 파싱 실패")

        final_recommendations = []

        # 💡 4. 구글 API와 통신할 비동기 HTTP 클라이언트 세션 오픈
        async with httpx.AsyncClient() as http_client:
            for index, item in enumerate(ai_result.recommendations):
                search_title = item.title.strip()

                dynamic_image_url = f"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"

                try:
                    search_url = (
                        "https://maps.googleapis.com/maps/api/place/textsearch/json"
                    )
                    search_params = {
                        "query": search_title,
                        "key": GOOGLE_API_KEY,
                        "language": "ko",
                    }

                    search_response = await http_client.get(
                        search_url, params=search_params
                    )
                    search_data = search_response.json()

                    if search_data.get("results") and search_data["results"][0].get(
                        "photos"
                    ):
                        photo_reference = search_data["results"][0]["photos"][0][
                            "photo_reference"
                        ]

                        dynamic_image_url = (
                            f"https://maps.googleapis.com/maps/api/place/photo"
                            f"?maxwidth=500"
                            f"&photo_reference={photo_reference}"
                            f"&key={GOOGLE_API_KEY}"
                        )
                        print(f"[{search_title}] 구글 실사 이미지 매칭 성공")

                    else:
                        print(
                            f"[{search_title}] 구글 검색 결과 혹은 등록된 사진이 없음 -> 기본 이미지 대체"
                        )

                except Exception as google_err:
                    print(
                        f"구글 플레이스 통신 오류 ({search_title}): {str(google_err)}"
                    )

                final_recommendations.append(
                    TripRecommendResponse(
                        id=2000 + index,
                        title=item.title,
                        category=item.category,
                        tag=item.tag,
                        rating=item.rating,
                        distance="취향 일치",
                        imageUrl=dynamic_image_url,
                    )
                )

        return final_recommendations

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 맞춤 추천 조회 중 장애 발생: {str(e)}",
        )


#################################


@app.get("/api/v1/trip/recommend/nearby", response_model=List[TripRecommendResponse])
async def get_nearby_recommendations(
    latitude: float = Query(37.5665, description="유저의 현재 위도"),
    longitude: float = Query(126.978, description="유저의 현재 경도"),
):
    try:
        system_prompt = (
            "당신은 행정구역(시, 군, 구)단위로 여행지를 추천해주는 AI 여행 큐레이터입니다.\n"
            "반드시 다음 지침을 엄격히 준수하세요:\n"
            "1. 추천 명칭(title)은 오직 '행정시 명칭' 혹은 '지역 구 단위 명칭'으로만 작성해야 합니다. (예: 서울, 인천, 안양, 부천, 강화도 등)\n"
            "2. 관광 명소 이름(예: 에버랜드, 광안리 해수욕장, 수원화성)이나 광범위한 도 단위(예: 경기도, 강원도)는 절대로 'title'에 넣지 마세요.\n"
            "3. 반드시 한국어로 답변하세요."
        )

        user_prompt = (
            f"🎯 유저의 현재 위치: [위도:{latitude}, 경도:{longitude}]\n\n"
            f"이 위치를 기반으로 다음 조건에 맞는 새로운 추천 여행 도시/지역 5곳을 엄선해줘.\n"
            f"단, 유저의 현재 위치에서 대중교통이나 차로 1시간 내외로 갈 수 있는 '근교 도시/지역'들만 엄선해줘\n"
            f"⚠️ 중요 포맷 가이드:\n"
            f"title 필드에는 '수원', '과천', '가평', '부산' 처럼 딱 떨어지는 도시/지역 이름만 들어가야 합니다."
        )

        response = await client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {"role": "user", "content": user_prompt},
            ],
            response_format=AIRecommendationList,
        )

        ai_result = response.choices[0].message.parsed

        if not ai_result or not ai_result.recommendations:
            raise HTTPException(status_code=500, detail="AI 추천 데이터 파싱 실패")

        final_recommendations = []

        async with httpx.AsyncClient() as http_client:
            for index, item in enumerate(ai_result.recommendations):
                search_title = item.title.strip()

                search_url = (
                    "https://maps.googleapis.com/maps/api/place/textsearch/json"
                )

                search_params = {
                    "query": search_title,
                    "key": GOOGLE_API_KEY,
                    "language": "ko",
                }

                search_response = await http_client.get(
                    search_url, params=search_params
                )

                search_data = search_response.json()
                results = search_data.get("results", [])

                dynamic_image_url = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"

                if results and results[0].get("photos"):
                    photo_reference = results[0]["photos"][0]["photo_reference"]

                    dynamic_image_url = (
                        f"https://maps.googleapis.com/maps/api/place/photo"
                        f"?maxwidth=600"
                        f"&photo_reference={photo_reference}"
                        f"&key={GOOGLE_API_KEY}"
                    )

                final_recommendations.append(
                    TripRecommendResponse(
                        id=3000 + index,
                        title=item.title,
                        category=item.category,
                        tag=item.tag,
                        rating=item.rating,
                        distance="위치 가까움",
                        imageUrl=dynamic_image_url,
                    )
                )

        return final_recommendations

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"위치 기반 맞춤 도시 추천 조회 중 장애 발생: {str(e)}",
        )


#################################


@app.post("/api/v1/location/ask", response_model=LocationAskResponse)
async def ask_location_info(
    request: LocationAskRequest, db: SessionDep, current_user: CurrentUserDep
):
    try:
        search_keyword = request.keyword.strip()
        if not search_keyword:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="궁금한 여행지를 입력해주세요.",
            )

        result = await db.execute(
            select(models.Ask_Location)
            .where(models.Ask_Location.user_id == current_user.id)
            .where(models.Ask_Location.keyword == search_keyword)
        )

        existing_record = result.scalars().first()

        if existing_record:
            return LocationAskResponse(
                keyword=existing_record.keyword,
                content=existing_record.content,
                imageUrl=existing_record.image_url,
            )

        system_instruction = (
            "당신은 전 세계의 매력적인 여행지를 소개해주는 베테랑 여행 도슨트(가이드)입니다.\n"
            "유저가 묻는 도시에 대해 친절하고 설레는 어조로 답변해 주세요.\n"
            "답변에는 [1.여행지의 핵심 매력/한줄평, 2.꼭 가야 할 대표 명소, 3.추천하는 현지 음식이나 문화]가 자연스럽게 포함되어야 합니다.\n"
            "너무 딱딱한 문체 대신 줄바꿈을 적절히 활용하여 모바일 화면에서 가독성 좋게 작성해 주세요."
        )

        user_prompt = f"내가 지금 궁금한 여행지는 '{search_keyword}'야. 이 여행지에 대한 흥미롭고 알찬 가이드 정보를 작성해줘!"

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=800,
        )

        ai_content = response.choices[0].message.content

        if not ai_content:
            raise HTTPException(status_code=500, detail="AI 데이터 파싱 실패")

        async with httpx.AsyncClient() as http_client:
            search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            search_params = {
                "query": search_keyword,
                "key": GOOGLE_API_KEY,
                "language": "ko",
            }

            search_response = await http_client.get(search_url, params=search_params)
            search_data = search_response.json()
            results = search_data.get("results", [])

            dynamic_image_url = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"

            if results and results[0].get("photos"):
                photo_reference = results[0]["photos"][0]["photo_reference"]
                dynamic_image_url = (
                    f"https://maps.googleapis.com/maps/api/place/photo"
                    f"?maxwidth=800"
                    f"&photo_reference={photo_reference}"
                    f"&key={GOOGLE_API_KEY}"
                )

        new_ask_record = models.Ask_Location(
            user_id=current_user.id,
            keyword=search_keyword,
            content=ai_content.strip(),
            image_url=dynamic_image_url,
        )

        db.add(new_ask_record)
        await db.commit()
        await db.refresh(new_ask_record)

        return LocationAskResponse(
            keyword=search_keyword,
            content=ai_content.strip(),
            imageUrl=dynamic_image_url,
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"서버 에러 발생: {str(e)}",
        )


#################################


@app.post(
    "/api/v1/user/feedback",
    response_model=FeedbackCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_feedback(
    request: FeedbackCreateRequest, db: SessionDep, current_user: CurrentUserDep
):
    try:
        feedback_content = request.content.strip()
        if not feedback_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="피드백 내용을 입력해 주세요.",
            )

        new_feedback = models.User_Feedback(
            user_id=current_user.id,
            content=feedback_content,
        )

        db.add(new_feedback)
        await db.commit()

        return FeedbackCreateResponse(
            status="success",
            message="피드백이 성공적으로 접수되었습니다.",
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"피드백 제출 중 서버 에러가 발생했습니다: {str(e)}",
        )


###################################


@app.get(
    "/api/v1/notice",
    response_model=List[NoticeResponse],
    status_code=status.HTTP_200_OK,
)
async def get_notice_list(db: SessionDep):
    try:
        query = select(models.Notice).order_by(desc(models.Notice.created_at))
        result = await db.execute(query)
        notices = result.scalars().all()
        return notices

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"공지사항 목록을 불러오는 중 에러가 발생했습니다: {str(e)}",
        )


################################


@app.get("/api/v1/notice/{id}", response_model=NoticeResponse)
async def get_notice_detail(id: int, db: SessionDep):
    try:
        notice = await db.get(models.Notice, id)

        if not notice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"ID {id}에 해당하는 공지사항을 찾을 수 없습니다.",
            )

        return NoticeResponse.model_validate(notice)

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"공지사항 상세 조회 중 에러 발생: {str(e)}",
        )


################################


KEY_PATH = "google-service-key.json"

if not firebase_admin._apps:
    if os.path.exists(KEY_PATH):
        cred = credentials.Certificate(KEY_PATH)
        firebase_admin.initialize_app(cred)
    else:
        print(f"⚠️ 경고: {KEY_PATH} 파일이 없어 Firebase를 초기화 할 수 없습니다.")


@app.post("/api/v1/notification", status_code=status.HTTP_200_OK)
async def send_generate_notification(request: NotificationRequest):
    try:
        token = request.pushToken
        device_id = request.deviceId
        title = request.contents.title
        body = request.contents.body

        additional_data = {"message": request.contents.message, "deviceId": device_id}

        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=additional_data,
            token=token,
        )

        response = messaging.send(message)

        print(f"📱 디바이스 [{device_id}]로 푸시 알림 발송 성공")

        return {
            "success": True,
            "message": "푸시 알림 발송 성공",
            "fcm_message_id": response,
        }

    except messaging.FirebaseError as fe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Firebase 푸시 발송 실패: {str(fe)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"서버 내부 오류: {str(e)}",
        )
