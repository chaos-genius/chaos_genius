"""merge dashboard and task table migration

Revision ID: 4ddac3e18069
Revises: a24d4e0bf8aa, d4aa58d3dc5d
Create Date: 2021-11-29 12:11:54.063531

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4ddac3e18069'
down_revision = ('a24d4e0bf8aa', 'd4aa58d3dc5d')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
