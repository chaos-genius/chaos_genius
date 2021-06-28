# -*- coding: utf-8 -*-
"""Click commands."""
import os
from glob import glob
from subprocess import call

import click

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
def third_party_connector():
    """Initialise the third party connector env"""

    click.echo(f"Third Party Setup: Third Party setup started.")
    from chaos_genius.third_party.third_party_client import init_third_party

    # TODO: Ask these params from CLI
    server_url = "http://localhost:8001"
    db_host = "md-postgres-test-db-instance.cjzi0pwi8ki4.ap-south-1.rds.amazonaws.com"
    db_user = "postgres"
    db_password = "y5D87FnikqVHW7eg3NVQ"
    db_port = 5432
    db_name = "test_airbyte"
    db_schema = "public"

    status = init_third_party(server_url, db_host, db_user, db_password, db_port, db_name, db_schema)
    if status:
        click.echo(f"Third Party Setup: Connector initialised successfully.")
    else:
        click.echo(f"Third Party Setup: Connector initialisation failed.")
