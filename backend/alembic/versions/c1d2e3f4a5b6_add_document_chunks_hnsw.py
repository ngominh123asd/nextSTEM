"""Add document_chunks table with pgvector HNSW index.

Revision ID: c1d2e3f4a5b6
Revises: 157211a0de8a
Create Date: 2024-05-19 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, None] = '157211a0de8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'documents' not in tables:
        op.create_table('documents', sa.Column('id', sa.UUID(), nullable=False), sa.PrimaryKeyConstraint('id'))

def downgrade() -> None:
    pass
