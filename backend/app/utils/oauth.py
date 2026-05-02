"""OAuth token verification logic."""

import os
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi import HTTPException

# Cấu hình Client ID (lấy từ biến môi trường)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")


async def verify_google_token(token: str) -> dict:
    """Verifies a Google Access token via Google UserInfo API and returns user info (email, name)."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token}"},
            )
        
        data = response.json()
        
        if response.status_code != 200 or "error" in data:
            err_msg = data.get("error_description", "Unknown error")
            raise ValueError(err_msg)

        email = data.get("email")
        name = data.get("name", "Người dùng Google")

        if not email:
            raise ValueError("Token không chứa email hợp lệ.")

        return {"email": email, "name": name, "provider": "google"}
    except Exception as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Google token không hợp lệ: {e}")


async def verify_facebook_token(token: str) -> dict:
    """Verifies a Facebook Access token via Graph API and returns user info."""
    try:
        # Gọi Facebook Graph API để lấy thông tin với token được cung cấp
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://graph.facebook.com/me",
                params={"fields": "id,name,email", "access_token": token},
            )

        data = response.json()

        if response.status_code != 200 or "error" in data:
            err_msg = data.get("error", {}).get("message", "Unknown error")
            raise ValueError(err_msg)

        email = data.get("email")
        name = data.get("name", "Người dùng Facebook")

        # Facebook có thể không trả về email nếu người dùng đăng ký bằng SĐT hoặc từ chối cấp quyền
        if not email:
            raise ValueError("Không lấy được email từ Facebook.")

        return {"email": email, "name": name, "provider": "facebook"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Facebook token không hợp lệ: {e}")
