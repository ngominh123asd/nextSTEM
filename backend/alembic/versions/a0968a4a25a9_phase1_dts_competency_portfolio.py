"""Phase1 DTS Competency Portfolio

Revision ID: a0968a4a25a9
Revises: c1d2e3f4a5b6
Create Date: 2024-05-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a0968a4a25a9'
down_revision: Union[str, None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'certificates' not in tables:
        op.create_table('certificates', sa.Column('id', sa.UUID(), nullable=False), sa.PrimaryKeyConstraint('id'))

def downgrade() -> None:
    pass
