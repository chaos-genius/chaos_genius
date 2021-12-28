"""Add the seed data for the dashboard table.

Revision ID: d2b01087c980
Revises: 289afabc70d3
Create Date: 2021-12-27 08:04:56.524462

"""
from datetime import datetime
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column, text
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.sql.sqltypes import Boolean


# revision identifiers, used by Alembic.
revision = 'd2b01087c980'
down_revision = '289afabc70d3'
branch_labels = None
depends_on = None


def upgrade():
    dashboard = table('dashboard',
        column('name', String),
        column('active', Boolean),
        column('last_modified', DateTime),
        column('created_at', DateTime),
    )

    op.bulk_insert(dashboard, [
        {
            'name': 'All',
            'active': True,
            'last_modified': datetime.now(),
            'created_at': datetime.now()
        },
    ])

    # ref: https://stackoverflow.com/a/18739259/11199009
    conn = op.get_bind()

    all_dashboard_id = conn.execute(
        "SELECT id FROM dashboard WHERE name='All' AND active=true LIMIT 1"
    ).fetchone()[0]

    dashboard_kpi_mapper = table(
        "dashboard_kpi_mapper",
        column("dashboard", Integer),
        column("kpi", Integer),
        column("created_at", DateTime),
        column("active", Boolean),
    )

    all_kpi_ids = conn.execute("SELECT id FROM kpi").fetchall()

    op.bulk_insert(
        dashboard_kpi_mapper,
        [
            {
                "dashboard": all_dashboard_id,
                "kpi": kpi[0],
                "created_at": datetime.now(),
                "active": True
            } for kpi in all_kpi_ids
        ]
    )


def downgrade():
    conn = op.get_bind()

    all_dashboard_ids = conn.execute(
        "SELECT id FROM dashboard WHERE name='All' AND active=true"
    ).fetchall()

    for (all_dashboard_id,) in all_dashboard_ids:
        conn.execute(
            text("DELETE FROM dashboard_kpi_mapper WHERE id=:all_dashboard_id"),
            all_dashboard_id=all_dashboard_id
        )

    op.execute("DELETE FROM dashboard WHERE name='All' AND active=true")
