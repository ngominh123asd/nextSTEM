"""BaseAgent — Google GenAI wrapper cơ sở cho tất cả agents.

Mỗi agent kế thừa BaseAgent và define system_prompt riêng.
Hỗ trợ streaming và non-streaming generation, token tracking.
"""

import logging
from typing import AsyncIterator

import google.generativeai as genai

from app.config import settings

logger = logging.getLogger(__name__)

# Configure Google GenAI
genai.configure(api_key=settings.GOOGLE_API_KEY)


class BaseAgent:
    """Lớp cơ sở cho tất cả agent, wrap Google Gemini API."""

    def __init__(
        self,
        system_prompt: str,
        model_name: str = "gemini-2.0-flash",
        tools: list | None = None,
    ):
        self.system_prompt = system_prompt
        self.model_name = model_name
        self._tools = tools

        self.model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_prompt,
            tools=tools or [],
        )
        self._chat_session = None
        self._token_usage = {"input": 0, "output": 0, "total": 0}

    def start_session(self, history: list | None = None):
        """Khởi tạo chat session mới (có thể resume từ history)."""
        self._chat_session = self.model.start_chat(history=history or [])
        return self._chat_session

    async def generate_response(self, prompt: str) -> AsyncIterator[str]:
        """Streaming response — yield từng chunk text."""
        if not self._chat_session:
            self.start_session()

        try:
            response = await self._chat_session.send_message_async(prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text

            # Track token usage
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                self._update_token_usage(response.usage_metadata)

        except Exception as e:
            logger.error(f"[{self.__class__.__name__}] Generation error: {e}")
            raise

    async def generate_content_async(self, prompt: str) -> str:
        """Non-streaming — trả full text + token tracking."""
        if not self._chat_session:
            self.start_session()

        try:
            response = await self._chat_session.send_message_async(prompt)

            # Track token usage
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                self._update_token_usage(response.usage_metadata)

            return response.text

        except Exception as e:
            logger.error(f"[{self.__class__.__name__}] Generation error: {e}")
            raise

    async def generate_standalone(self, prompt: str) -> str:
        """Tạo response không dùng chat session (1-shot, không giữ history)."""
        try:
            response = await self.model.generate_content_async(prompt)

            if hasattr(response, "usage_metadata") and response.usage_metadata:
                self._update_token_usage(response.usage_metadata)

            return response.text

        except Exception as e:
            logger.error(f"[{self.__class__.__name__}] Standalone gen error: {e}")
            raise

    def _update_token_usage(self, usage_metadata):
        """Cập nhật tích lũy token usage."""
        if hasattr(usage_metadata, "prompt_token_count"):
            self._token_usage["input"] += usage_metadata.prompt_token_count or 0
        if hasattr(usage_metadata, "candidates_token_count"):
            self._token_usage["output"] += usage_metadata.candidates_token_count or 0
        self._token_usage["total"] = (
            self._token_usage["input"] + self._token_usage["output"]
        )

    def get_token_usage(self) -> dict:
        """Trả về token usage tích lũy."""
        return self._token_usage.copy()

    def reset_token_usage(self):
        """Reset token counter."""
        self._token_usage = {"input": 0, "output": 0, "total": 0}

    def reset_session(self):
        """Reset chat session."""
        self._chat_session = None
        self.reset_token_usage()
