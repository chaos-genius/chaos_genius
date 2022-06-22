import pandas as pd
from urllib.parse import quote_plus
from sqlalchemy.engine import create_engine
from sqlalchemy import text
from pyathena import connect
from pyathena.pandas.cursor import PandasCursor

from .base_db import BaseDb
from .connector_utils import merge_dataframe_chunks


class AwsAthenaDb(BaseDb):

    __SQL_DATE_FORMAT = "timestamp '%Y-%m-%d 00:00:00{}'"
    __SQL_STRPTIME_FORMAT = "timestamp '%Y-%m-%d %H:%M:%S%z'"
    __SQL_STRFTIME_FORMAT = "timestamp '%Y-%m-%d %H:%M:%S'"
    __SQL_IDENTIFIER = '"'

    @property
    def sql_identifier(self):
        """Used to quote SQL illegal identifiers."""
        return self.__SQL_IDENTIFIER

    @property
    def sql_date_format(self):
        """String format to add time to a date along with an offset."""
        return self.__SQL_DATE_FORMAT

    @property
    def sql_strptime_format(self):
        """Format to convert strings into dates."""
        return self.__SQL_STRPTIME_FORMAT

    @property
    def sql_strftime_format(self):
        """Format to convert dates into strings."""
        return self.__SQL_STRFTIME_FORMAT

    db_name = "aws athena"
    test_db_query = "SELECT 1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_db_uri(self):
        db_info = self.ds_info
        aws_access_key_id = db_info.get("aws_access_key_id")
        aws_secret_access_key = db_info.get("aws_secret_access_key")
        region_name = db_info.get("region_name")
        schema_name = db_info.get("schema_name", "default")
        s3_staging_dir = db_info.get("s3_staging_dir")
        if not (
            aws_access_key_id
            and aws_secret_access_key
            and region_name
            and s3_staging_dir
        ):
            raise NotImplementedError(
                "Database Credential not found for AWS Athena."
            )

        conn_string = "awsathena+rest://{aws_access_key_id}:{aws_secret_access_key}@athena.{region_name}.amazonaws.com/{schema_name}?s3_staging_dir={s3_staging_dir}".format(
            aws_access_key_id=quote_plus(aws_access_key_id),
            aws_secret_access_key=quote_plus(aws_secret_access_key),
            region_name=region_name,
            schema_name=schema_name,
            s3_staging_dir=quote_plus(s3_staging_dir),
        )
        self.sqlalchemy_db_uri = conn_string
        return self.sqlalchemy_db_uri

    def get_db_engine(self):
        db_uri = self.get_db_uri()
        self.engine = create_engine(db_uri, echo=self.debug)
        return self.engine

    def get_pyathena_engine(self):
        db_info = self.ds_info
        aws_access_key_id = db_info.get("aws_access_key_id")
        aws_secret_access_key = db_info.get("aws_secret_access_key")
        region_name = db_info.get("region_name")
        s3_staging_dir = db_info.get("s3_staging_dir")
        if not (
            aws_access_key_id
            and aws_secret_access_key
            and region_name
            and s3_staging_dir
        ):
            raise NotImplementedError(
                "Database Credential not found for AWS Athena."
            )
        cursor = connect(
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            s3_staging_dir=s3_staging_dir,
            region_name=region_name,
            cursor_class=PandasCursor,
        ).cursor()
        return cursor

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
        schema_name = self.ds_info.get("schema")
        if schema_name:
            self.schema = schema_name
        else:
            self.schema = "default"
        return self.schema

    def get_schema_names_list(self):
        data = self.inspector.get_schema_names()
        return data
