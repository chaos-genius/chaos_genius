"""Added new anomaly data table

Revision ID: e10b2bb6682d
Revises: 7e2723132df3
Create Date: 2021-08-31 12:12:59.984125

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e10b2bb6682d"
down_revision = "7e2723132df3"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "anomaly_data_output",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("data_datetime", sa.DateTime(), nullable=True),
        sa.Column("y", sa.Float(), nullable=True),
        sa.Column("yhat_upper", sa.Float(), nullable=True),
        sa.Column("yhat_lower", sa.Float(), nullable=True),
        sa.Column("is_anomaly", sa.BigInteger(), nullable=True),
        sa.Column("severity", sa.Float(), nullable=True),
        sa.Column("kpi_id", sa.Integer(), nullable=False),
        sa.Column("anomaly_type", sa.String(length=80), nullable=False),
        sa.Column("series_type", sa.String(length=80), nullable=True),
        sa.Column("index", sa.BigInteger(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("anomaly_data_output")
    # ### end Alembic commands ###
