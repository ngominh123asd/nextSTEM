"""ConversationMemory - short-term memory for the agent.

Stores recent chat history in RAM by session_id.
Limits number of messages to avoid context-window overflow.
"""

import logging
import os
import time
from collections import OrderedDict
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)

MAX_MESSAGES_PER_SESSION = 20
MAX_SESSIONS = 100
SESSION_TTL_SECONDS = int(os.getenv("AGENT_MEMORY_TTL_SECONDS", str(24 * 60 * 60)))


@dataclass
class Message:
    role: str  # "user" | "assistant"
    content: str
    timestamp: float = field(default_factory=time.time)


@dataclass
class Session:
    session_id: str
    messages: list[Message] = field(default_factory=list)
    facts: dict = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    last_active: float = field(default_factory=time.time)

    def add_message(self, role: str, content: str):
        """Append a message and trim old ones if needed."""
        self.messages.append(Message(role=role, content=content))
        self.last_active = time.time()

        # Keep the first message as anchor and most-recent tail.
        if len(self.messages) > MAX_MESSAGES_PER_SESSION:
            first = self.messages[0]
            self.messages = [first] + self.messages[-(MAX_MESSAGES_PER_SESSION - 1) :]

    def get_context_string(self, max_chars: int = 4000) -> str:
        """Return recent context text to inject into prompts."""
        if not self.messages:
            return ""

        lines: list[str] = []
        total = 0

        # Iterate backward to prioritize recent turns.
        for msg in reversed(self.messages):
            speaker = "Student" if msg.role == "user" else "AI"
            line = f"{speaker}: {msg.content}"
            if total + len(line) > max_chars:
                break
            lines.insert(0, line)
            total += len(line)

        return "\n".join(lines)

    def update_facts(self, new_facts: dict):
        """Merge explicit session facts for later turns."""
        if not new_facts:
            return
        self.facts.update(new_facts)
        self.last_active = time.time()

    def is_expired(self) -> bool:
        return (time.time() - self.last_active) > SESSION_TTL_SECONDS


class ConversationMemory:
    """In-memory conversation store with LRU eviction."""

    def __init__(self):
        self._sessions: OrderedDict[str, Session] = OrderedDict()
        # Pending clarification state per session_id.
        # Shape: {"query": str, "created_at": float}
        self._pending_clarification: OrderedDict[str, dict] = OrderedDict()

    def get_or_create(self, session_id: str) -> Session:
        """Return existing session or create a new one."""
        if session_id in self._sessions:
            session = self._sessions[session_id]
            self._sessions.move_to_end(session_id)

            if session.is_expired():
                logger.info("[Memory] Session %s expired, creating new", session_id[:8])
                del self._sessions[session_id]
                self._pending_clarification.pop(session_id, None)
                return self._create(session_id)

            return session

        return self._create(session_id)

    def _create(self, session_id: str) -> Session:
        """Create a new session and evict oldest if needed."""
        while len(self._sessions) >= MAX_SESSIONS:
            evicted_id, _ = self._sessions.popitem(last=False)
            logger.info("[Memory] Evicted session %s", evicted_id[:8])
            self._pending_clarification.pop(evicted_id, None)

        session = Session(session_id=session_id)
        self._sessions[session_id] = session
        return session

    def add_exchange(self, session_id: str, user_msg: str, ai_msg: str):
        """Add one user+assistant exchange."""
        session = self.get_or_create(session_id)
        session.add_message("user", user_msg)
        session.add_message("assistant", ai_msg)

    def get_context(self, session_id: str, max_chars: int = 4000) -> str:
        """Get context string for a session."""
        if session_id not in self._sessions:
            return ""
        return self._sessions[session_id].get_context_string(max_chars)

    def set_pending_clarification(
        self,
        session_id: str,
        query: str,
        metadata: dict | None = None,
    ):
        """Mark a session as waiting for clarification."""
        _ = self.get_or_create(session_id)
        payload = {
            "query": query,
            "created_at": time.time(),
        }
        if metadata:
            payload.update(metadata)
        self._pending_clarification[session_id] = payload
        self._pending_clarification.move_to_end(session_id)

    def get_pending_clarification(self, session_id: str) -> dict | None:
        """Return pending clarification payload if it is still valid."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        if session.is_expired():
            self._pending_clarification.pop(session_id, None)
            return None
        return self._pending_clarification.get(session_id)

    def clear_pending_clarification(self, session_id: str):
        self._pending_clarification.pop(session_id, None)

    def get_message_count(self, session_id: str) -> int:
        """Return message count in a session."""
        if session_id not in self._sessions:
            return 0
        return len(self._sessions[session_id].messages)

    def get_session_facts(self, session_id: str) -> dict:
        """Return explicit facts collected for this session."""
        session = self._sessions.get(session_id)
        if not session or session.is_expired():
            return {}
        return dict(session.facts)

    def update_session_facts(self, session_id: str, facts: dict):
        """Persist explicit user-provided facts for future turns."""
        session = self.get_or_create(session_id)
        session.update_facts(facts)

    def cleanup_expired(self):
        """Drop expired sessions."""
        expired = [sid for sid, s in self._sessions.items() if s.is_expired()]
        for sid in expired:
            del self._sessions[sid]
            self._pending_clarification.pop(sid, None)
        if expired:
            logger.info("[Memory] Cleaned up %s expired sessions", len(expired))


# Singleton
memory = ConversationMemory()
