# -*- coding: utf-8 -*-
"""Dashboard model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class Dashboard(PkModel):
    """A Dashboard."""

    __tablename__ = "dashboard"
    name = Column(db.String(80), nullable=False)
    active = Column(db.Boolean(), default=True)
    last_modified = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Dashboard({self.name})>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "active": self.active,
            "last_modified": self.last_modified,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "active": self.active,
            "last_modified": self.last_modified,
            "created_at": self.created_at
        }
