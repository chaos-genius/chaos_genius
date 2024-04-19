import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks


class VerticaDb(BaseDb):

    __SQL_IDENTIFIER = '"'

    __SESSION_LABEL = "chaos_genius"
    __QUERY_LABEL = "chaos_genius"

    @property
    def sql_identifier(self):
        """Used to quote any SQL identifier in case of it using special characters or keywords."""
        return self.__SQL_IDENTIFIER

    db_name = "Vertica"
    test_db_query = f"SELECT /*+ KV,LABEL({__QUERY_LABEL}) */ 1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_db_uri(self):
        db_info = self.ds_info
        host = db_info.get("host")
        port = int(db_info.get("port"))
        username = db_info.get("username")
        database = db_info.get("database")
        password = db_info.get("password")
        if not (host and port and username and password and database):
            raise NotImplementedError(
                "Database Credential not found for Vertica."
            )
        self.sqlalchemy_db_uri = (
            f"vertica+vertica_python://{username}:{password}@{host}:{port}/{database}?session_label={self.__SESSION_LABEL}"
        )
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        self.engine = create_engine(db_uri, echo=self.debug)
        return self.engine

    def test_connection(self):
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
        except Exception as err_msg:
            status = False
            message = str(err_msg)
        return status, message

    def run_query(self, query, as_df=True):
        engine = self.get_db_engine()

        if as_df:
            return merge_dataframe_chunks(
                pd.read_sql_query(query, engine, chunksize=self.CHUNKSIZE)
            )
        else:
            return []

    def get_schema(self):
        self.schema = self.ds_info.get("database")
        return self.schema

    def get_schema_names_list(self):
        return None
