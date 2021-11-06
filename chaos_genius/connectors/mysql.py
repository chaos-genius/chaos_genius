import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
from .base_db import BaseDb


class MysqlDb(BaseDb):
    db_name = "mysql"
    test_db_query = "SELECT 1"

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
            raise NotImplementedError("Database Credential not found for MySql.")
        self.sqlalchemy_db_uri = (
            f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
        )
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        if not self.engine:
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
        if as_df is True:
            return pd.read_sql_query(query, engine)
        else:
            return []

    def get_schema(self):
        self.schema = self.ds_info.get("database")
        return self.schema
