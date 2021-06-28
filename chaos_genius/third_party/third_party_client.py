
import os
import json
import requests
import pprint
import traceback
import click
from chaos_genius.utils.io_helper import cg_print


BASE_PATH = os.getcwd()
ENV_FILE_PATH = os.path.join(BASE_PATH, '.integrations.json')
DESTINATION_DEF_ID = "25c5221d-dce2-4163-ade9-739ef790f503" # POSTGRES DB
SOURCE_DEF_ID = [
    "39f092a6-8c87-4f6f-a8d9-5cef45b7dbe1", # Google Analytics
    "71607ba1-c0ac-4799-8049-7f4b90dd50f7", # Google Sheets
    "435bb9a5-7887-4809-aa58-28c27df0d7ad", # MySQL
    "decd338e-5647-4c0b-adf4-da0e75f5a750", # Postgres
    "b1892b11-788d-44bd-b9ec-3a436f7b54ce", # Shopify
    "e094cb9a-26de-4645-8761-65c0c425d1de", # Stripe
    "29b409d9-30a5-4cc8-ad50-886eb846fea3", # Quickbooks
]


class ThirdPartyClient(object):
    def __init__(self, server_uri=None):
        """This is used to initiate the Third Party API client. Methods will assume that the
        third_party env has been already created via the init_third_party method.
        There are methods which can be used to create the resource for the third party

        Args:
            server_uri (str): Server URL for which the API need to be hit
        """
        super().__init__()
        config = {}
        if os.path.exists(ENV_FILE_PATH):
            config = read_config(ENV_FILE_PATH)
        self.config = config
        self.server_uri = config.get("server_uri", server_uri)
        self.workspace_id = config.get("workspace_id")
        self.destination_db = config.get("destination_db", {})
        self.destination_def_id = DESTINATION_DEF_ID

        # Check the third party server running status
        status = self.get_server_health()
        if not status.get('db'):
            raise Exception("ERROR: Third Party Server not running.")

        # load the source and destination configuration
        # if server_uri == None: # as flask extension
        #     self.init_destination_def_conf()
        #     self.init_source_def_conf()

    def init_destination_def_conf(self):
        """Load the destination defination and configuration
        during the initialisation
        """
        conf = self.get_destination_specs(self.destination_def_id)
        self.destination_conf = conf

    def init_source_def_conf(self):
        """Load the available third party connection and
        configuration during the initialisation
        """
        sources = self.get_source_def_list()
        sources_list = sources["sourceDefinitions"]
        available_sources = [source for source in sources_list
            if source["sourceDefinitionId"] in SOURCE_DEF_ID]
        for source in available_sources:
            source_specs = self.get_source_def_specs(source["sourceDefinitionId"])
            source["connectionSpecification"] = source_specs["connectionSpecification"]
        self.source_conf = available_sources

    def create_workspace(self, payload):
        """Create the workspace for storing the source, destination and connection

        Args:
            payload (dict): Provide the information for creating the workspace

        Returns:
            dict: This is the status of the worksapce creation

        ---
        For ex. Payload can be 
        {
            "email": "user@example.com",
            "anonymousDataCollection": False,
            "name": "test",
            "news": False,
            "securityUpdates": False,
            "notifications": []
        }
        """
        api_url = f"{self.server_uri}/api/v1/workspaces/create"
        return post_request(api_url, payload)

    def get_workspace(self):
        """This will be used to fetch the worksapce details

        Returns:
            dict: details of the workspace
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/workspaces/get"
        return post_request(api_url, payload)

    def get_source_def_list(self):
        """This will be used to get the available third pary source list

        Returns:
            dict: list of dict containing meta-information of available connectors
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/source_definitions/list"
        return post_request(api_url, payload)

    def get_source_def_specs(self, source_id):
        """This will be used to fetch the configuration details of any third party connection

        Args:
            source_id (str): UUID of the source id

        Returns:
            dict: details of the configuration of the source type
        """
        payload = {"sourceDefinitionId": source_id}
        api_url = f"{self.server_uri}/api/v1/source_definition_specifications/get"
        return post_request(api_url, payload)

    def get_source_list(self):
        """This will be used to get the list of the source created in the workspace

        Returns:
            list: list of dictionary containing information about all the sources
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/sources/list"
        return post_request(api_url, payload)

    def create_source(self, sourceData):
        """Create the new source with the provided configuration
        Note: Make sure that you have tested the source before saving that in db

        Args:
            sourceData (dict): details about the source

        Returns:
            dict: creation status of the source
        """
        payload = sourceData
        api_url = f"{self.server_uri}/api/v1/sources/create"
        return post_request(api_url, payload)

    def check_source_connection(self, connectionConfiguration):
        """This will be used to check the connection status.
        This method will be used be used for the source which aren't created
        and just for testing the connection configuration

        Args:
            connectionConfiguration (dict): source connection detials required by the source configuration

        Returns:
            dict: status of the connection
        """
        payload = connectionConfiguration
        api_url = f"{self.server_uri}/api/v1/scheduler/sources/check_connection"
        return post_request(api_url, payload)

    def update_source(self, changed_data):
        """This will be used to update the already existing resource.
        Make sure the connection changes are properly testing and working.

        Args:
            changed_data (dict): details of the source input configuration

        Returns:
            dict: status of the source updating
        """
        payload = changed_data
        api_url = f"{self.server_uri}/api/v1/sources/update"
        return post_request(api_url, payload)

    def get_source_schema(self, source_id):
        """This will be used to fetch the details of the created destination

        Args:
            source_id (str): source id

        Returns:
            list: list of dict containing the destination details
        """
        payload = {"sourceId": source_id}
        api_url = f"{self.server_uri}/api/v1/sources/discover_schema"
        return post_request(api_url, payload)

    def get_destination(self):
        """This will be used to fetch the details of the created destination

        Returns:
            list: list of dict containing the destination details
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/destinations/list"
        return post_request(api_url, payload)

    def create_destination(self, destination_name):
        """Create the new destination with the provided configuration
        Note: Make sure that you have tested the source before saving that in db

        Args:
            destination (dict): details about the source

        Returns:
            dict: creation status of the source
        """
        payload = {
            "name": f"CG-{destination_name}",
            "destinationDefinitionId": self.destination_def_id,
            "workspaceId": self.workspace_id,
            "connectionConfiguration": {
                "basic_normalization": True,
                "ssl": False,
                "password": self.destination_db["password"],
                "username": self.destination_db["user"],
                "schema": self.destination_db["schema"],
                "database": self.destination_db["name"],
                "port": self.destination_db["port"],
                "host": self.destination_db["host"]
            }
        }
        api_url = f"{self.server_uri}/api/v1/destinations/create"
        response = post_request(api_url, payload)
        response["connectionConfiguration"] = payload["connectionConfiguration"]
        return response


    def get_destination_specs(self, destination_def_id=None):
        """This will be used to fetch the details of the destination configuration

        Args:
            destination_def_id (str, optional): UUID of the destination data type
            If not provided then check the default UUID saved in env. Defaults to None.

        Returns:
            [type]: [description]
        """
        if not destination_def_id:
            destination_def_id = self.destination_def_id
        payload = {"destinationDefinitionId": destination_def_id}
        api_url = f"{self.server_uri}/api/v1/destination_definition_specifications/get"
        return post_request(api_url, payload)

    def get_connection_list(self):
        """Get the list of all the created connection between third party data source and
        defined data storage

        Returns:
            list: list of dict containing all the connection details
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/web_backend/connections/list"
        return post_request(api_url, payload)

    def get_connection_details(self, connection_id):
        """This will be used to fetch the connection details of the provided
        input connection id

        Args:
            connection_id (str): UUID of the connection

        Returns:
            dict: details of the provided input connection
        """
        payload = {"connectionId": connection_id}
        api_url = f"{self.server_uri}/api/v1/web_backend/connections/get"
        return post_request(api_url, payload)

    def create_connection(self, payload):
        """This will be used to create the connection between the source and defined
        data storage.

        Args:
            payload (dict): details of the connection

        Returns:
            dict: status and id of the created connection
        """
        api_url = f"{self.server_uri}/api/v1/connections/create"
        return post_request(api_url, payload)

    def update_connection(self, updated_data):
        """This will be used to update the connection already created connection.

        Args:
            payload (dict): updated details of the connection

        Returns:
            dict: status of the created connection
        """
        payload = updated_data
        api_url = f"{self.server_uri}/api/v1/destinations/list"
        return post_request(api_url, payload)

    def reset_connection(self, connection_id):
        """This will be used to reset the connection. This can wipe the already saved data

        Args:
            connection_id (str): UUID of the connection

        Returns:
            dict: status and job details for resetting the connection
        """
        payload = {"connectionId": connection_id}
        api_url = f"{self.server_uri}/api/v1/connections/reset"
        return post_request(api_url, payload)

    def sync_connection_data(self, connection_id):
        """Start a new data job for syncing the data. This test the source connection
        and will start the data job

        Args:
            connection_id (str): UUID of the connection

        Returns:
            dict: details about the job for syncing the data
        """
        payload = {"connectionId": connection_id}
        api_url = f"{self.server_uri}/api/v1/connections/sync"
        return post_request(api_url, payload)

    def get_job_list(self, payload):
        """Get the list of the all the run job for a given connection

        Args:
            payload (dict): config for the job list

        Returns:
            list: list of dict containing the job details
        """
        api_url = f"{self.server_uri}/api/v1/jobs/list"
        return post_request(api_url, payload)

    def get_job_detail(self, job_config):
        """This will be used to get job details and logs of any job

        Args:
            payload (dict): job details

        Returns:
            dict: status and logs of the job
        """
        payload = job_config
        api_url = f"{self.server_uri}/api/v1/destinations/list"
        return post_request(api_url, payload)

    def get_server_health(self):
        """Get the health of the backend server

        Returns:
            dict: health status of the backend server
        """
        api_url = f"{self.server_uri}/api/v1/health"
        return get_request(api_url)

    def test_connection(self, payload):
        api_url = f"{self.server_uri}/api/v1/scheduler/sources/check_connection"
        return post_request(api_url, payload)


# Utils Function

def post_request(url, payload):
    response_data = {}
    try:
        response = requests.post(url=url, json=payload)
        # import pdb; pdb.set_trace()
        if response.ok:
            response_data = response.json()
        else:
            print(response.text)
            response.raise_for_status()
    except Exception as err:
        print(err)
        print(traceback.format_exc())
    return response_data


def get_request(url, params=None):
    response_data = {}
    try:
        response = requests.get(url=url)
        response_data = response.json()
    except Exception as err:
        print(err)
        print(traceback.format_exc())
    return response_data


def read_config(url):
    config = {}
    with open(url) as fp:
        config = json.load(fp)
    return config


# Third Party Server Setup and configs

def init_third_party(server_uri, db_host, db_user, db_password, db_port, db_name, db_schema):
    """This will initialise the setup for the third party server. All the configuration will be
    stored in the env file in the base directory. Third Party API endpoint and datails of
    the Postgres db for storing the third party data will be stored.

    Args:
        server_uri (str): URI for the third party API endpoint
        db_host (str): Postgres Database hostname
        db_user (str): Postgres database user
        db_password (str): Database password
        db_port (int): Database port
        db_name (str): Database name
        db_schema (str): Database schema
    """

    third_party_config = {}
    third_party_config["server_uri"] = server_uri
    if os.path.exists(ENV_FILE_PATH):
        third_party_config = read_config(ENV_FILE_PATH)
        cg_print(f"Third Party Setup: Already initialised.")
        client = ThirdPartyClient()
    else:
        client = ThirdPartyClient(server_uri=server_uri)
        payload = {
            "email": "user@example.com",
            "anonymousDataCollection": False,
            "name": "ChaosGenius",
            "news": False,
            "securityUpdates": False,
            "notifications": []
        }
        workspace = client.create_workspace(payload)
        # TODO: Check whether we need to update the
        # initialSetupComplete and displaySetupWizard flags
        third_party_config["workspace_id"] = workspace["workspaceId"]
        third_party_config["workspace_details"] = workspace
        third_party_config["destination_db"] = {
            "host": db_host,
            "user": db_user,
            "password": db_password,
            "port": db_port,
            "name": db_name,
            "schema": db_schema
        }
        with open(ENV_FILE_PATH, 'w') as fp:
            json.dump(third_party_config, fp)

    status = client.get_server_health()
    return status.get('db', False)


if __name__ == "__main__":
    # destination_configuration = {
    #     "host": "md-postgres-test-db-instance.cjzi0pwi8ki4.ap-south-1.rds.amazonaws.com",
    #     "username": "postgres",
    #     "password": "",
    #     "port": 5432,
    #     "database": "third_party_data",
    #     "schema": "public",
    # }
    # server_url = "http://localhost:8001"
    # workspace_id = "5ae6b09b-fdec-41af-aaf7-7d94cfc33ef6"

    print('--------------')
    client = ThirdPartyClient(server_uri="http://localhost:8001")
    data = client.reset_connection("40f56e5d-1cc4-4425-a7c7-a488d2d2adc8")
    pprint.pprint(data)
