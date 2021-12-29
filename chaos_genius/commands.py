# -*- coding: utf-8 -*-
"""Click commands."""
import json
import os
from datetime import datetime
from glob import glob
from subprocess import call

import click
from flask.cli import with_appcontext

from chaos_genius.controllers.dashboard_controller import create_dashboard_kpi_mapper
from chaos_genius.core.utils.kpi_validation import validate_kpi
from chaos_genius.databases.models.kpi_model import Kpi
from chaos_genius.views.anomaly_data_view import (
    update_anomaly_params,
    validate_partial_anomaly_params,
)

HERE = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.join(HERE, os.pardir)
TEST_PATH = os.path.join(PROJECT_ROOT, "tests")


@click.command()
def test():
    """Run the tests."""
    import pytest

    rv = pytest.main([TEST_PATH, "--verbose"])
    exit(rv)


@click.command()
@click.option(
    "-f",
    "--fix-imports",
    default=True,
    is_flag=True,
    help="Fix imports using isort, before linting",
)
@click.option(
    "-c",
    "--check",
    default=False,
    is_flag=True,
    help="Don't make any changes to files, just confirm they are formatted correctly",
)
def lint(fix_imports, check):
    """Lint and check code style with black, flake8 and isort."""
    skip = ["node_modules", "requirements", "migrations"]
    root_files = glob("*.py")
    root_directories = [
        name for name in next(os.walk("."))[1] if not name.startswith(".")
    ]
    files_and_directories = [
        arg for arg in root_files + root_directories if arg not in skip
    ]

    def execute_tool(description, *args):
        """Execute a checking tool with its arguments."""
        command_line = list(args) + files_and_directories
        click.echo(f"{description}: {' '.join(command_line)}")
        rv = call(command_line)
        if rv != 0:
            exit(rv)

    isort_args = []
    black_args = []
    if check:
        isort_args.append("--check")
        black_args.append("--check")
    if fix_imports:
        execute_tool("Fixing import order", "isort", *isort_args)
    execute_tool("Formatting style", "black", *black_args)
    execute_tool("Checking code style", "flake8")


@click.command()
def integration_connector():
    """Initialise the third party connector env"""

    click.echo(f"Third Party Setup: Third Party setup started.")

    from chaos_genius.third_party.integration_client import init_integration_server
    status = init_integration_server()

    if status:
        click.echo(f"Third Party Setup: Connector initialised successfully.")
    else:
        click.echo(f"Third Party Setup: Connector initialisation failed.")


@click.command()
@with_appcontext
@click.option('--kpi', required=True, type=int, help="Perform the anomaly detection for given KPI.")
@click.option('--end_date', type=str, help="Perform the anomaly detection for given KPI.")
def run_anomaly(kpi, end_date):
    """Perform the anomaly detection for given KPI."""

    if end_date is not None:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except:
            raise ValueError("Invalid date.")

    click.echo(f"Starting the anomaly for KPI ID: {kpi} with end date: {end_date}.")
    from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi
    status = run_anomaly_for_kpi(kpi, end_date)
    click.echo(f"Completed the anomaly for KPI ID: {kpi}.")


@click.command()
@with_appcontext
@click.option('--kpi', required=True, type=int, help="Perform Root Cause Analysis for given KPI.")
@click.option('--end_date', type=str, help="Set end date of analysis.")
def run_rca(kpi, end_date):
    """Perform RCA for given KPI."""

    if end_date is not None:
        try:
            end_date = datetime.strptime(end_date, '%Y-%m-%d %H:%M:%S').date()
        except:
            raise ValueError("Invalid date.")

    click.echo(f"Starting the RCA for KPI ID: {kpi} with end date: {end_date}.")
    from chaos_genius.controllers.kpi_controller import run_rca_for_kpi
    status = run_rca_for_kpi(kpi, end_date)
    click.echo(f"Completed the RCA for KPI ID: {kpi}.")


@click.command()
@with_appcontext
@click.option('--id', required=True, type=int, help="Perform the alert operation for provided Alert ID.")
def run_alert(id):
    """Check and perform the alert operation for provided Alert ID."""
    click.echo(f"Starting the alert check for ID: {id}.")
    from chaos_genius.alerts.base_alerts import check_and_trigger_alert
    status = check_and_trigger_alert(id)
    click.echo(f"Completed the alert check for ID: {id}.")


@click.command()
@with_appcontext
def run_anomaly_rca_scheduler():
    """Run the anomaly_scheduler celery task.

    Note: a celery worker needs to be active for this to work.
    """
    from chaos_genius.jobs.anomaly_tasks import anomaly_scheduler
    res = anomaly_scheduler.delay()
    res.get()
    click.echo("Completed running scheduler. Tasks should be running in the worker.")


@click.command()
@with_appcontext
@click.argument("file_name")
def kpi_import(file_name: str):
    """Adds KPIs defined in given JSON file.

    The JSON must be in the following format:

    \b
    ```
    [
            {
                "name": "",
                "is_certified": false,
                "data_source": 0,
                "kpi_type": "",
                "kpi_query": "",
                "schema_name": null,
                "table_name": "",
                "metric": "",
                "aggregation": "",
                "datetime_column": "",
                "filters": [],
                "dimensions": [],
                "run_anomaly": true,
                "anomaly_params": {
                    "frequency": "D",
                    "anomaly_period": 90,
                    "seasonality": [],
                    "model_name": "ProphetModel",
                    "sensitivity": "High"
                }
            }
    ]
    ```
    """
    with open(file_name) as f:
        kpis = json.load(f)

    for data in kpis:
        data: dict

        try:
            # TODO: separate this and KPI endpoint code in a new function
            data["dimensions"] = [] if data.get("dimensions") is None else data["dimensions"]

            if data.get("kpi_query", "").strip():
                data["kpi_query"] = data["kpi_query"].strip()
                # remove trailing semicolon
                if data["kpi_query"][-1] == ";":
                    data["kpi_query"] = data["kpi_query"][:-1]

            has_anomaly_setup = "anomaly_params" in data
            new_anomaly_params = {}

            if has_anomaly_setup:
                # validate anomaly params
                err, new_anomaly_params = validate_partial_anomaly_params(
                    data["anomaly_params"]
                )
                if err != "":
                    click.echo(f"Error in validating anomaly params for KPI {data['name']}: {err}")
                    return 1

            new_kpi = Kpi(
                name=data.get("name"),
                is_certified=data.get("is_certified"),
                data_source=data.get("data_source"),
                kpi_type=data.get("kpi_type"),
                kpi_query=data.get("kpi_query"),
                schema_name=data.get("schema_name"),
                table_name=data.get("table_name"),
                metric=data.get("metric"),
                aggregation=data.get("aggregation"),
                datetime_column=data.get("datetime_column"),
                filters=data.get("filters"),
                dimensions=data.get("dimensions"),
                run_anomaly=data.get("run_anomaly"),
            )

            # Perform KPI Validation
            status, message = validate_kpi(new_kpi.as_dict)
            if status is not True:
                click.echo(f"KPI validation failed for KPI {new_kpi.name}. Error: {message}")
                return 1

            new_kpi = new_kpi.save(commit=True)

            # Add the dashboard id 0 to the kpi
            dashboard_list = data.get("dashboard", []) + [0]
            dashboard_list = list(set(dashboard_list))
            create_dashboard_kpi_mapper(dashboard_list, [new_kpi.id])

            if has_anomaly_setup:
                # update anomaly params
                err, new_kpi = update_anomaly_params(
                    new_kpi, new_anomaly_params, check_editable=False
                )

                if err != "":
                    click.echo(f"Error updating anomaly params for KPI {new_kpi.name}: {err}")
                    return 1

            # we ensure anomaly task is run as soon as analytics is configured
            # we also run RCA at the same time
            # TODO: move this import to top and fix import issue
            from chaos_genius.jobs.anomaly_tasks import ready_anomaly_task, ready_rca_task

            anomaly_task = None
            if has_anomaly_setup:
                anomaly_task = ready_anomaly_task(new_kpi.id)

            rca_task = ready_rca_task(new_kpi.id)
            if rca_task is None:
                click.echo(
                    "Could not run RCA task since newly configured KPI "
                    f"({new_kpi.name}) was not found: {new_kpi.id}"
                )
            else:
                if anomaly_task is None:
                    click.echo(
                        "Not running anomaly since it is not configured or KPI "
                        f"({new_kpi.name}) was not found."
                    )
                else:
                    anomaly_task.apply_async()
                rca_task.apply_async()

        except Exception as e:
            click.echo(click.style(
                f"Could not set up KPI with name: {data['name']}, skipping. Error: {e}",
                fg="red",
                bold=True
            ))


@click.command()
@with_appcontext
def reinstall_db():
    """Delete the db and reinstall again."""
    from chaos_genius.settings import META_DATABASE
    from chaos_genius.extensions import db
    from chaos_genius.databases.demo_data import install_demo_db
    if click.confirm(click.style(f"Do you want to delete and reinstall the database: {META_DATABASE}?", fg="red", bold=True)):
        click.echo('Deleting the database...')
        db.drop_all()
        # TODO: This should be created via the flask sqlalchemy
        db.create_all()
        click.echo('Reinstalled the database')
        install_demo_data()
    else:
        click.echo('Aborting the reinstall...')


@click.command()
@with_appcontext
def insert_demo_data():
    """Insert the demo data."""
    install_demo_data()


def install_demo_data():
    from chaos_genius.databases.demo_data import install_demo_db
    if click.confirm(click.style(f"Do you want to insert the demo data?")):
        status = install_demo_db()
        if status:
            click.echo('Inserted the demo data')
        else:
            click.echo('Demo Data insertion failed')
    else:
        click.echo('Aborting the demo data insertion.')
