# -*- coding: utf-8 -*-
"""Connection model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class Connection(PkModel):
    """A Connection for given database."""

    __tablename__ = "connection"
    name = Column(db.String(80), nullable=False)
    connection_type = Column(db.String(80)) # TODO: Make the nullable=False
    db_uri = Column(db.Text())
    active = Column(db.Boolean(), default=False)
    is_third_party = Column(db.Boolean(), default=True)
    connection_status = Column(db.String(80))
    sync_status = Column(db.String(80))

    # configs field
    sourceConfig = Column(db.JSON)
    destinationConfig = Column(db.JSON)
    connectionConfig = Column(db.JSON)
    dbConfig = Column(db.JSON)

    # meta fields
    last_sync = Column(db.DateTime)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Connection:{self.connection_type} ({self.name})>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "connection_type": self.connection_type,
            "active": self.active,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "connection_type": self.connection_type,
            "db_uri": self.db_uri,
            "active": self.active,
            "created_at": self.created_at
        }
