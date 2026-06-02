import os
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import HTTPException, status
import auth
from passlib.context import CryptContext
from dotenv import load_dotenv


load_dotenv()


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


########################################


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def generate_access_token(
    data: dict,
    expiry: timedelta = timedelta(days=1),
) -> str:
    return jwt.encode(
        payload={
            **data,
            "exp": datetime.now(timezone.utc) + expiry,
        },
        key=JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            jwt=token,
            key=JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"인증 토큰이 만료되었습니다. 다시 로그인해주세요. {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"유효하지 않은 인증 토큰입니다. JWT 에러: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
