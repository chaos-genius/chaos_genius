from metabase_export import MetabaseExport

metabase_db_credentials = {
    "database_type": "postgresql",
    "database_driver": "psycopg2",
    "user": "postgres",
    "pass": "password",
    "host": "localhost",
    "port": "5432",
    "database": "metabase_imported_data",
}

x = MetabaseExport(metabase_db_credentials)
x.export()
