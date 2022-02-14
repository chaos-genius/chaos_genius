
import os
import json
import requests
import pprint
import traceback
import click
import time
from dotenv import dotenv_values

from chaos_genius.utils.io_helper import cg_print
from chaos_genius.third_party.integration_server_config import (
    SOURCE_WHITELIST_AND_TYPE as SOURCE_DEF_ID,
    DESTINATION_DEF_ID,
    DEFAULT_WORKSPACE_ID,
    SOURCE_ICON_OVERRIDE
)
from chaos_genius.settings import (
    INTEGRATION_SERVER,
    INTEGRATION_DB_HOST,
    INTEGRATION_DB_USERNAME,
    INTEGRATION_DB_PASSWORD,
    INTEGRATION_DB_PORT,
    INTEGRATION_DATABASE,
)


class ThirdPartyClient(object):
    def __init__(self, server_uri=None):
        """This is used to initiate the Third Party API client. Methods will assume that the
        third_party env has been already created via the init_integration_server method.
        There are methods which can be used to create the resource for the third party

        Args:
            server_uri (str): Server URL for which the API need to be hit
        """
        super().__init__()
        # TODO: Get these values from the settings.py
        config = dotenv_values(".env")
        self.config = config
        self.server_uri = INTEGRATION_SERVER
        self.destination_db = {
            "host": get_docker_host(INTEGRATION_DB_HOST),
            "port": int(INTEGRATION_DB_PORT),
            "username": INTEGRATION_DB_USERNAME,
            "password": INTEGRATION_DB_PASSWORD,
            "database": INTEGRATION_DATABASE,
        }
        self.destination_def_id = DESTINATION_DEF_ID

        # workspace_id = config.get("workspace_id")
        # if not workspace_id:
        self.workspace_id = self.get_workspace_id()

        # Check the third party server running status
        status = self.get_server_health()
        if not status.get('db'):
            raise Exception("ERROR: Third Party Server not running.")

        # load the source and destination configuration
        # if server_uri == None: # as flask extension
        #     self.init_destination_def_conf()
        #     self.init_source_def_conf()

    def get_workspace_id(self):
        """This will return the ID of the first workspace
        Either send the id of the first workspace if exist or the default one
        """
        workspaces = self.get_workspace_list()
        if workspaces:
            return workspaces[0]['workspaceId']
        else:
            return DEFAULT_WORKSPACE_ID

    def get_workspace_list(self):
        """This will return the list of workspaces in the given deployment"""
        api_url = f"{self.server_uri}/api/v1/workspaces/list"
        workspaces = post_request(api_url, {})
        return workspaces.get("workspaces", [])

    def init_destination_def_conf(self):
        """Load the destination defination and configuration
        during the initialisation
        """
        conf = self.get_destination_specs(self.destination_def_id)
        self.destination_conf = conf

    def check_sources_availability(self, sources_list):
        for source in sources_list:
                source_specs = self.get_source_def_specs(source["sourceDefinitionId"])
                try:
                    if not source_specs.get("connectionSpecification"):
                        return False
                except:
                    return False
        return True


    def init_source_def_conf(self):
        """Load the available third party connection and
        configuration during the initialisation
        """
        sources = self.get_source_def_list()
        sources_list = sources["sourceDefinitions"]
        available_sources = [source for source in sources_list
            if (source["sourceDefinitionId"] in SOURCE_DEF_ID) and (SOURCE_DEF_ID.get(source["sourceDefinitionId"]))]
        
        while True:
            if self.check_sources_availability(available_sources):
                break
            time.sleep(60)

        for source in available_sources:
            source_specs = self.get_source_def_specs(source["sourceDefinitionId"])
            source["connectionSpecification"] = source_specs["connectionSpecification"]
            source["isThirdParty"] = SOURCE_DEF_ID[source["sourceDefinitionId"]]
            icon_found = SOURCE_ICON_OVERRIDE.get(source["sourceDefinitionId"])
            if icon_found:
                source['icon'] = icon_found
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
        NOTE: By default the workspace id has been set, use that id only in the MVP
        Hence we aren't creating the workspace
        """
        return self.get_workspace()
        # api_url = f"{self.server_uri}/api/v1/workspaces/create"
        # return post_request(api_url, payload)

    def get_workspace(self):
        """This will be used to fetch the worksapce details

        Returns:
            dict: details of the workspace
        """
        payload = {"workspaceId": self.workspace_id}
        api_url = f"{self.server_uri}/api/v1/workspaces/get"
        return post_request(api_url, payload)

    def update_workspace(self, payload):
        """This will be used to update the worksapce details

        Returns:
            dict: details of the workspace
        """
        payload = payload
        api_url = f"{self.server_uri}/api/v1/workspaces/update"
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

    def get_source_details(self, source_id):
        """This will be used to fetch the details of third party data source

        Args:
            source_id (str): UUID of the source id

        Returns:
            dict: details of the configuration of the source type
        """
        payload = {"sourceId": source_id}
        api_url = f"{self.server_uri}/api/v1/sources/get"
        return post_request(api_url, payload)

    def delete_source(self, source_id):
        """This will be used to delete the source.

        Args:
            source_id (str): id of the source

        Returns:
            dict: status of the deletion
        """
        payload = {"sourceId": source_id}
        api_url = f"{self.server_uri}/api/v1/sources/delete"
        return post_request(api_url, payload, 'text')

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
                "ssl": False,
                "password": self.destination_db["password"],
                "username": self.destination_db["username"],
                "schema": "public",
                "database": self.destination_db["database"],
                "port": self.destination_db["port"],
                "host": self.destination_db["host"]
            }
        }
        api_url = f"{self.server_uri}/api/v1/destinations/create"
        response = post_request(api_url, payload)
        response["connectionConfiguration"] = payload["connectionConfiguration"]
        return response

    def delete_destination(self, destination_id):
        """This will be used to delete the destination.

        Args:
            destination_id (str): id of the destination

        Returns:
            dict: status of the deletion
        """
        payload = {"destinationId": destination_id}
        api_url = f"{self.server_uri}/api/v1/destinations/delete"
        return post_request(api_url, payload, 'text')

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
        api_url = f"{self.server_uri}/api/v1/web_backend/connections/create"
        return post_request(api_url, payload)

    def update_connection(self, updated_data):
        """This will be used to update the already created connection.

        Args:
            payload (dict): updated details of the connection

        Returns:
            dict: status of the created connection
        """
        payload = updated_data
        api_url = f"{self.server_uri}/api/v1/web_backend/connections/update"
        return post_request(api_url, payload)

    def delete_connection(self, connection_id):
        """This will be used to delete the already created connection.

        Args:
            connection_id (str): id of the connection

        Returns:
            dict: status of the deletion
        """
        payload = {"connectionId": connection_id}
        api_url = f"{self.server_uri}/api/v1/web_backend/connections/delete"
        return post_request(api_url, payload, 'text')

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

    def get_job_list(self, connection_id):
        """Get the list of the all the run job for a given connection

        Args:
            connection_id (str): id of the connection

        Returns:
            list: list of dict containing the job details
        """
        payload = {"configId": connection_id, "configTypes": ["sync","reset_connection"]}
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
        db_host = payload["connectionConfiguration"].get("host")
        if db_host:
            payload["connectionConfiguration"]["host"] = get_docker_host(db_host)
        db_port = payload["connectionConfiguration"].get("port")
        if db_port:
            payload["connectionConfiguration"]["port"] = int(db_port)
        api_url = f"{self.server_uri}/api/v1/scheduler/sources/check_connection"
        return post_request(api_url, payload)


# Utils Function

def post_request(url, payload, response_type='json'):
    response_data = {}
    try:
        response = requests.post(url=url, json=payload, timeout=25)
        if response.ok:
            if response_type == 'json':
                response_data = response.json()
            else:
                response_data = {"response": response.text}
        else:
            response.raise_for_status()
    except Exception as err:
        print(err)
        # print(traceback.format_exc())
    return response_data


def get_request(url, params=None):
    response_data = {}
    try:
        response = requests.get(url=url, timeout=25)
        response_data = response.json()
    except Exception as err:
        print(err)
        # print(traceback.format_exc())
    return response_data


def read_config(url):
    config = {}
    with open(url) as fp:
        config = json.load(fp)
    return config


# Third Party Server Setup and configs

def init_integration_server():
    """This will initialise the setup for the third party server. All the configuration will be
    stored in the env file in the base directory. Third Party API endpoint and datails of
    the Postgres db for storing the third party data will be stored.

    """
    client = ThirdPartyClient()
    status = client.get_server_health()
    if status.get('db', False):
        payload = {
            "workspaceId": client.workspace_id,
            "initialSetupComplete": True,
            "displaySetupWizard": False,
            "email": "user@example.com",
            "anonymousDataCollection": False,
            "news": False,
            "securityUpdates": False
        }
        workspace = client.update_workspace(payload)
    else:
        raise Exception("Integration Server isn't running. Run the server and then try again.")

    status = client.get_server_health()
    client.init_source_def_conf()
    return status.get('db', False)


def get_docker_host(db_host):
    """ convert the localhost for accessing inside the docker
        localhost ---> host.docker.internal
    """
    converted_host = db_host
    if db_host == 'localhost':
        converted_host = 'host.docker.internal'
    return converted_host


def get_localhost_host(db_host):
    """ convert the docker accessible host name to parent machine one
        host.docker.internal ---> localhost
    """
    converted_host = db_host
    if db_host == 'host.docker.internal':
        converted_host = 'localhost'
    return converted_host
