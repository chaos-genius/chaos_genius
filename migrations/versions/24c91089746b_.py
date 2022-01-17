"""Update RCA aggregations to the new format.

Revision ID: 24c91089746b
Revises: 967806787a9e
Create Date: 2022-01-17 14:01:17.610411

"""
import json

import pandas as pd
import sqlalchemy as sa
from alembic import op

from chaos_genius.core.utils.round import round_number

# revision identifiers, used by Alembic.
revision = '24c91089746b'
down_revision = '967806787a9e'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    query = """
        select
            r.id,
            r.kpi_id,
            k.aggregation,
            r."data"
        from
            rca_data as r
        join kpi as k on
            r.kpi_id = k.id
        where
            r.data_type = 'agg';
    """
    df = pd.read_sql_query(query, conn)

    for row in df.to_dict(orient="records"):
        agg = row["aggregation"]

        g1_v = row["data"]["panel_metrics"]["grp1_metrics"].get(agg, 0)
        g2_v = row["data"]["panel_metrics"]["grp2_metrics"].get(agg, 0)
        diff = round_number(g2_v - g1_v)
        perc_diff = round_number((diff / g1_v) * 100 if g1_v else 0)

        row["data"] = json.dumps({
            "group1_value": g1_v,
            "group2_value": g2_v,
            "difference": diff,
            "perc_change": perc_diff,
        })

        op.execute(
            sa.text("""
                update rca_data
                set data = :data
                where id = :id
            """).bindparams(data=row["data"], id=row["id"])
        )


def downgrade():
    conn = op.get_bind()
    query = """
        select
            r.id,
            r.kpi_id,
            k.aggregation,
            r."data"
        from
            rca_data as r
        join kpi as k on
            r.kpi_id = k.id
        where
            r.data_type = 'agg';
    """
    df = pd.read_sql_query(query, conn)

    for row in df.to_dict(orient="records"):
        agg = row["aggregation"]

        g1_v = row["data"]["group1_value"]
        g2_v = row["data"]["group2_value"]
        impact = row["data"]["difference"]

        row["data"] = json.dumps({
            "panel_metrics": {
                "grp1_metrics": {agg: g1_v},
                "grp2_metrics": {agg: g2_v},
                "impact": {agg: impact},
            },
            "line_chart_data": [],
            "insights": []
        })

        op.execute(
            sa.text("""
                update rca_data
                set data = :data
                where id = :id
            """).bindparams(data=row["data"], id=row["id"])
        )
