# -*- coding: utf-8 -*-
"""DataSource model."""
import datetime as dt

from chaos_genius.databases.base_model import Column, PkModel, db


class DataSource(PkModel):
    """A DataSource for given database."""

    __tablename__ = "data_source"
    name = Column(db.String(80), nullable=False)
    connection_type = Column(db.String(80))  # TODO: Make the nullable=False
    db_uri = Column(db.Text())
    active = Column(db.Boolean(), default=False)
    is_third_party = Column(db.Boolean(), default=True)
    connection_status = Column(db.String(80))
    sync_status = Column(db.String(80))
    database_timezone = Column(db.String(80), server_default='UTC', nullable=False)

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
        return f"<DataSource:{self.connection_type} ({self.name})>"

    @property
    def safe_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "connection_type": self.connection_type,
            "active": self.active,
            "is_third_party": self.is_third_party,
            "connection_status": self.connection_status,
            "sync_status": self.sync_status,
            "database_timezone": self.database_timezone,
            "last_sync": self.last_sync,
            "created_at": self.created_at
        }

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "connection_type": self.connection_type,
            "db_uri": self.db_uri,
            "is_third_party": self.is_third_party,
            "connection_status": self.connection_status,
            "sync_status": self.sync_status,
            "database_timezone": self.database_timezone,
            "sourceConfig": self.sourceConfig,
            "destinationConfig": self.destinationConfig,
            "connectionConfig": self.connectionConfig,
            "dbConfig": self.dbConfig,
            "last_sync": self.last_sync,
            "active": self.active,
            "created_at": self.created_at
        }

    @classmethod
    def meta_info(cls):
        return{
            "name": "data_source",
            "table_name": "data_source",
            "fields": [
                {
                    "name": "name",
                    "is_editable": True,
                    "is_sensitive": False,
                },
                {
                    "name": "connection_type",
                    "is_editable": False,
                    "is_sensitive": False,
                },
                {
                    "name": "db_uri",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "is_third_party",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "connection_status",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "sync_status",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "database_timezone",
                    "is_editable": True,
                    "is_sensitive": True,

                },
                {
                    "name": "sourceConfig",
                    "is_editable": True,
                    "is_sensitive": True,

                },
                {
                    "name": "destinationConfig",
                    "is_editable": True,
                    "is_sensitive": True,

                },
                {
                    "name": "connectionConfig",
                    "is_editable": True,
                    "is_sensitive": True,

                },
                {
                    "name": "dbConfig",
                    "is_editable": True,
                    "is_sensitive": True,

                },
                {
                    "name": "last_sync",
                    "is_editable": False,
                    "is_sensitive": False,

                },
                {
                    "name": "created_at",
                    "is_editable": False,
                    "is_sensitive": False,

                }
            ]

        }
