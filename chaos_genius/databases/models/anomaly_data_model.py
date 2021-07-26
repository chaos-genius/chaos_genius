# -*- coding: utf-8 -*-
"""anomaly data model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class AnomalyData(PkModel):
    """Anomaly Data."""

    __tablename__ = "anomaly_data"
    kpi_id = Column(db.Integer, nullable=False)
    anomaly_type = Column(db.String(80), nullable=False) # overall, drilldown, data_quality
    base_anomaly_id = Column(db.Integer)
    drilldown_dimensions = Column(db.JSON)
    chart_data = Column(db.JSON)
    severity_score = Column(db.Integer)
    anomaly_timestamp = Column(db.BigInteger)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Anomaly Data({self.kpi_id})>"

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "kpi_id": self.kpi_id,
            "anomaly_type": self.anomaly_type,
            "base_anomaly_id": self.base_anomaly_id,
            "drilldown_dimensions": self.drilldown_dimensions,
            "chart_data": self.chart_data,
            "severity_score": self.severity_score,
            "anomaly_timestamp": self.anomaly_timestamp,
            "created_at": self.created_at
        }
