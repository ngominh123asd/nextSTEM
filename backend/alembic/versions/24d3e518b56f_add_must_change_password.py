"""Add must_change_password to User model

Revision ID: 24d3e518b56f
Revises: 86babe9f4a67, d4e5f6a7b8c9
Create Date: 2026-05-24 17:07:00.000000

"""
from alembic import op
import sqlalchemy as sa
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision = '24d3e518b56f'
down_revision: Union[str, tuple, None] = ('86babe9f4a67', 'd4e5f6a7b8c9')
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('users', sa.Column('must_change_password', sa.Boolean(), server_default='false', nullable=False))

def downgrade():
    op.drop_column('users', 'must_change_password')
