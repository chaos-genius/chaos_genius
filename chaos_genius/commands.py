# -*- coding: utf-8 -*-
"""Click commands."""
import os
from glob import glob
from subprocess import call

import click
from flask.cli import with_appcontext


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
def run_anomaly(kpi):
    """Perform the anomaly detection for given KPI."""
    click.echo(f"Starting the anomaly for KPI ID: {kpi}.")
    from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi
    status = run_anomaly_for_kpi(kpi)
    click.echo(f"Completed the anomaly for KPI ID: {kpi}.")
