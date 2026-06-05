from fastapi import Depends, HTTPException, status
from sqlmodel import select
import auth
from database import get_db
import models
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from security import oauth2_scheme


SessionDep = Annotated[AsyncSession, Depends(get_db)]


AuthDep = Annotated[str, Depends(oauth2_scheme)]


async def get_current_user(db: SessionDep, token: AuthDep) -> models.User:

    black_query = select(models.BlacklistedToken).where(
        models.BlacklistedToken.token == token
    )
    black_result = await db.execute(black_query)

    if black_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이미 로그아웃된 계정입니다. 다시 로그인해주세요.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = auth.decode_access_token(token)

    username: str | None = payload.get("sub")

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="토큰에 유저 정보가 존재하지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    query = select(models.User).where(models.User.username == username)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="존재하지 않는 유저입니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="탈퇴한 계정입니다."
        )

    return user


CurrentUserDep = Annotated[models.User, Depends(get_current_user)]
