# -*- coding: utf-8 -*-
"""DashboardKpiMapper model."""
import datetime as dt
from operator import index

from chaos_genius.databases.base_model import Column, PkModel, db


class DashboardKpiMapper(PkModel):
    """A DashboardKpiMapper."""

    __tablename__ = "dashboard_kpi_mapper"
    dashboard = Column(db.Integer, nullable=False, index=True)
    kpi = Column(db.Integer, nullable=False, index=True)
    active = Column(db.Boolean(), default=True)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<DashboardKpiMapper({self.id})>"

    @property
    def safe_dict(self):
        return {
            "dashboard": self.dashboard,
            "kpi": self.kpi,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "dashboard": self.dashboard,
            "kpi": self.kpi,
            "active": self.active,
            "created_at": self.created_at
        }
