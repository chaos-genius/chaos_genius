# -*- coding: utf-8 -*-
"""alert model."""
import datetime as dt

import sqlalchemy
from sqlalchemy.dialects.postgresql import JSONB

from chaos_genius.databases.base_model import Column, PkModel, db


class TriggeredAlerts(PkModel):
    """Storing alerts"""
    __tablename__ = "triggered_alerts"

    alert_conf_id = Column(db.Integer) #id of the alert configuration using which alert was triggered
    alert_type = Column(db.String(80), nullable=False) # Event Alert, KPI Alert
    is_sent = Column(db.Boolean(), default=True, nullable=False, server_default=sqlalchemy.sql.expression.literal(True))
    alert_metadata = Column(JSONB, default=lambda: {})
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow, index=True) #timestamp at which alert was sent

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Triggered Alert ({self.alert_type})>"

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "alert_conf_id": self.alert_conf_id,
            "alert_type": self.alert_type,
            "is_sent": self.is_sent,
            "alert_metadata": self.alert_metadata,
            "created_at": self.created_at
        }

    @classmethod
    def meta_info(cls):
        return{
            "name": "TriggeredAlerts",
            "table_name": "triggered_alerts",
            "fields":[
                {
                    "name": "alert_conf_id",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "alert_type",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "is_sent",
                    "is_editable": True,
                    "is_sensitive": False,

                },
                {
                    "name": "alert_metadata",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "created_at",
                    "is_editable": True,
                    "is_sensitive": False,

                }
            ]

        }
