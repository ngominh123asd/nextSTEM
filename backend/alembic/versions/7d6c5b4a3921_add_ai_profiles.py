"""add ai profiles table

Revision ID: 7d6c5b4a3921
Revises: b3c4d5e6f7a8
Create Date: 2024-05-18 10:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7d6c5b4a3921'
down_revision: Union[str, None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    if 'ai_profiles' not in tables:
        op.create_table('ai_profiles',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('career_path', sa.String(length=200), nullable=True),
        sa.Column('learning_style', sa.String(length=100), nullable=True),
        sa.Column('strengths', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('weaknesses', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('current_focus', sa.String(length=200), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
        )

def downgrade() -> None:
    op.drop_table('ai_profiles')
