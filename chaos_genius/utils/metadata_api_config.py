SCHEMAS_AVAILABLE = {
    "Postgres": True,
    "MySQL": True,
    "Redshift": True,
    "BigQuery": False,
    "Snowflake": True   
}

TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY = {
    "Postgres": {
        "tables": True,
        "views": True,
        "materialized_views": True
    },
    "MySQL": {
        "tables": True,
        "views": True,
        "materialized_views": False
    },
    "Redshift": {
        "tables": True,
        "views": True,
        "materialized_views": True
    },
    "BigQuery": {
        "tables": True,
        "views": True,
        "materialized_views": True
    },
    "Snowflake": {
        "tables": True,
        "views": True,
        "materialized_views": True
    }
}