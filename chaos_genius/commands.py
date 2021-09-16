# -*- coding: utf-8 -*-
"""Click commands."""
import os
from glob import glob
from subprocess import call

import click
from flask.cli import with_appcontext
from flask_migrate import upgrade as db_upgrade
from chaos_genius.utils.io_helper import which

HERE = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.join(HERE, os.pardir)
TEST_PATH = os.path.join(PROJECT_ROOT, "tests")


@click.group()
def cli():
    """Command Line Interface for Chaos Genius
    """
    pass


@cli.command()
def start():
    """Start the chaosgenius server."""
    click.secho(ASCII_ART, fg="green")
    program = which('honcho')
    if not program:
        raise Exception('No process mananger found')
    commands = [program, 'start']
    os.execv(program, commands)


@cli.command()
def upgrade():
    """Upgrade the chaosgenius."""
    click.echo("Pulling the latest code")
    click.echo("Installing the dependencies")
    click.echo("Migrating the database")
    click.echo("Building the new environment")
    click.echo("Restarting the services")


@click.group(name='setup')
def setup():
    """Setup for the chaosgenius"""
    pass


@setup.command('check')
def check():
    """Check the system compatibility"""
    os_type = os.uname().sysname
    if os_type == 'Darwin':
        bash = which('bash')
        commands = [bash, 'setup/check-macos.sh']
        os.execv(bash, commands)


@setup.command('developement')
def database():
    """Setup the Chaosgenius development environment"""
    pass


@setup.command('prod-master')
def production():
    """Setup the production master instance"""
    click.echo("Setting up the nginx")
    click.echo("Setting up the backend API server")
    click.echo("Setting up the scheduler")


@setup.command('prod-worker')
def production():
    """Setup the production worker instance"""
    click.echo("Setting up the worker")


@setup.command('integration')
def integration():
    """Setup the third party integration env"""

    click.echo(f"Third Party Setup: Third Party setup started.")

    from chaos_genius.third_party.integration_client import init_integration_server
    status = init_integration_server()

    if status:
        click.echo(f"Third Party Setup: Connector initialised successfully.")
    else:
        click.echo(f"Third Party Setup: Connector initialisation failed.")


@setup.command('database')
def database():
    """Setup the database"""
    pass


@click.group(name='db')
def db():
    """Database operation for the chaosgenius"""
    pass


@db.command('install')
@with_appcontext
def install():
    """Create and install the database"""
    click.echo("Creating the table...")
    from chaos_genius.extensions import db
    # db.create_all()
    click.echo("Migrating the database...")
    db_upgrade()


@db.command('migrate')
@with_appcontext
def migrate():
    """Migrate the database"""
    click.echo("Migrating the database...")
    db_upgrade()


@db.command('reinstall')
@with_appcontext
def reinstall():
    """Reinstall the database"""
    """Delete the db and reinstall again."""
    from chaos_genius.settings import META_DATABASE
    from chaos_genius.extensions import db
    from chaos_genius.databases.demo_data import install_demo_db
    if click.confirm(click.style(f"Do you want to delete and reinstall the database: {META_DATABASE}?", fg="red", bold=True)):
        click.echo('Deleting the database...')
        db.drop_all()
        db_upgrade()
        click.echo('Reinstalled the database')
        install_demo_data()
    else:
        click.echo('Aborting the reinstall...')


@db.command('load-demo')
@with_appcontext
def load_demo():
    """Load the demo dataset"""
    from chaos_genius.databases.demo_data import install_demo_db
    if click.confirm(click.style(f"Do you want to insert the demo data?")):
        status = install_demo_db()
        if status:
            click.echo('Inserted the demo data')
        else:
            click.echo('Demo Data insertion failed')
    else:
        click.echo('Aborting the demo data insertion.')


@click.group(name='run')
def run():
    """Run the algorithm for the chaosgenius"""
    pass



@run.command('anomaly')
@with_appcontext
@click.option('--kpi', required=True, type=int, help="Perform the anomaly detection for given KPI.")
def anomaly(kpi):
    """Perform the anomaly detection for given KPI."""
    click.echo(f"Starting the anomaly for KPI ID: {kpi}.")
    from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi
    status = run_anomaly_for_kpi(kpi)
    click.echo(f"Completed the anomaly for KPI ID: {kpi}.")


@run.command('alert')
@with_appcontext
@click.option('--id', required=True, type=int, help="Perform the alert operation for provided Alert ID.")
def alert(id):
    """Check and perform the alert operation for provided Alert ID."""
    click.echo(f"Starting the alert check for ID: {id}.")
    from chaos_genius.alerts.base_alerts import check_and_trigger_alert
    status = check_and_trigger_alert(id)
    click.echo(f"Completed the alert check for ID: {id}.")


@click.group(name='cli1')
def cli1():
    """Command Line Interface for Chaos Genius
    """
    pass


@cli1.command()
def test():
    """Run the tests."""
    import pytest

    rv = pytest.main([TEST_PATH, "--verbose"])
    exit(rv)


@cli1.command()
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


ASCII_ART = """
                                        
                                     /#%&&&&&&&&&%%%#*           
                                  /#&&&&&.*(&&&%%%%##%%%%        
                                (%&&&%%%%#(%&&%(**. *(##%%&      
                              #%&&&%###%%&&&&%%#(,  .,/(#%%&*    
                             %&&&&%####%%%%%%%###//((((####%%*   
                             &&&&%#((###%%(#######((((((###%%&   
                            *&&&&%#(######*./##(((((((((####%&   
                             &&&&%##(((#####(((((((////(((#%%&   
                             &&&&&##((/((((////////////(((#%%/   
                              @&%%%#(//*****,,,,,,****//(#%%/    
                                &%%##(/**,,,......,,,*/((%&      
                                  &##((/*,.........,**/#&        
                                     &%#/*,,,,,,,,*/##           
                                   %%#(//*(#%%##(/////*,         
                                 /###/*..,*(###(((/*,,*//        

 ██████╗██╗  ██╗ █████╗  ██████╗ ███████╗     ██████╗ ███████╗███╗   ██╗██╗██╗   ██╗███████╗
██╔════╝██║  ██║██╔══██╗██╔═══██╗██╔════╝    ██╔════╝ ██╔════╝████╗  ██║██║██║   ██║██╔════╝
██║     ███████║███████║██║   ██║███████╗    ██║  ███╗█████╗  ██╔██╗ ██║██║██║   ██║███████╗
██║     ██╔══██║██╔══██║██║   ██║╚════██║    ██║   ██║██╔══╝  ██║╚██╗██║██║██║   ██║╚════██║
╚██████╗██║  ██║██║  ██║╚██████╔╝███████║    ╚██████╔╝███████╗██║ ╚████║██║╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚══════╝
                                                                                            
"""


cli.add_command(setup)
cli.add_command(db)
cli.add_command(run)
# cli.add_command(cli1)
