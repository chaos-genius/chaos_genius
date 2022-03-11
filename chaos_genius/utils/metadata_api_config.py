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
        "supported_aggregations": ["mean", "sum", "count"],
        "supports_multidim_dd": True
    },
    "MySQL": {
        "tables": True,
        "views": True,
        "materialized_views": False,
        "supported_aggregations": ["mean", "sum", "count"],
        "supports_multidim_dd": True
    },
    "Redshift": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"],
        "supports_multidim_dd": True  
    },
    "BigQuery": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"],
        "supports_multidim_dd": True
    },
    "Snowflake": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["mean", "sum", "count"],
        "supports_multidim_dd": True
    },
    "Druid": {
        "tables": True,
        "views": True,
        "materialized_views": True,
        "supported_aggregations": ["sum", "count"],
        "supports_multidim_dd": False
    }
}

SUPPORTED_DATASOURCES_FOR_MULTIDIM_DD = [
    datasource
    for datasource, conf in TABLE_VIEW_MATERIALIZED_VIEW_AVAILABILITY.items()
    if conf["supports_multidim_dd"]
]