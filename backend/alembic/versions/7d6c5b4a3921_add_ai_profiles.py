"""add ai profiles table

Revision ID: 7d6c5b4a3921
Revises: a1b2c3d4e5f6
Create Date: 2026-03-25 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "7d6c5b4a3921"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ai_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("gpa_value", sa.Float(), nullable=True),
        sa.Column("gpa_scale", sa.Float(), nullable=True),
        sa.Column("target_countries", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("target_fields", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("budget_amount", sa.Float(), nullable=True),
        sa.Column("budget_currency", sa.String(length=16), nullable=True),
        sa.Column("needs_scholarship", sa.Boolean(), nullable=True),
        sa.Column("ielts", sa.Float(), nullable=True),
        sa.Column("toefl", sa.Float(), nullable=True),
        sa.Column("sat", sa.Integer(), nullable=True),
        sa.Column("act", sa.Integer(), nullable=True),
        sa.Column("intake_year", sa.Integer(), nullable=True),
        sa.Column("intake_term", sa.String(length=32), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", name=op.f("uq_ai_profiles_user_id")),
    )


def downgrade() -> None:
    op.drop_table("ai_profiles")
