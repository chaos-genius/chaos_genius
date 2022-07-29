"""schedule DD/summary at the same time as anomaly for daily KPIs

Revision ID: e418aa6cb2e7
Revises: e3cb5f234bbf
Create Date: 2022-07-12 22:15:33.852430

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e418aa6cb2e7'
down_revision = 'e3cb5f234bbf'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    conn.execute("""
        UPDATE kpi
        SET scheduler_params = scheduler_params
            || jsonb_build_object('rca_time', scheduler_params->'time')
        WHERE scheduler_params ->> 'scheduler_frequency' = 'D'
    """)


def downgrade():
    conn = op.get_bind()

    conn.execute("""
        UPDATE kpi
        SET scheduler_params = scheduler_params - 'rca_time'
        WHERE scheduler_params ->> 'scheduler_frequency' = 'D'
            AND scheduler_params -> 'rca_time' = scheduler_params -> 'time';
    """)
