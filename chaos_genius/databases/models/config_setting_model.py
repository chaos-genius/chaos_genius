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
