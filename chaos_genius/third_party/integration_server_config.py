
# This is the default worksapce
# Check this link for more information on the same
# https://github.com/airbytehq/airbyte/blob/07a45df4547fa5f12a170dff0bfc56c39c3d2e9f/airbyte-config/persistence/src/main/java/io/airbyte/config/persistence/PersistenceConstants.java
DEFAULT_WORKSPACE_ID = "5ae6b09b-fdec-41af-aaf7-7d94cfc33ef6"

# Destination for the third party data
DESTINATION_DEF_ID = "25c5221d-dce2-4163-ade9-739ef790f503" # POSTGRES DB
DESTINATION_TYPE = "postgres"

# Mapping configuration from the source to database
SOURCE_CONFIG_MAPPING = {
    "71607ba1-c0ac-4799-8049-7f4b90dd50f7": {
        "syncMode": "full_refresh",
        "cursorField": [],
        "destinationSyncMode": "overwrite",
        "primaryKey": [],
        "selected": True,
    },
    "39f092a6-8c87-4f6f-a8d9-5cef45b7dbe1": {
        "syncMode": "incremental",
        "cursorField": [],
        "destinationSyncMode": "append",
        "primaryKey": [],
        "selected": True,
    },
    "9da77001-af33-4bcd-be46-6252bf9342b9": {
        "syncMode": "full_refresh",
        "destinationSyncMode": "append",
        "selected": True,
    },
    "e094cb9a-26de-4645-8761-65c0c425d1de": {
        "syncMode": "full_refresh",
        "destinationSyncMode": "append",
        "selected": True,
    }
}

# KEY: UUID of the source, VALUE: is third party data source
SOURCE_WHITELIST_AND_TYPE = {
    "39f092a6-8c87-4f6f-a8d9-5cef45b7dbe1": True, # Google Analytics
    "71607ba1-c0ac-4799-8049-7f4b90dd50f7": True, # Google Sheets
    "435bb9a5-7887-4809-aa58-28c27df0d7ad": False, # MySQL
    "decd338e-5647-4c0b-adf4-da0e75f5a750": False, # Postgres
    "9da77001-af33-4bcd-be46-6252bf9342b9": True, # Shopify
    "e094cb9a-26de-4645-8761-65c0c425d1de": True, # Stripe
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

SOURCE_ICON_OVERRIDE = {
    "9da77001-af33-4bcd-be46-6252bf9342b9": '''<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px"><path fill="#7cb342" d="M37.216,11.78c-0.023-0.211-0.211-0.305-0.351-0.305s-3.21-0.234-3.21-0.234s-2.132-2.132-2.39-2.343	c-0.234-0.234-0.68-0.164-0.867-0.117c-0.023,0-0.469,0.141-1.195,0.375c-0.726-2.086-1.968-3.984-4.194-3.984h-0.211	C24.187,4.375,23.391,4,22.735,4c-5.155,0-7.639,6.444-8.412,9.725c-2.015,0.633-3.445,1.054-3.609,1.125	c-1.125,0.351-1.148,0.375-1.289,1.429c-0.117,0.797-3.046,23.456-3.046,23.456L29.179,44l12.373-2.671	C41.575,41.282,37.24,11.991,37.216,11.78z M27.937,9.483c-0.562,0.164-1.242,0.375-1.921,0.609V9.671	c0-1.265-0.164-2.296-0.469-3.117C26.718,6.695,27.445,7.984,27.937,9.483L27.937,9.483z M24.117,6.812	c0.305,0.797,0.516,1.922,0.516,3.468v0.234c-1.265,0.398-2.601,0.797-3.984,1.242C21.422,8.804,22.899,7.351,24.117,6.812	L24.117,6.812z M22.617,5.359c0.234,0,0.469,0.094,0.656,0.234c-1.664,0.773-3.421,2.718-4.148,6.655	c-1.101,0.351-2.156,0.656-3.163,0.984C16.806,10.233,18.915,5.359,22.617,5.359z"/><path fill="#558b2f" d="M36.865,11.428c-0.141,0-3.21-0.234-3.21-0.234s-2.132-2.132-2.39-2.343	C31.17,8.757,31.053,8.71,30.96,8.71L29.249,44l12.373-2.671c0,0-4.335-29.338-4.359-29.549	C37.169,11.569,37.005,11.475,36.865,11.428z"/><path fill="#fff" d="M24.792,18.593l-1.475,4.449c0,0-1.337-0.715-2.927-0.715c-2.374,0-2.489,1.498-2.489,1.867	c0,2.028,5.301,2.812,5.301,7.583c0,3.757-2.374,6.177-5.578,6.177c-3.872,0-5.808-2.397-5.808-2.397l1.037-3.411	c0,0,2.028,1.752,3.734,1.752c1.129,0,1.59-0.876,1.59-1.521c0-2.651-4.333-2.766-4.333-7.145c0-3.665,2.628-7.214,7.952-7.214	C23.777,17.994,24.792,18.593,24.792,18.593z"/></svg>'''
}

# KEEP the upper bound as the 5 characters
DATA_SOURCE_ABBREVIATION = {
    "Google Analytics": "ga",
    "MySQL": "mysql",
    "Google Sheets": "gs",
    "Shopify": "shop",
    "Postgres": "pg",
    "Stripe": "strp"
}