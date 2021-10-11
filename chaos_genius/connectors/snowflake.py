import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
from .base_db import BaseDb
from snowflake.sqlalchemy import URL


class SnowflakeDb(BaseDb):
    db_name = "snowflake"
    test_db_query = "SELECT 1"

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
        if not (host and role and username and password and database and warehouse and schema):
            raise NotImplementedError("Database Credential not found for Snowflake.")
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
        self.engine = create_engine(db_uri)
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
        if as_df == True:
            return pd.read_sql_query(query, engine)
        else:
            return []

    def get_schema(self):
        schema_name = self.ds_info.get("schema")
        if schema_name:
            self.schema = schema_name
        else:
            self.schema = "public"
        return self.schema
