"""remove change message and percent from older triggered alerts

Revision ID: b176fdcdff99
Revises: 4dc7b0472e64
Create Date: 2022-09-23 19:15:37.568437

"""
import sqlalchemy as sa
from alembic import op
from flask import json

# revision identifiers, used by Alembic.
revision = "b176fdcdff99"
down_revision = "4dc7b0472e64"
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    trig_alerts = conn.execute(
        "SELECT * FROM triggered_alerts WHERE alert_type = 'KPI Alert';"
    )

    # rename "percent_change" to "_old_percent_change"
    for trig_alert in trig_alerts:
        alert_metadata = trig_alert["alert_metadata"]

        if "alert_data" in alert_metadata:
            for data in alert_metadata["alert_data"]:
                if "percent_change" in data:
                    data["_old_percent_change"] = data.pop("percent_change")

                for subdim_data in data.get("relevant_subdims_", []) or []:
                    if "percent_change" in subdim_data:
                        subdim_data["_old_percent_change"] = subdim_data.pop(
                            "percent_change"
                        )

            conn.execute(
                sa.text(
                    "UPDATE triggered_alerts SET alert_metadata = :metadata WHERE id = :id;"
                ),
                {"metadata": json.dumps(alert_metadata), "id": trig_alert["id"]},
            )


def downgrade():
    # rename "_old_percent_change" to "percent_change"
    conn = op.get_bind()

    trig_alerts = conn.execute(
        "SELECT * FROM triggered_alerts WHERE alert_type = 'KPI Alert';"
    )

    # rename "percent_change" to "_old_percent_change"
    for trig_alert in trig_alerts:
        alert_metadata = trig_alert["alert_metadata"]

        if "alert_data" in alert_metadata:
            for data in alert_metadata["alert_data"]:
                if "_old_percent_change" in data:
                    data["percent_change"] = data.pop("_old_percent_change")

                for subdim_data in data.get("relevant_subdims_", []) or []:
                    if "_old_percent_change" in subdim_data:
                        subdim_data["percent_change"] = subdim_data.pop(
                            "_old_percent_change"
                        )

            conn.execute(
                sa.text(
                    "UPDATE triggered_alerts SET alert_metadata = :metadata WHERE id = :id;"
                ),
                {"metadata": json.dumps(alert_metadata), "id": trig_alert["id"]},
            )
