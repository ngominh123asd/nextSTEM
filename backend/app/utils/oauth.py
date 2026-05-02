"""OAuth token verification logic — Server-Side Verification.

Google: Two-step verification via tokeninfo (audience/app ownership) + userinfo (email).
Facebook: Two-step verification — /debug_token (app ownership) + /me (user info).
"""

import httpx
from fastapi import HTTPException

from app.config import settings


async def verify_google_token(token: str) -> dict:
    """
    Xác minh Google Access Token theo 2 bước:

    Bước 1 — /tokeninfo: Kiểm tra token có thuộc về app của chúng ta không.
      - Kiểm tra 'aud' (audience) khớp với GOOGLE_CLIENT_ID.
      - Thiếu bước này cho phép token từ app Google khác đăng nhập vào hệ thống.

    Bước 2 — /userinfo: Lấy email và tên trực tiếp từ Google.
      - Kiểm tra email_verified = true trước khi tin dùng email.
      - Không tin email do frontend gửi lên.
    """
    GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    async with httpx.AsyncClient() as client:
        # Bước 1: Xác minh app ownership qua tokeninfo
        tokeninfo_res = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"access_token": token}
        )

        if tokeninfo_res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        tokeninfo_data = tokeninfo_res.json()

        # Kiểm tra audience — BẮT BUỘC
        # Token phải thuộc về chính xác app của chúng ta
        if tokeninfo_data.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Bước 2: Lấy thông tin người dùng từ Google
        userinfo_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {token}"}
        )

        if userinfo_res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        userinfo_data = userinfo_res.json()

    # Kiểm tra email_verified — không chấp nhận email chưa xác minh
    if not userinfo_data.get("email_verified", False):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    email = userinfo_data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"email": email, "name": userinfo_data.get("name", "")}


async def verify_facebook_token(access_token: str) -> dict:
    """
    Xác minh Facebook Access Token theo 2 bước:

    Bước 1 — /debug_token: Kiểm tra token có thật sự thuộc về App của chúng ta không.
      (Dùng /me trực tiếp không đủ — kẻ tấn công có thể dùng token từ app khác.)

    Bước 2 — /me: Lấy email và tên người dùng từ Graph API.
      (Không tin email do frontend gửi lên.)
    """
    APP_ID = settings.FACEBOOK_APP_ID
    APP_SECRET = settings.FACEBOOK_APP_SECRET

    if not APP_ID or not APP_SECRET:
        raise HTTPException(status_code=500, detail="Facebook OAuth not configured")

    APP_TOKEN = f"{APP_ID}|{APP_SECRET}"

    async with httpx.AsyncClient() as client:
        # Bước 1: Xác minh app ownership
        debug_res = await client.get(
            "https://graph.facebook.com/debug_token",
            params={"input_token": access_token, "access_token": APP_TOKEN}
        )
        debug_data = debug_res.json().get("data", {})

        if not debug_data.get("is_valid") or debug_data.get("app_id") != APP_ID:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Bước 2: Lấy thông tin người dùng trực tiếp từ Facebook
        me_res = await client.get(
            "https://graph.facebook.com/me",
            params={"fields": "id,name,email", "access_token": access_token}
        )
        me_data = me_res.json()

    if "email" not in me_data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"email": me_data["email"], "name": me_data.get("name", "")}
