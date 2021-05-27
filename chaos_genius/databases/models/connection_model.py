# -*- coding: utf-8 -*-
"""Connection model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class Connection(PkModel):
    """A Connection for given database."""

    __tablename__ = "connection"
    name = Column(db.String(80), unique=True, nullable=False)
    db_uri = Column(db.Text(), nullable=False)
    active = Column(db.Boolean(), default=False)
    created_at = Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    def __init__(self, name, **kwargs):
        """Create instance."""
        super().__init__(name=name, **kwargs)

    def __repr__(self):
        """Represent instance as a unique string."""
        return f"<Connection({self.name})>"
