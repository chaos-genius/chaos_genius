"""Apache Trino connector."""

import pandas as pd
from sqlalchemy import create_engine, text

from chaos_genius.connectors.base_db import BaseDb

from .connector_utils import merge_dataframe_chunks


class Trino(BaseDb):
    """Apache Trino connector."""

    test_db_query = "SELECT 1"

    def get_db_uri(self):
        """Create SQLAlchemy URI from data source info."""
        db_info = self.ds_info
        if db_info is None:
            raise Exception("Datasource info not found for Trino.")

        host = db_info.get("host")
        port = int(db_info.get("port"))
        username = db_info.get("username")
        catalog = db_info.get("catalog")
        password = db_info.get("password")
        if not (host and port and catalog):
            raise Exception("Database Credential not found for Trino.")

        if not (username and password):
            self.sqlalchemy_db_uri = f"trino://{host}:{port}/{catalog}"
        else:
            self.sqlalchemy_db_uri = (
                f"trino://{username}:{password}@{host}:{port}/{catalog}"
            )
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        """Create an SQLAlchemy engine from data source info."""
        db_uri = self.get_db_uri()
        self.engine = create_engine(
            db_uri, echo=self.debug, connect_args={"http_scheme": "https", "verify": False}
        )
        return self.engine

    def test_connection(self):
        """Test data source connection."""
        if not hasattr(self, "engine") or not self.engine:
            self.engine = self.get_db_engine()
        query_text = text(self.test_db_query)
        status, message = None, ""
        try:
            with self.engine.connect() as connection:
                cursor = connection.execute(query_text)
                results = cursor.all()
                if results[0][0] == 1:
                    status = True
                else:
                    status = False
        except Exception as err_msg:  # noqa: B902
            status = False
            message = str(err_msg)
        return status, message

    def run_query(self, query, as_df=True):
        """Run a SQL query."""
        engine = self.get_db_engine()
        if as_df:
            return merge_dataframe_chunks(
                pd.read_sql_query(query, engine, chunksize=self.CHUNKSIZE)
            )
        else:
            return []

    def get_schema(self):
        """Get schema name."""
        schema_name = self.ds_info.get("schema") if self.ds_info is not None else None
        if schema_name:
            self.schema = schema_name
        else:
            self.schema = "public"
        return self.schema

    def get_schema_names_list(self):
        data = self.inspector.get_schema_names()
        return data
