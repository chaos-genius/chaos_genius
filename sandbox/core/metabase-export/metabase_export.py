from flask_sqlalchemy import SQLAlchemy
import json
from sqlalchemy import Table, Column, MetaData
from sqlalchemy.sql import select


class MetabaseExport:
    def __init__(self, metabase_db_credentials):
        """
        Setup the required connection for the metabase backend database.

        Input: A dictionary with credentials for the metabase databases.
        Example Input:
        {
            "database_type": "postgresql",  # One of the following https://docs.sqlalchemy.org/en/14/core/engines.html
            "database_driver": "psycopg2",  # Specific to the database type https://docs.sqlalchemy.org/en/14/core/engines.html (This is optional)
            "user": "postgres",
            "pass": "password",
            "host": "localhost",
            "port": "5432",
            "database": "metabase_output"
        }
        """

        # Generate the start of the DB connection URI. Example: "postgresql+psycopg2".
        connection_details_db = ""
        if "database_driver" in metabase_db_credentials.keys():
            connection_details_db = "{}+{}".format(
                metabase_db_credentials["database_type"],
                metabase_db_credentials["database_driver"],
            )
        else:
            connection_details_db = metabase_db_credentials["database_type"]

        # Create the DB connection URI.
        db_uri = "{}://{}:{}@{}:{}/{}".format(
            connection_details_db,
            metabase_db_credentials["user"],
            metabase_db_credentials["pass"],
            metabase_db_credentials["host"],
            metabase_db_credentials["port"],
            metabase_db_credentials["database"],
        )

        # Create connection to the Metabase DB.
        sqlalchemy = SQLAlchemy()
        self.engine_input = sqlalchemy.create_engine(sa_url=db_uri, engine_opts={})
        self.connection_input = self.engine_input.connect()

    def get_databases(self, skip_default=False):
        """
        Get the credentials to all databases that Metabase uses.
        - If skip_default is set to True, this class (MetabaseExport) will not export
          questions that come from default databases.

        Output: Two dictionaries -- self.database_connections and
                self.databases_to_skip_questions (would include sample databases if skip_default = True)
        """

        self.database_connections = {}
        self.databases_to_skip_questions = (
            []
        )  # These would be sample databases if skip_default=True.
        metadata = MetaData()
        query_table = Table(
            "metabase_database",
            metadata,
            Column("name"),
            Column("details"),
            Column("engine"),
            Column("is_sample"),
            Column("id"),
        )
        query = select(query_table)
        result = self.connection_input.execute(query).fetchall()

        for res in result:
            if res[3] is False or not skip_default:
                # Runs if DB is not a sample DB provided by Metabase or if Skip Default is set to False.
                self.database_connections[res[4]] = json.loads(res[1])
            else:
                # Runs if Skip Default is set to True and the DB is a sample one.
                self.databases_to_skip_questions.append(res[4])

    def get_questions(self):
        """
        Get all the questions used and save them in two arrays:
            - Native Questions
            - MBQL Questions

        Output: Two arrays -- self.native_questions and self.mbql_questions
        """

        self.native_questions = []
        self.mbql_questions = []
        metadata = MetaData()
        query_table = Table(
            "report_card",
            metadata,
            Column("name"),
            Column("dataset_query"),
            Column("database_id"),
            Column("query_type"),
        )
        query = select(query_table)
        result = self.connection_input.execute(query).fetchall()

        for res in result:
            if res[2] in self.databases_to_skip_questions:
                # Skip all questions that come from a sample database.
                continue
            if res[3] == "native":
                # Get all SQL Queries.
                query_only = json.loads(res[1])["native"]["query"]
                self.native_questions.append(
                    {"name": res[0], "query": query_only, "database_id": res[2]}
                )
            else:
                # Get all MBQL Queries which needs to be converted to SQL.
                query_only = json.loads(res[1])["query"]
                self.mbql_questions.append(
                    {"name": res[0], "query": query_only, "database_id": res[2]}
                )

    def process_native(self, write_json=True):
        """
        Process all data in self.native_questions and write to JSON native_questions.json

        Output: native_questions.json
        """

        all_data = []
        for question in self.native_questions:
            data = {}
            data["name"] = question["name"]
            data["query"] = question["query"]
            # Get information to connect to DB that contains the table(s) used.
            data["data_source"] = self.database_connections[question["database_id"]]
            all_data.append(data)

        # Write processed data to JSON file.
        if write_json:
            with open("native_questions.json", "w") as file:
                file.writelines(json.dumps(all_data, indent=4))
        else:
            # Write processed data to CSV file.
            self.write_to_csv(all_data, "native_questions.csv")

    def process_mbql(self, write_json=True):
        """
        Process all data in self.mbql_questions and write to JSON mbql_questions.json

        Output: mbql_questions.json
        """

        def get_metabase_field(id):
            metadata = MetaData()
            query_table = Table(
                "metabase_field", metadata, Column("name"), Column("id")
            )
            query = select(query_table.c.name).where(query_table.c.id == id)
            return self.connection_input.execute(query).fetchall()[0][0]

        all_data = []
        id = 1
        for question in self.mbql_questions:
            final_sql_query = []
            question_query = question["query"]
            data = {}
            data["id"] = id
            id += 1
            data["name"] = question["name"]

            # Have empty dictionary that will be used in case there is an error processing a question.
            empty_data = {
                "id": id,
                "name": question["name"],
                "kpi_query": None,
                "data_source": None,
                "datetime_column": None,
                "metric": None,
                "metric_precision": None,
                "aggregation": None,
                "filters": {},
                "dimensions": [],
            }

            # Get the name of the table where the question is coming from.
            source_table = question_query["source-table"]

            # If source_table is not a number, return empty data as the code below will fail.
            if type(source_table) != int and not source_table.isdigit():
                all_data.append(empty_data)
                continue

            metadata = MetaData()
            query_table = Table(
                "metabase_table",
                metadata,
                Column("name"),
                Column("schema"),
                Column("id"),
            )
            query = select(query_table.c.name, query_table.c.schema).where(
                query_table.c.id == source_table
            )
            source_table_name, source_table_schema = self.connection_input.execute(
                query
            ).fetchall()[0]
            # Save the name of the table used.
            data["kpi_query"] = f"{source_table_schema}.{source_table_name}"

            # Get information to connect to DB that contains the table(s) used.
            data["data_source"] = self.database_connections[question["database_id"]]

            # Get all columns in source table.
            metadata = MetaData()
            source_table_columns_query_table = Table(
                "metabase_field",
                metadata,
                Column("name"),
                Column("base_type"),
                Column("table_id"),
            )
            source_table_columns_query = select(
                source_table_columns_query_table.c.name,
                source_table_columns_query_table.c.base_type,
            ).where(source_table_columns_query_table.c.table_id == source_table)
            source_table_columns_query_output = self.connection_input.execute(
                source_table_columns_query
            ).fetchall()

            # Get possible datetime columns.
            possible_datetime = []
            for table_column in source_table_columns_query_output:
                if (
                    "date" in table_column[1].lower()
                    or "time" in table_column[1].lower()
                ):
                    possible_datetime.append(table_column[0])
            # Handle different cases for the array possible_datetime.
            if len(possible_datetime) == 0:
                data["datetime_column"] = None
            elif len(possible_datetime) == 1:
                data["datetime_column"] = possible_datetime[0]
            else:
                data["datetime_column"] = possible_datetime

            # Get all information possible for metrics and aggregations.
            try:
                metrics = []
                aggregations = []
                for aggregation in question_query["aggregation"]:
                    aggregations.append(aggregation[0])
                    try:
                        metrics.append(get_metabase_field(aggregation[1][1]))
                    except:
                        pass

                # Convert to string if not multiple options.
                if len(metrics) == 1:
                    metrics = metrics[0]
                if len(aggregations) == 1:
                    aggregations = aggregations[0]

                data["metric"] = metrics
                data["metric_precision"] = 2
                data["aggregation"] = aggregations
            except KeyError:
                # This error will occur if no aggregation was used.
                data["metric"] = None
                data["metric_precision"] = 2
                data["aggregation"] = None

            # Convert filters into usable dictionary.
            try:
                filters = {}
                if question_query["filter"][0] == "and":
                    # This runs if there are multiple filters.
                    for filter in question_query["filter"][1:]:
                        filter_data = [filter[0]]
                        for i in filter[2:]:
                            filter_data.append(i)
                        filter_table_name = get_metabase_field(filter[1][1])
                        # Check if there are already filters for the filter_table_name.
                        # If there are none, initialize it with an array.
                        if filter_table_name not in filters.keys():
                            filters[filter_table_name] = []
                        filters[filter_table_name].append(filter_data)
                else:
                    # This runs if there is only one filter.
                    filter = question_query["filter"]
                    filter_data = [filter[0]]
                    for i in filter[2:]:
                        filter_data.append(i)
                    filter_table_name = get_metabase_field(filter[1][1])
                    filters[filter_table_name] = filter_data

                data["filters"] = filters
            except KeyError:
                # This error occurs if there were no filters used.
                data["filters"] = {}

            # Put all table names in dictionary.
            data["dimensions"] = [
                value[0] for value in source_table_columns_query_output
            ]

            all_data.append(data)

        # Write processed data to JSON file.
        if write_json:
            with open("mbql_questions.json", "w") as file:
                file.writelines(json.dumps(all_data, indent=4))
        else:
            # Write processed data to CSV file.
            self.write_to_csv(all_data, "mbql_questions.csv")

    def write_to_csv(self, all_data, file_name):
        # Write processed data to CSV file.
        delimiter = "   "
        with open(file_name, "w", encoding="utf-8") as file:
            if len(all_data) != 0:
                file.write(f"{delimiter}".join(all_data[0].keys()))
                file.write("\n")
                for current_data in all_data:
                    row = []
                    for current_data_column in current_data.values():
                        row.append(str(current_data_column))
                    file.write(f"{delimiter}".join(row))
                    file.write("\n")
            else:
                # If there are no MBQL Questions that have been imported, return an empty CSV.
                file.write("")

    def close_connections(self):
        """
        Runs at the end and closes the SQLAlchemy connection.
        """
        self.connection_input.close()

    def export(self, write_json=True):
        # Runs all the functions above to save all of the Metabase Questions into a JSON or CSV.
        self.get_databases()
        self.get_questions()
        self.process_mbql(write_json=write_json)
        self.process_native(write_json=write_json)
        self.close_connections()
