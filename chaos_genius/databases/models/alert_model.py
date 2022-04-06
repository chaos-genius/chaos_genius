# -*- coding: utf-8 -*-
"""alert model."""
import datetime as dt

import sqlalchemy

from chaos_genius.databases.base_model import Column, PkModel, db


class Alert(PkModel):
    """Alert."""
    __tablename__ = "alert"

    alert_name = Column(db.Text(), nullable=False)
    alert_type = Column(db.String(80), nullable=False) # Event Alert, KPI Alert
    alert_status = Column(db.Boolean(), default=True, nullable=False, server_default=sqlalchemy.sql.expression.literal(True))
    last_anomaly_timestamp = Column(db.DateTime, nullable=True, default=None)

    data_source = Column(db.Integer)
    alert_query = Column(db.Text())
    alert_settings = Column(db.String(80))

    kpi = Column(db.Integer)
    kpi_alert_type = Column(db.String(80))
    severity_cutoff_score = Column(db.Integer)

    alert_message = Column(db.Text())
    alert_frequency = Column(db.String(80))
    alert_channel = Column(db.String(80))
    alert_channel_conf = Column(db.JSON)

    active = Column(db.Boolean(), default=False)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    last_alerted = Column(db.DateTime, nullable=True)
    daily_digest = Column(db.Boolean(), default=False)
    weekly_digest = Column(db.Boolean(), default=False)

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Alert ({self.alert_type})>"

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "alert_name": self.alert_name,
            "alert_type": self.alert_type,
            "data_source": self.data_source,
            "alert_query": self.alert_query,
            "alert_settings": self.alert_settings,
            "kpi": self.kpi,
            "kpi_alert_type": self.kpi_alert_type,
            "severity_cutoff_score": self.severity_cutoff_score,
            "alert_message": self.alert_message,
            "alert_frequency": self.alert_frequency,
            "alert_channel": self.alert_channel,
            "alert_channel_conf": self.alert_channel_conf,
            "active": self.active,
            "created_at": self.created_at,
            "alert_status": self.alert_status,
            "last_anomaly_timestamp": self.last_anomaly_timestamp,
            "daily_digest": self.daily_digest,
            "weekly_digest": self.weekly_digest
        }


    @classmethod
    def meta_info(cls):
        return{
            "name": "Alert",
            "table_name": "alert",
            "fields":[
                {
                    "name": "alert_name",
                    "is_editable": True,
                    "is_sensitive": False,
                },
                {
                    "name": "alert_type",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "data_source",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_query",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_settings",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "kpi",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "kpi_alert_type",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "severity_cutoff_score",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_message",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_frequency",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_channel",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_channel_conf",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "daily_digest",
                    "is_editable": True,
                    "is_sensitive": False
                },
                {
                    "name": "weekly_digest",
                    "is_editable": True,
                    "is_sensitive": False
                }
            ]

        }

