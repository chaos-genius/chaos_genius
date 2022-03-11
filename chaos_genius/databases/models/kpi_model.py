# -*- coding: utf-8 -*-
"""kpi model."""
import datetime as dt

from sqlalchemy.dialects.postgresql import JSONB

from chaos_genius.databases.base_model import Column, PkModel, db


class Kpi(PkModel):
    """A KPI."""

    __tablename__ = "kpi"
    name = Column(db.String(80), nullable=False)
    is_certified = Column(db.Boolean(), default=False)
    data_source = Column(db.Integer, nullable=False)

    kpi_type = Column(db.String(80), nullable=False)
    kpi_query = Column(db.Text(), nullable=False)
    schema_name = Column(db.Text(), nullable=True, default=None)
    table_name = Column(db.Text(), nullable=False)
    metric = Column(db.Text(), nullable=False)
    aggregation = Column(db.String(80), nullable=False)
    datetime_column = Column(db.Text(), nullable=False)
    filters = Column(db.JSON)
    dimensions = Column(db.JSON)
    timezone_aware = Column(db.Boolean(), nullable=False, default=False)

    run_anomaly = Column(db.Boolean(), default=True)
    anomaly_params = Column(db.JSON)
    scheduler_params = Column(JSONB, default=lambda: {})
    anomaly_frequency = Column(db.String(80))

    is_static = Column(db.Boolean(), default=False)
    static_params = Column(db.JSON)

    active = Column(db.Boolean(), default=True)
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
            "schema_name": self.schema_name,
            "table_name": self.table_name,
            "metric": self.metric,
            "aggregation": self.aggregation,
            "datetime_column": self.datetime_column,
            "dimensions": self.dimensions,
            "timezone_aware": self.timezone_aware,
            "run_anomaly": self.run_anomaly,
            "anomaly_params": self.anomaly_params,
            "scheduler_params": self.scheduler_params,
            "anomaly_frequency": self.anomaly_frequency,
            "is_static": self.is_static,
            "static_params": self.static_params,
            "active": self.active,
            "created_at": self.created_at,
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
            "schema_name": self.schema_name,
            "table_name": self.table_name,
            "metric": self.metric,
            "aggregation": self.aggregation,
            "datetime_column": self.datetime_column,
            "filters": self.filters,
            "dimensions": self.dimensions,
            "timezone_aware": self.timezone_aware,
            "run_anomaly": self.run_anomaly,
            "anomaly_params": self.anomaly_params,
            "scheduler_params": self.scheduler_params,
            "anomaly_frequency": self.anomaly_frequency,
            "is_static": self.is_static,
            "static_params": self.static_params,
            "active": self.active,
            "created_at": self.created_at,
        }


    @classmethod
    def meta_info(cls):
        return {
            "name": "Kpi",
            "table_name": "kpi",
            "fields": [
                {
                    "name": "name",
                    "is_editable": True,
                    "is_sensitive": False,
                },
                {
                    "name": "is_certified",
                    "is_editable": True,
                    "is_sensitive": False,
                },
                {
                    "name": "data_source",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "kpi_type",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "kpi_query",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "table_name",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "metric",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "aggregation",
                    "is_editable": False,
                    "is_sensitive": False,
                    "options": [{
                        "label": "Mean",
                        "value": "mean"
                    }, {
                        "label": "Sum",
                        "value": "sum"
                    }, {
                        "label": "Count",
                        "value": "count"
                    }]
                },
                {
                    "name": "datetime_column",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "filters",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "dimensions",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "timezone_aware",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                # TODO: Fix this with some better implementation
                {
                    "name": "dashboards",
                    "is_editable": True,
                    "is_sensitive": False,
                },
            ],
        }
