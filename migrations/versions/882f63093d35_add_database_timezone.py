"""add database timezone

Revision ID: 882f63093d35
Revises: 4c40273b1dea
Create Date: 2022-03-29 19:40:01.170591

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '882f63093d35'
down_revision = '4c40273b1dea'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('data_source', sa.Column('database_timezone', sa.String(length=80), server_default='UTC', nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('data_source', 'database_timezone')
    # ### end Alembic commands ###
