"""Add the seed data for the dashboard table.

Revision ID: d2b01087c980
Revises: 289afabc70d3
Create Date: 2021-12-27 08:04:56.524462

"""
from datetime import datetime
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
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


def downgrade():
    pass
