import json
from sqlalchemy import text
from flask_sqlalchemy import SQLAlchemy

# TODO: Delete this file

class DbMetadata:
    """
    A class that can get metadata information about any database.
    To use, initialize the class and provide the database URI.
    """
    def __init__(self, database_uri):
        """
        Input: Database URI.
        Result: Initializes SQLAlchemy.
        """
        self.uri = database_uri
        self.db_traverse = SQLAlchemy()
        self.engine = None
        self.inspector = None

    def create_connection(self):
        """ Creates a connection to the database.
        Output:
            - If connection succeeds, it returns True.
            - If connections fails, it returns False.
        """
        try:
            self.engine = self.db_traverse.create_engine(sa_url=self.uri, engine_opts={})
            self.engine.connect()
            self.inspector = self.db_traverse.inspect(self.engine)
            return True
        except:
            return False

    def get_schema(self):
        """
        Output: A dictionary with information about all schemas and the default schema.
        Example Output: {'All': ['information_schema', 'public'], 'Default': 'public'}
        """
        output_dict = dict()
        output_dict["all"] = self.inspector.get_schema_names()
        output_dict["default"] = self.inspector.default_schema_name
        return output_dict

    def get_tables(self, use_schema=None):
        """
        Output: An array with the names of all tables in the database's schema.
        """
        return self.inspector.get_table_names(schema=use_schema)

    def get_columns(self, use_table, use_schema=None):
        """
        Output: An array with information about all columns in a table.
        Example Output:
        [
            {'name': 'id', 'type': INTEGER(), 'nullable': False, 'default': 'nextval(\'"API_secrets_id_seq"\'::regclass)', 'autoincrement': True, 'comment': "None"},
            {'name': 'secret', 'type': BYTEA(), 'nullable': False, 'default': None, 'autoincrement': False, 'comment': "None"},
            {'name': 'datatime', 'type': TIMESTAMP(), 'nullable': True, 'default': None, 'autoincrement': False, 'comment': "None"}
        ]
        """
        db_columns = self.inspector.get_columns(table_name=use_table, schema=use_schema)
        for i in range(len(db_columns)):
            try:  # Put in Try-Except because some DBs like SQLite do not have comments for columns.
                if db_columns[i]["comment"] is None:
                    db_columns[i]["comment"] = "None"
            except:
                pass
            if db_columns[i]["default"] is None:
                db_columns[i]["default"] = "None"

            db_columns[i]['type'] = str(db_columns[i]['type'])
        return db_columns

    def get_primary_key(self, use_table, use_schema=None):
        """
        Output: The name of the primary key, or if there is none, it will return "None".
        """
        return self.inspector.get_pk_constraint(table_name=use_table, schema=use_schema)

    def get_sequences(self, use_schema=None):
        """
        Output: An array with the names of all sequences in the database's schema.
        Example Output: ['secrets_id_seq', 'API_secrets_id_seq', 'hashed__encryption_id_seq']
        """
        return self.inspector.get_sequence_names(schema=use_schema)

    def get_table_comment(self, use_table, use_schema=None):
        """
        Output: The comment linked with the database table. If there is no comment, it returns "None".
        """
        table_comment = self.inspector.get_table_comment(table_name=use_table, schema=use_schema)["text"]
        if table_comment is None:
            table_comment = "None"
        return table_comment

    def get_all_metadata(self, get_sequences=False):
        """
        Gets all the metadata for all schemas within the database.
        Output: A multi-dimensional dictionary.
        """
        output_dict = dict()
        output_dict["schemas"] = self.get_schema()
        for schema in output_dict["schemas"]["all"]:
            schema_dict = dict()
            table_dictionary = dict()
            db_tables = self.get_tables(use_schema=schema)
            for db_table in db_tables:
                table_columns = self.get_columns(db_table, use_schema=schema)
                table_pk = self.get_primary_key(db_table, use_schema=schema)
                table_comment = self.get_table_comment(db_table, use_schema=schema)

                table_dictionary_info = dict()
                table_dictionary_info["table_columns"] = table_columns
                table_dictionary_info["primary_key"] = table_pk
                table_dictionary_info["table_comment"] = table_comment

                table_dictionary[db_table] = table_dictionary_info

            schema_dict["tables"] = table_dictionary
            if get_sequences:
                schema_sequences = self.get_sequences(use_schema=schema)
                schema_dict["sequences"] = schema_sequences
            output_dict[schema] = schema_dict

        return output_dict

    def get_schema_metadata(self, schema, get_sequences=False, tables=[]):
        """
        Gets all the metadata for the schema provided as input.
        Output: A multi-dimensional dictionary.
        """
        schema_dict = dict()
        table_dictionary = dict()
        db_tables = self.get_tables(use_schema=schema)
        if tables:
            db_tables = list(set(db_tables) & set(tables))
        for db_table in db_tables:
            table_columns = self.get_columns(db_table, use_schema=schema)
            table_pk = self.get_primary_key(db_table, use_schema=schema)
            table_comment = self.get_table_comment(db_table, use_schema=schema)

            table_dictionary_info = dict()
            table_dictionary_info["table_columns"] = table_columns
            table_dictionary_info["primary_key"] = table_pk
            table_dictionary_info["table_comment"] = table_comment

            table_dictionary[db_table] = table_dictionary_info

        schema_dict["tables"] = table_dictionary
        if get_sequences:
            schema_sequences = self.get_sequences(use_schema=schema)
            schema_dict["sequences"] = schema_sequences

        return schema_dict

    def get_schema_metadata_from_query(self, query):
        """
        Gets all the metadata for the schema provided as input.
        Output: A multi-dimensional dictionary.
        """
        schema_dict = dict()
        table_dictionary = dict()
        table_dictionary_info = dict()

        table_columns = []

        # smartly add the limit 1
        query = query.strip()
        if query[-1] == ";":
            query = query[:-1]
        if 'limit' not in query:
            query += ' limit 1 '

        query_text = text(query)
        results = self.engine.execute(query_text)
        columns = results.cursor.description
        for col in columns:
            table_columns.append({
                'name': col.name,
                'type': 'TEXT'
            })
        table_dictionary_info["table_columns"] = table_columns

        table_dictionary['query'] = table_dictionary_info
        schema_dict["tables"] = table_dictionary
        return schema_dict



def get_metadata(data_source_details, from_query=False, query=''):
    metadata, err_msg = {}, ''
    db_uri = data_source_details["db_uri"]
    db_tables = data_source_details["dbConfig"]["tables"]
    if data_source_details["connection_type"].lower() == "mysql":
        db_name = db_uri.split('/')[-1]
        schema_name = db_name
    else:
        # this is for the postgres db (including third party connector) 
        schema_name = 'public'
    metadata_obj = DbMetadata(db_uri)
    metadata_obj.create_connection()

    metadata = {
        "tables": {
            "query": {
                "table_columns": []
            }
        }
    }
    all_schema = {}
    try:
        if not from_query:
            all_schema = metadata_obj.get_schema_metadata(schema_name, tables=db_tables)
        else:
            all_schema = metadata_obj.get_schema_metadata_from_query(query)
    except Exception as err:
        print(err)
        err_msg = str(err)

    if all_schema:
        metadata = all_schema
    return metadata, err_msg
