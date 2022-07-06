"""convert series_type to json in triggered_alerts

Revision ID: bdc4aecda345
Revises: 0a67e1d30de7
Create Date: 2022-06-27 14:35:01.095677

"""
import json
from typing import Optional

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "bdc4aecda345"
down_revision = "0a67e1d30de7"
branch_labels = None
depends_on = None


def upgrade():
    # get all triggered alerts of KPI Alerts
    conn = op.get_bind()

    trig_alerts = conn.execute(
        "SELECT * FROM triggered_alerts WHERE alert_type = 'KPI Alert';"
    )

    def conv_query_str_to_json(string: Optional[str]):
        if string is None:
            return None

        if string == "Overall KPI":
            return None

        splits = string.split(" = ")
        if len(splits) != 2:
            raise ValueError(f"Invalid series_type found: {string}")

        dimension, value = splits

        return {dimension: value}

    for trig_alert in trig_alerts:
        alert_metadata = trig_alert["alert_metadata"]

        if "alert_data" in alert_metadata:
            for data in alert_metadata["alert_data"]:
                data["series_type"] = conv_query_str_to_json(data["series_type"])

            conn.execute(
                sa.text(
                    "UPDATE triggered_alerts SET alert_metadata = :metadata WHERE id = :id;"
                ),
                {"metadata": json.dumps(alert_metadata), "id": trig_alert["id"]},
            )


def downgrade():
    # get all triggered alerts of KPI Alerts
    conn = op.get_bind()

    trig_alerts = conn.execute(
        "SELECT * FROM triggered_alerts WHERE alert_type = 'KPI Alert';"
    )

    def conv_json_to_query_string(maybe_json: Optional[dict]):
        if maybe_json is None:
            return None

        dimension, value = next(iter(maybe_json.items()))

        return f"{dimension} = {value}"

    for trig_alert in trig_alerts:
        alert_metadata = trig_alert["alert_metadata"]

        if "alert_data" in alert_metadata:
            for data in alert_metadata["alert_data"]:
                data["series_type"] = conv_json_to_query_string(data["series_type"])

            conn.execute(
                sa.text(
                    "UPDATE triggered_alerts SET alert_metadata = :metadata WHERE id = :id;"
                ),
                {"metadata": json.dumps(alert_metadata), "id": trig_alert["id"]},
            )
