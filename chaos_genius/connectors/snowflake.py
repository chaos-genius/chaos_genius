import string

import pandas as pd
from snowflake.sqlalchemy import URL
from sqlalchemy import create_engine, text

from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks


class SnowflakeDb(BaseDb):
    db_name = "snowflake"
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
        role = db_info.get("role")
        warehouse = db_info.get("warehouse")
        database = db_info.get("database")
        schema = db_info.get("schema")
        username = db_info.get("username")
        password = db_info.get("password")
        if not (
            host
            and role
            and username
            and password
            and database
            and warehouse
            and schema
        ):
            raise NotImplementedError(
                "Database Credential not found for Snowflake."
            )
        sqlalchemy_db_uri = URL(
            account=host,
            user=username,
            password=password,
            database=database,
            schema=schema,
            warehouse=warehouse,
            role=role,
        )
        self.sqlalchemy_db_uri = sqlalchemy_db_uri
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
                status = results[0][0] == 1
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
        schema_name = self.ds_info.get("schema")
        self.schema = schema_name or "public"
        return self.schema

    def get_schema_names_list(self):
        return self.inspector.get_schema_names()

    def resolve_identifier(self, identifier: str) -> str:
        """Convert an identifier to a valid identifier.

        In case of snowflake, any lowercase string will be converted to uppercase
        or if it contains any illegal characters, it return the original string."""
        # this is necessary for snowflake as it treats unquoted identifiers as uppercase
        # by default but sqlalchemy treats them as lowercase, so we convert them to
        # uppercase before quoting them in the query.
        compare_string = string.ascii_lowercase + "_$"
        for char in identifier:
            if char not in compare_string:
                return identifier
        return identifier.upper()
