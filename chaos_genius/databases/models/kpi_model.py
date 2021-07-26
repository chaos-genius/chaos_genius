# -*- coding: utf-8 -*-
"""kpi model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db

# TODO: Update the as dict here 

class Kpi(PkModel):
    """A KPI."""

    __tablename__ = "kpi"
    name = Column(db.String(80), nullable=False)
    is_certified = Column(db.Boolean(), default=False)
    data_source = Column(db.Integer, nullable=False)

    kpi_type = Column(db.String(80), nullable=False)
    kpi_query = Column(db.Text(), nullable=False)
    table_name = Column(db.Text(), nullable=False)
    metric = Column(db.Text(), nullable=False)
    aggregation = Column(db.String(80), nullable=False)
    datetime_column = Column(db.Text(), nullable=False)
    filters = Column(db.JSON)
    dimensions = Column(db.JSON)

    run_anomaly = Column(db.Boolean(), default=True)

    active = Column(db.Boolean(), default=False)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<KPI({self.name})>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_certified": self.is_certified,
            "data_source": self.data_source,
            "kpi_type": self.kpi_type,
            "kpi_query": self.kpi_query,
            "table_name": self.table_name,
            "metric": self.metric,
            "aggregation": self.aggregation,
            "active": self.active,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_certified": self.is_certified,
            "data_source": self.data_source,
            "kpi_type": self.kpi_type,
            "kpi_query": self.kpi_query,
            "table_name": self.table_name,
            "metric": self.metric,
            "aggregation": self.aggregation,
            "active": self.active,
            "created_at": self.created_at
        }
