import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy import text
from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks

class Druid(BaseDb):
    db_name = "druid"
    test_db_query = "SELECT 1"
    druid_internal_tables = ["COLUMNS",
                             "SCHEMATA",
                             "TABLES",
                             "segments",
                             "server_segments",
                             "servers",
                             "supervisors",
                             "tasks"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_db_uri(self):
        db_info = self.ds_info
        host = db_info.get("host")
        port = int(db_info.get("port"))
        username = db_info.get("username")
        password = db_info.get("password")
        if not(host and port):
            raise NotImplementedError("Database Credential not found for Druid.")

        if not(username and password):
            self.sqlalchemy_db_uri = f"druid://{host}:{port}/druid/v2/sql/"
        else:
            self.sqlalchemy_db_uri = f"druid://{username}:{password}@{host}:{port}/druid/v2/sql/"
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        self.engine = create_engine(db_uri, echo=self.debug)
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
                if results[0][0] == 1:
                    status = True
                else:
                    status = False
        except Exception as err_msg:
            status = False
            message = str(err_msg)
        return status, message

    def get_tables(self, use_schema=None):
        all_tables = self.inspector.get_table_names(schema=use_schema)
        filtered_tables = [table for table in all_tables if table not in self.druid_internal_tables]
        return filtered_tables

    def get_columns(self, use_table, use_schema=None):
        db_columns = self.inspector.get_columns(table_name=use_table, schema=use_schema)
        for i in range(len(db_columns)):
            if db_columns[i]["default"] is None:
                db_columns[i]["default"] = "None"

            db_columns[i]['type'] = str(db_columns[i]['type'])
        return db_columns


    def run_query(self, query, as_df=True):
        engine = self.get_db_engine()
        if as_df == True:
            return merge_dataframe_chunks(pd.read_sql_query(query,
                                                            engine,
                                                            chunksize=self.CHUNKSIZE))
        else:
            return []

    def get_schema(self):
        self.schema = None
        return self.schema

    def get_schema_names_list(self):
        return None

    def get_sequences(self, use_schema=None):
        return None
