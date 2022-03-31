# -*- coding: utf-8 -*-
"""data source metadata model."""
import datetime as dt

from sqlalchemy.dialects.postgresql import JSONB

from chaos_genius.databases.base_model import Column, PkModel, db


class DataSourceMetadata(PkModel):
    """Table for storing the metadata information of the data source."""
    __tablename__ = "data_source_metadata"

    data_source_id = Column(db.Integer, nullable=False, index=True)
    metadata_type = Column(db.String(80), nullable=False, index=True)
    metadata_param = Column(db.Text()) # TODO: should this be kept? current not being used
    metadata_info = Column(JSONB, default=lambda: {})
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, **kwargs):
        """Create instance."""
        super().__init__(**kwargs)

    def __repr__(self):
        """Represent instance as a unique string"""
        return f"<Data Source: {self.data_source_id}, Metadata: ({self.metadata_type})>"

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "data_source_id": self.data_source_id,
            "metadata_type": self.metadata_type,
            "metadata_param": self.metadata_param,
            "metadata_info": self.metadata_info,
            "created_at": self.created_at
        }
