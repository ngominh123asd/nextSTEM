"""init

Revision ID: 157211a0de8a
Revises: 7d6c5b4a3921
Create Date: 2024-05-18 10:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '157211a0de8a'
down_revision: Union[str, None] = '7d6c5b4a3921'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
