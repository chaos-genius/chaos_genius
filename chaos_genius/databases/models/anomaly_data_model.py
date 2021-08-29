# -*- coding: utf-8 -*-
"""anomaly data model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class AnomalyDataOutput(PkModel):
    """Anomaly Data."""

    __tablename__ = "anomaly_data_output"
    data_datetime = Column(db.DateTime, default=dt.datetime.utcnow)
    y = Column(db.Float)
    yhat_upper = Column(db.Float)
    yhat_lower = Column(db.Float)
    is_anomaly = Column(db.BigInteger)
    severity = Column(db.Float)
    kpi_id = Column(db.Integer, nullable=False)
    anomaly_type = Column(db.String(80), nullable=False) # overall, drilldown, data_quality
    series_type = Column(db.String(80))
    index = Column(db.BigInteger, nullable=False)

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Anomaly Data({self.kpi_id})>"

    @property
    def as_dict(self):
        return {
            "index": self.index,
            "kpi_id": self.kpi_id,
            "anomaly_type": self.anomaly_type,
            "series_type": self.series_type,
            "y": self.y,
            "yhat_lower": self.yhat_lower,
            "yhat_upper": self.yhat_upper,
            "is_anomaly": self.is_anomaly,
            "severity": self.severity,
            "data_datetime": self.data_datetime
        }
