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
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"]
    },
    "MySQL": {
        "tables": True,
        "views": True,
        "materialized_views": False,
        "supported_aggregations": ["mean", "sum", "count"]
    },
    "Redshift": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"]
    },
    "BigQuery": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"]
    },
    "Snowflake": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"]
    },
    "Druid": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["sum", "count"]
    }
}
