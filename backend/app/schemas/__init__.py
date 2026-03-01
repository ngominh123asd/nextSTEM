from app.schemas.auth import (
    TokenResponse,
    LoginRequest,
    RegisterRequest,
)
from app.schemas.user import (
    UserRead,
    UserUpdate,
    OnboardingRequest,
    PreferenceRead,
    PreferenceUpdate,
)
from app.schemas.chat import (
    ChatSessionRead,
    ChatSessionCreate,
    ChatMessageRead,
    ChatMessageCreate,
)
from app.schemas.portfolio import (
    ProjectRead,
    ProjectCreate,
    CertificateRead,
    CertificateCreate,
    ActivityRead,
)
from app.schemas.roadmap import (
    RoadmapRead,
    RoadmapTaskToggle,
)
from app.schemas.document import (
    DocumentRead,
    DocumentCreate,
    DocumentUpdate,
)
