"""Apache Databricks connector."""
import logging

import pandas as pd
from sqlalchemy import create_engine, text

from chaos_genius.connectors.base_db import BaseDb

from .connector_utils import merge_dataframe_chunks

logger = logging.getLogger(__name__)

class Databricks(BaseDb):
    """Apache Databricks connector."""

    test_db_query = "SELECT 1"

    def get_db_uri(self):
        """Create SQLAlchemy URI from data source info."""
        db_info = self.ds_info

        if db_info is None:
            raise Exception("Datasource info not found for Databricks.")

        host = db_info.get("host")
        access_token = db_info.get("access_token")
        cluster_http_path = db_info.get("cluster_http_path")

        if not (host and access_token and cluster_http_path):
            raise Exception("Database Credential not found for Databricks.")

        self.sqlalchemy_db_uri = f"databricks+connector://token:{access_token}@{host}:443"
        return self.sqlalchemy_db_uri

    def get_tables(self, use_schema=None):
        """Returns an array with the names of all tables in the db's schema."""
        # TODO: Replace catchall with specific error handling for schema with no tables
        try:
            return self.inspector.get_table_names(schema=use_schema)
        except Exception as err_msg:
            logger.warn(
                f"Failed to fetch tables for schema: {use_schema} for Databricks datasource, with error msg: {err_msg}"
            )
            return []

    def get_db_engine(self):
        """Create an SQLAlchemy engine from data source info."""
        db_info = self.ds_info
        db_uri = self.get_db_uri()

        catalog = db_info.get("catalog", "").strip()
        cluster_http_path = db_info.get("cluster_http_path")
        connect_args = {"http_path": cluster_http_path}
        if catalog:
            connect_args["catalog"] = catalog

        self.engine = create_engine(db_uri, echo=self.debug, connect_args=connect_args)
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
            logger.warn(
                f"Test connection failed while adding databricks Datasource, with error msg: {message}"
            )
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
            self.schema = "" # typically "hive_metastore"
        return self.schema

    def get_schema_names_list(self):
        data = self.inspector.get_schema_names()
        return data