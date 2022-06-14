import pandas as pd
from sqlalchemy import create_engine, text

from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks


class Redshift(BaseDb):
    db_name = "redshift"
    test_db_query = "SELECT 1"

    __SQL_IDENTIFIER = '"'

    @property
    def sql_identifier(self):
        """Used to quote SQL illegal identifiers."""
        return self.__SQL_IDENTIFIER

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_db_uri(self):
        db_info = self.ds_info
        host = db_info.get("host")
        port = int(db_info.get("port"))
        username = db_info.get("username")
        database = db_info.get("database")
        password = db_info.get("password")
        if not(host and port and username and password and database):
            raise NotImplementedError("Database Credential not found for Redshift.")
        self.sqlalchemy_db_uri = (
            f"redshift+psycopg2://{username}:{password}@{host}:{port}/{database}"
        )
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        self.engine = create_engine(db_uri)
        return self.engine

    def test_connection(self):
        if not hasattr(self, 'engine') or not self.engine:
            self.engine = self.get_db_engine()
        query_text = text(self.test_db_query)
        status, message = None, ""
        try:
            with self.engine.connect() as connection:
                cursor = connection.execute(query_text)
                results = cursor.all()
                status = results[0][0] == 1
        except Exception as err_msg:
            status = False
            message = str(err_msg)
        return status, message

    def run_query(self, query, as_df=True):
        engine = self.get_db_engine()
        if as_df:
            return merge_dataframe_chunks(pd.read_sql_query(query,
                                                            engine,
                                                            chunksize=self.CHUNKSIZE))
        else:
            return []

    def get_schema(self):
        schema_name = self.ds_info.get('schema')
        self.schema = schema_name or 'public'
        return self.schema

    def get_schema_names_list(self):
        return self.inspector.get_schema_names()
