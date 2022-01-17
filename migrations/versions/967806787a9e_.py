"""Update RCA timelines to the new format.

Revision ID: 967806787a9e
Revises: d2b01087c980
Create Date: 2022-01-17 13:30:52.744183

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = '967806787a9e'
down_revision = 'd2b01087c980'
branch_labels = None
depends_on = None


def upgrade():
    queries = [
        "UPDATE public.rca_data SET timeline='last_30_days' WHERE timeline='mom';",
        "UPDATE public.rca_data SET timeline='last_7_days' WHERE timeline='wow';",
        "UPDATE public.rca_data SET timeline='previous_day' WHERE timeline='dod';",
    ]
    for query in queries:
        op.execute(query)


def downgrade():
    queries = [
        "UPDATE public.rca_data SET timeline='mom' WHERE timeline='last_30_days';",
        "UPDATE public.rca_data SET timeline='wow' WHERE timeline='last_7_days';",
        "UPDATE public.rca_data SET timeline='dod' WHERE timeline='previous_day';",
    ]
    for query in queries:
        op.execute(query)

    query = "DELETE FROM public.rca_data WHERE timeline NOT IN ('mom', 'wow', 'dod');"
    op.execute(query)
