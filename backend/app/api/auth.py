"""Auth endpoints: register, login, logout, me, OAuth (Google/Facebook)."""

import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services import auth_service
from app.utils.session import create_session, revoke_session
from app.utils.oauth import verify_google_token, verify_facebook_token

limiter = Limiter(key_func=get_remote_address)


class OAuthRequest(BaseModel):
    token: str
    state: str = ""  # CSRF state from frontend


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, token = await auth_service.register_user(
            db, name=body.name, email=body.email, password=body.password
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    # Fire-and-forget: don't block response waiting for Redis
    asyncio.create_task(create_session(user.id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, token = await auth_service.authenticate_user(
            db, email=body.email, password=body.password
        )
        if user.must_change_password:
             raise HTTPException(status_code=403, detail="must_change_password")
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    # Fire-and-forget: don't block response waiting for Redis
    asyncio.create_task(create_session(user.id))
    return TokenResponse(access_token=token)


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
async def google_login(body: OAuthRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Google OAuth login — rate limited to 10 requests/minute per IP."""
    # Verify token with Google (signature + audience + email_verified)
    user_info = await verify_google_token(body.token)

    # Login or register
    user, token = await auth_service.oauth_login_user(
        db, email=user_info["email"], name=user_info["name"], provider="google"
    )

    asyncio.create_task(create_session(user.id))
    return TokenResponse(access_token=token)


@router.post("/facebook", response_model=TokenResponse)
@limiter.limit("10/minute")
async def facebook_login(body: OAuthRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """Facebook OAuth login — rate limited to 10 requests/minute per IP."""
    # Verify token with Facebook (debug_token + /me)
    user_info = await verify_facebook_token(body.token)

    # Login or register
    user, token = await auth_service.oauth_login_user(
        db, email=user_info["email"], name=user_info["name"], provider="facebook"
    )

    asyncio.create_task(create_session(user.id))
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=204)
async def logout(user: User = Depends(get_current_user)):
    await revoke_session(str(user.id))


@router.get("/me", response_model=UserRead)
async def me(user: User = Depends(get_current_user)):
    return user
class ChangePasswordRequest(BaseModel):
    email: str
    old_password: str
    new_password: str

@router.post("/change-password", response_model=TokenResponse)
async def change_password(body: ChangePasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        user, _ = await auth_service.authenticate_user(
            db, email=body.email, password=body.old_password
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
        
    from app.utils.security import async_hash_password
    user.hashed_password = await async_hash_password(body.new_password)
    user.must_change_password = False
    await db.commit()
    
    # reissue token
    from app.utils.security import create_access_token
    token = create_access_token({"sub": str(user.id)})
    asyncio.create_task(create_session(user.id))
    return TokenResponse(access_token=token)
