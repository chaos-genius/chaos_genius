import logging
import re

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc as sqlalchemy_exc
from sqlalchemy import text

logger = logging.getLogger(__name__)


class BaseDb:

    __SQL_IDENTIFIER = ""
    __SQL_DATE_FORMAT = "'%Y-%m-%dT00:00:00{}'"
    __SQL_STRPTIME_FORMAT = "'%Y-%m-%dT%H:%M:%S%z'"
    __SQL_STRFTIME_FORMAT = "'%Y-%m-%dT%H:%M:%S'"

    @property
    def sql_identifier(self):
        """Used to quote SQL illegal identifiers."""
        return self.__SQL_IDENTIFIER

    @property
    def sql_date_format(self):
        """String format to convert date to datetime along with an offset."""
        return self.__SQL_DATE_FORMAT

    @property
    def sql_strptime_format(self):
        """Format to convert strings into dates."""
        return self.__SQL_STRPTIME_FORMAT

    @property
    def sql_strftime_format(self):
        """Format to convert dates into strings."""
        return self.__SQL_STRFTIME_FORMAT

    def __init__(self, *args, **kwargs):
        self.ds_info = kwargs.get("connection_info")
        self.CHUNKSIZE = 20000
        self.debug = False

    def get_db_uri(self):
        raise NotImplementedError()

    def get_db_engine(self):
        raise NotImplementedError()

    def test_connection(self):
        raise NotImplementedError()

    def run_query(self, query):
        raise NotImplementedError()

    def get_schema(self):
        raise NotImplementedError()

    def init_inspector(self):
        if not hasattr(self, "engine") or not self.engine:
            self.engine = self.get_db_engine()
        self.inspector = SQLAlchemy().inspect(self.engine)
        return self.inspector

    def get_schema_metadata(self, get_sequences=False, tables=[]):
        """Gets all the metadata for the schema provided as input.

        Output: A multi-dimensional dictionary.
        """
        schema = self.get_schema()
        table_dictionary = {}
        db_tables = self.get_tables(use_schema=schema)
        if tables:
            db_tables = list(set(db_tables) & set(tables))
        for db_table in db_tables:
            try:
                table_dictionary_info = {
                    "table_columns": self.get_columns(db_table, use_schema=schema)
                }

                table_dictionary_info["primary_key"] = self.get_primary_key(
                    db_table, use_schema=schema
                )
                table_dictionary_info[
                    "table_comment"
                ] = self.get_table_comment(db_table, use_schema=schema)
                table_dictionary[db_table] = table_dictionary_info
            except sqlalchemy_exc.ResourceClosedError:
                logger.warn(f"get_columns failed for table: {db_table}")

        schema_dict = {"tables": table_dictionary}
        if get_sequences:
            schema_sequences = self.get_sequences(use_schema=schema)
            schema_dict["sequences"] = schema_sequences
        return schema_dict

    def get_schema_metadata_from_query(self, query):
        """Gets all the metadata for the schema provided as input.

        Output: A multi-dimensional dictionary.
        """
        table_dictionary_info = {}
        table_columns = []

        # smartly add the limit 1
        query = query.strip()
        if query[-1] == ";":
            query = query[:-1]
        if not re.search(r"\s+limit\s+", query, re.IGNORECASE):
            query += " limit 1 "

        query_text = text(query)
        with self.engine.connect() as connection:
            results = connection.execute(query_text)
            # Using the ResultProxy's keys method instead of the
            # DBAPI cursor description. Some DB/DW (snowflake) can
            # create inconsistency becuase of their case insensitive
            # nature and can do automated case conversion for metadata
            columns = results.keys()
            table_columns.extend({"name": col, "type": "TEXT"} for col in columns)
            table_dictionary_info["table_columns"] = table_columns
        table_dictionary = {"query": table_dictionary_info}
        return {"tables": table_dictionary}

    def get_tables(self, use_schema=None):
        """Returns an array with the names of all tables in the db's schema."""
        return self.inspector.get_table_names(schema=use_schema)

    def get_columns(self, use_table, use_schema=None):
        """Returns an array with information about all columns in a table.

        Example Output:
        [
            {'name': 'id', 'type': INTEGER(), 'nullable': False,
             'default': 'nextval(\'"API_secrets_id_seq"\'::regclass)',
             'autoincrement': True, 'comment': "None"},
            {'name': 'secret', 'type': BYTEA(), 'nullable': False,
             'default': None, 'autoincrement': False, 'comment': "None"},
            {'name': 'datatime', 'type': TIMESTAMP(), 'nullable': True,
             'default': None, 'autoincrement': False, 'comment': "None"}
        ]
        """
        db_columns = self.inspector.get_columns(
            table_name=use_table, schema=use_schema
        )

        for column in db_columns:
            try:
                if column.get("comment") is None:
                    column["comment"] = "None"
                if column.get("default") is None:
                    column["default"] = "None"
                column["type"] = str(column["type"])
            except Exception as error:
                logger.warn(f"Get Columns details failed for table: {use_table}")
                logger.warn(f"{error}")
                continue

        return db_columns

    def get_primary_key(self, use_table, use_schema=None):
        """Returns the name of the primary key, or "None" if there is no primary key."""
        return self.inspector.get_pk_constraint(
            table_name=use_table, schema=use_schema
        )

    def get_table_comment(self, use_table, use_schema=None):
        """Returns the comment linked with the database table.

        Returns "None" if there is no comment.
        """
        table_comment = self.inspector.get_table_comment(
            table_name=use_table, schema=use_schema
        )["text"]
        if table_comment is None:
            table_comment = "None"
        return table_comment

    def get_sequences(self, use_schema=None):
        """Returns n array with the names of all sequences in the database's schema.

        Example Output:
            ['secrets_id_seq', 'API_secrets_id_seq', 'hashed__encryption_id_seq']
        """
        return self.inspector.get_sequence_names(schema=use_schema)

    def get_view_names_list(self, schema_name):
        return self.inspector.get_view_names(schema=schema_name)

    def resolve_identifier(self, identifier: str) -> str:
        """Resolve the identifier if it uses special characters."""
        return identifier
