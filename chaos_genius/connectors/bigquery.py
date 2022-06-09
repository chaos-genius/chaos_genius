import json

import pandas as pd
from sqlalchemy import text
from sqlalchemy.engine import create_engine

from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks


class BigQueryDb(BaseDb):
    db_name = "bigquery"
    test_db_query = "SELECT 1"

    __SQL_IDENTIFIER = "`"

    @property
    def sql_identifier(self):
        """Used to quote SQL illegal identifiers."""
        return self.__SQL_IDENTIFIER

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_db_uri(self):
        db_info = self.ds_info
        project_id = db_info.get("project_id")
        credentials_json = db_info.get("credentials_json")
        dataset_id = db_info.get("dataset_id")
        if not (dataset_id and project_id and credentials_json):
            raise NotImplementedError("Credentials not found for Google BigQuery.")
        self.sqlalchemy_db_uri = f"bigquery://{project_id}"
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        credentials_info = self.ds_info.get("credentials_json")
        if not credentials_info:
            raise NotImplementedError("Credentials JSON not found for Google BigQuery.")
        credentials_info = json.loads(credentials_info)
        self.engine = create_engine(
            db_uri, credentials_info=credentials_info, echo=self.debug
        )
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
            return merge_dataframe_chunks(
                pd.read_sql_query(query, engine, chunksize=self.CHUNKSIZE)
            )
        else:
            return []

    def get_schema(self):
        self.schema = None
        return self.schema

    def get_schema_names_list(self):
        return None
