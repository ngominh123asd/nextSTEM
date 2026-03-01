"""Auth endpoints: register, login, logout, me."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services import auth_service
from app.utils.session import create_session, revoke_session

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, token = await auth_service.register_user(
            db, name=body.name, email=body.email, password=body.password
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    await create_session(user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, token = await auth_service.authenticate_user(
            db, email=body.email, password=body.password
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    await create_session(user.id)
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=204)
async def logout(user: User = Depends(get_current_user)):
    await revoke_session(str(user.id))


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)):
    return user
