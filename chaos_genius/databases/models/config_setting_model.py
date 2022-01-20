# -*- coding: utf-8 -*-
"""ConfigSetting model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class ConfigSetting(PkModel):
    """A ConfigSetting."""

    __tablename__ = "config_setting"
    name = Column(db.String(80), nullable=False)
    config_setting = Column(db.JSON)
    active = Column(db.Boolean(), default=True)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<ConfigSetting({self.name})>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "config_setting": self.config_setting,
            "active": self.active,
            "created_at": self.created_at,
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "config_setting": self.config_setting,
            "active": self.active,
            "created_at": self.created_at,
        }

    @classmethod
    def meta_info(cls):
        # TODO: Make this consistent with other models
        return {
            "slack": {
                "webhook_url": {
                    "is_editable": True,
                    "is_sensitive": True,
                },
                "channel_name": {
                    "is_editable": True,
                    "is_sensitive": False,
                }
            },
            "email": {
                "server": {
                    "is_editable": True,
                    "is_sensitive": False,
                },
                "port": {
                    "is_editable": True,
                    "is_sensitive": False,
                },
                "username": {
                    "is_editable": True,
                    "is_sensitive": True,
                },
                "password": {
                    "is_editable": True,
                    "is_sensitive": True,
                },
                "sender_email": {
                    "is_editable": True,
                    "is_sensitive": False,
                }
            },
            "organisation_settings": {
                "account": {
                    "email": {
                        "is_editable": True,
                        "is_sensitive": False
                    }
                },
                "metrics": {
                    "anonymize_usage_data_collection": {
                        "is_editable": True,
                        "is_sensitive": False
                    },
                    "news_and_feature_updates": {
                        "is_editable": True,
                        "is_sensitive": False
                    }
                }
            },
            "alert_digest_settings": {
                "active": {
                    "is_editable": True,
                    "is_sensitive": False
                },
                "daily_digest": {
                    "is_editable": True,
                    "is_sensitive": False
                },
                "weekly_digest": {
                    "is_editable": True,
                    "is_sensitive": False
                },
                "scheduled_time": {
                    "is_editable": True,
                    "is_sensitive": False
                }
            }
        }

    @classmethod
    def get_meta_info(cls, config_name):
        print(cls, config_name)
        if config_name and cls.meta_info().get(config_name):
            return cls.meta_info().get(config_name)
        else:
            return {}
