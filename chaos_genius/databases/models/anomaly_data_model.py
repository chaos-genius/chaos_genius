# -*- coding: utf-8 -*-
"""anomaly data model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, Index, PkModel, db


class AnomalyDataOutput(PkModel):
    """Anomaly Data."""

    __tablename__ = "anomaly_data_output"
    __chunksize__ = 5

    data_datetime = Column(db.DateTime, default=dt.datetime.utcnow)
    y = Column(db.Float)
    yhat_upper = Column(db.Float)
    yhat_lower = Column(db.Float)
    is_anomaly = Column(db.BigInteger)
    severity = Column(db.Float)
    kpi_id = Column(db.Integer, nullable=False)
    # overall, drilldown, data_quality
    anomaly_type = Column(db.String(80), nullable=False)
    series_type = Column(db.String(500))
    index = Column(db.BigInteger, nullable=False)
    created_at = Column(db.DateTime, nullable=True,
                        default=dt.datetime.utcnow)

    __table_args__ = (
        Index("anomaly_data_output_query_idx", kpi_id, anomaly_type, series_type, data_datetime),
    )

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Anomaly Data({self.kpi_id})>"

    @property
    def as_dict(self):
        return {
            "data_datetime": self.data_datetime,
            "y": self.y,
            "yhat_upper": self.yhat_upper,
            "yhat_lower": self.yhat_lower,
            "is_anomaly": self.is_anomaly,
            "severity": self.severity,
            "kpi_id": self.kpi_id,
            "anomaly_type": self.anomaly_type,
            "series_type": self.series_type,
            "index": self.index,
            "created_at": self.created_at,
        }

# TODO: Delete model after a couple of weeks


class AnomalyData(PkModel):
    """Anomaly Data."""

    __tablename__ = "anomaly_data"
    kpi_id = Column(db.Integer, nullable=False)
    # overall, drilldown, data_quality
    anomaly_type = Column(db.String(80), nullable=False)
    base_anomaly_id = Column(db.Integer)
    drilldown_dimensions = Column(db.JSON)
    chart_data = Column(db.JSON)
    severity_score = Column(db.Integer)
    anomaly_timestamp = Column(db.BigInteger)
    created_at = Column(db.DateTime, nullable=False,
                        default=dt.datetime.utcnow)

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

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
