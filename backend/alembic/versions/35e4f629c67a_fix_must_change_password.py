"""fix must_change_password column

Revision ID: 35e4f629c67a
Revises: 24d3e518b56f
Create Date: 2026-05-27 00:38:00.000000

"""
from alembic import op
import sqlalchemy as sa
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision = '35e4f629c67a'
down_revision: Union[str, tuple, None] = '24d3e518b56f'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('must_change_password', sa.Boolean(), server_default='false', nullable=False))

def downgrade():
    op.drop_column('users', 'must_change_password')
