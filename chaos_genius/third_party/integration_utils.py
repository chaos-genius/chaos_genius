import json
from chaos_genius.settings import (
    AIRBYTE_ENABLED,
    SOURCE_GOOGLE_ANALYTICS,
    SOURCE_GOOGLE_SHEETS,
    SOURCE_SHOPIFY,
    SOURCE_STRIPE,
    SOURCE_BING_ADS,
    SOURCE_FACEBOOK_ADS,
    SOURCE_GOOGLE_ADS,
)


def get_connection_config():
    all_connection_configs = []
    with open("chaos_genius/third_party/data_connection_config.json") as fp:
        all_connection_configs = json.load(fp)
    if AIRBYTE_ENABLED:
        enabled_third_party_sources = get_activated_third_party_from_env()
        connection_configs = [
            config
            for config in all_connection_configs
            if (
                (
                    config["isThirdParty"] == True
                    and config["sourceDefinitionId"] in enabled_third_party_sources
                )
                or config["isThirdParty"] == False
            )
        ]
    else:
        connection_configs = [
            config
            for config in all_connection_configs
            if config["isThirdParty"] == False
        ]
    return connection_configs


def get_activated_third_party_from_env():
    """Get the activated third party data source from the env file"""
    third_party_source = set()
    if SOURCE_GOOGLE_ANALYTICS:
        third_party_source.add("39f092a6-8c87-4f6f-a8d9-5cef45b7dbe1")
    if SOURCE_GOOGLE_SHEETS:
        third_party_source.add("71607ba1-c0ac-4799-8049-7f4b90dd50f7")
    if SOURCE_SHOPIFY:
        third_party_source.add("9da77001-af33-4bcd-be46-6252bf9342b9")
    if SOURCE_STRIPE:
        third_party_source.add("e094cb9a-26de-4645-8761-65c0c425d1de")
    if SOURCE_BING_ADS:
        third_party_source.add("47f25999-dd5e-4636-8c39-e7cea2453331")
    if SOURCE_FACEBOOK_ADS:
        third_party_source.add("e7778cfc-e97c-4458-9ecb-b4f2bba8946c")
    if SOURCE_GOOGLE_ADS:
        third_party_source.add("253487c0-2246-43ba-a21f-5116b20a2c50")
    return third_party_source
