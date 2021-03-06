"""add alert_status to alert model

Revision ID: 7c504acbf3c4
Revises: d26c98f417da
Create Date: 2021-12-06 18:36:34.870331

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c504acbf3c4'
down_revision = 'd26c98f417da'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('alert', sa.Column('alert_status', sa.Boolean(), server_default=sa.text('true'), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('alert', 'alert_status')
    # ### end Alembic commands ###
