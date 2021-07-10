
# TODO: This is the default worksapce
# Check this link for more information on the same
# https://github.com/airbytehq/airbyte/blob/07a45df4547fa5f12a170dff0bfc56c39c3d2e9f/airbyte-config/persistence/src/main/java/io/airbyte/config/persistence/PersistenceConstants.java
DEFAULT_WORKSPACE_ID = "5ae6b09b-fdec-41af-aaf7-7d94cfc33ef6"

# Destination for the third party data
DESTINATION_DEF_ID = "25c5221d-dce2-4163-ade9-739ef790f503" # POSTGRES DB
DESTINATION_TYPE = "postgresql"

# Mapping configuration from the source to database
SOURCE_CONFIG_MAPPING = {
    "71607ba1-c0ac-4799-8049-7f4b90dd50f7": {
        "syncMode": "full_refresh",
        "cursorField": [],
        "destinationSyncMode": "overwrite",
        "primaryKey": [],
        "selected": True
    }
}

# KEY: UUID of the source, VALUE: is third party data source
SOURCE_WHITELIST_AND_TYPE = {
    "39f092a6-8c87-4f6f-a8d9-5cef45b7dbe1": True, # Google Analytics
    "71607ba1-c0ac-4799-8049-7f4b90dd50f7": True, # Google Sheets
    "435bb9a5-7887-4809-aa58-28c27df0d7ad": False, # MySQL
    "decd338e-5647-4c0b-adf4-da0e75f5a750": False, # Postgres
    # "b1892b11-788d-44bd-b9ec-3a436f7b54ce", # Shopify
    # "e094cb9a-26de-4645-8761-65c0c425d1de", # Stripe
    # "29b409d9-30a5-4cc8-ad50-886eb846fea3", # Quickbooks
}

# KEY: source configuration for creating the database connection
# Value: corresponding database key in integration configuration
DATABASE_CONFIG_MAPPER = {
    "decd338e-5647-4c0b-adf4-da0e75f5a750": {
        "host": "host",
        "port": "port",
        "database": "database",
        "username": "username",
        "password": "password",
        "db_type": "postgres"
    },
    "435bb9a5-7887-4809-aa58-28c27df0d7ad": {
        "host": "host",
        "port": "port",
        "database": "database",
        "username": "username",
        "password": "password",
        "db_type": "mysql"
    }
}
