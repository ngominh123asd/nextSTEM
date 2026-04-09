"""add_file_url_to_certificates

Revision ID: d4e5f6a7b8c9
Revises: a0968a4a25a9, 7d6c5b4a3921
Create Date: 2026-04-10 03:26:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, tuple, None] = ('a0968a4a25a9', '7d6c5b4a3921')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('certificates', sa.Column('file_url', sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column('certificates', 'file_url')
