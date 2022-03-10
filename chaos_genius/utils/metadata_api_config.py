SCHEMAS_AVAILABLE = {
    "Postgres": True,
    "MySQL": False,
    "Redshift": True,
    "BigQuery": False,
    "Snowflake": True,
    "Druid": False
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
    },
    "Druid": {
        "tables": True,
        "views": True,
        "materialized_views": True
    }
}
