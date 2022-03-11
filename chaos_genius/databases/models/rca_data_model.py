# -*- coding: utf-8 -*-
"""kpi model."""
import datetime as dt
from sqlalchemy.dialects.postgresql import JSONB

from chaos_genius.databases.base_model import Column, Index, PkModel, db


class RcaData(PkModel):
    """RCA Data"""

    __tablename__ = "rca_data"
    __chunksize__ = 5

    kpi_id = Column(db.Integer, nullable=False)
    end_date = Column(db.DateTime, nullable=False)
    data_type = Column(db.String(80), nullable=False) # line, agg, rca, htable
    timeline = Column(db.String(80), nullable=False)
    dimension = Column(db.Text(), nullable=True)
    data = Column(JSONB, nullable=True)
    created_at = Column(db.DateTime, nullable=False,
                        default=dt.datetime.utcnow)

    __table_args__ = (
        Index('rca_data_query_idx', kpi_id, data_type, end_date),
    )

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        unique_points = (
            self.kpi_id, self.end_date, self.data_type,
            self.timeline, self.dimension
        )
        return f"<RCA Data{unique_points}>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "kpi_id": self.kpi_id,
            "end_date": self.end_date,
            "datatype": self.data_type,
            "timeline": self.timeline,
            "dimension": self.dimension,
            "data": self.data,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "kpi_id": self.kpi_id,
            "end_date": self.end_date,
            "datatype": self.data_type,
            "timeline": self.timeline,
            "dimension": self.dimension,
            "data": self.data,
            "created_at": self.created_at
        }
