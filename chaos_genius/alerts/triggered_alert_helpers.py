from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.sql.functions import coalesce

from chaos_genius.databases.models.triggered_alerts_model import TriggeredAlerts

def update_alert_metadata(key: str, value: str):
        """Update a single key in alert_metadata.

        The return value *must* be assigned back to TriggeredAlerts.alert_metadata
        and alert_metadata must be flagged as modified
        and then the TriggeredAlerts must be updated and saved in DB.

        Warning: do not call this twice before saving to DB. The previous
        change will be lost.
        """
        return func.jsonb_set(
            coalesce(TriggeredAlerts.alert_metadata, "{}"), "{" + key + "}", f'"{value}"'
        )

def set_alert_metadata(triggered_alert, alert_metadata):
    
    for key, value in alert_metadata.items():
        triggered_alert.alert_metadata = update_alert_metadata(
                                            key, 
                                            value
                                        )
        # write back scheduler_params
        flag_modified(triggered_alert, "alert_metadata")
        triggered_alert = triggered_alert.update(commit=True)