"""Add DTS models

Revision ID: 86babe9f4a67
Revises: a0968a4a25a9
Create Date: 2024-05-21 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86babe9f4a67'
down_revision: Union[str, None] = 'a0968a4a25a9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
