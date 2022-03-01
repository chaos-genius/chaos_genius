# -*- coding: utf-8 -*-
"""Click commands."""
import os
from datetime import datetime
from glob import glob
from subprocess import call

import click
from flask.cli import with_appcontext

from chaos_genius.settings import AIRBYTE_ENABLED

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

    if AIRBYTE_ENABLED:
        status = init_integration_server()
        if status:
            click.echo("Third Party Setup: Connector initialised successfully.")
        else:
            click.echo("Third Party Setup: Connector initialisation failed.")
    else:
        click.echo("Third Party Setup: Connector is disabled in the env file.")


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
    from chaos_genius.alerts import check_and_trigger_alert
    status = check_and_trigger_alert(id)
    click.echo(f"Completed the alert check for ID: {id}.")

@click.command()
@with_appcontext
@click.option("-f", "--frequency", required=True, type=str, help="Trigger Alert Digest for provided frequency.")
def run_digest(frequency):
    """Trigger alert digests"""
    click.echo(f"Starting the digest check")
    from chaos_genius.alerts.base_alert_digests import check_and_trigger_digest
    test = check_and_trigger_digest(frequency)
    click.echo(f"The digest check has ended")


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
