# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import sys
import json

from flask import Flask, render_template
from flask_cors import CORS

from chaos_genius import commands
from chaos_genius.views import (
    data_source_view,
    kpi_view,
    public_view,
    anomaly_data_view,
    config_setting_view
)
from chaos_genius.extensions import (
    bcrypt,
    cache,
    # csrf_protect,
    db,
    flask_static_digest,
    login_manager,
    migrate,
    integration_connector
)


def create_app(config_object="chaos_genius.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split(".")[0])
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    register_errorhandlers(app)
    register_shellcontext(app)
    register_commands(app)
    configure_logger(app)
    CORS(app) # TODO: Remove the CORS in v1 release
    return app


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    cache.init_app(app)
    db.init_app(app)
    # csrf_protect.init_app(app)
    # login_manager.init_app(app)
    migrate.init_app(app, db)
    flask_static_digest.init_app(app)
    integration_connector.init_app(app)
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(public_view.blueprint, url_prefix='/')
    app.register_blueprint(config_setting_view.blueprint, url_prefix='/api/config')
    # TODO: Rename the api endpoint to data source
    app.register_blueprint(data_source_view.blueprint, url_prefix='/api/connection')
    app.register_blueprint(kpi_view.blueprint, url_prefix='/api/kpi')
    app.register_blueprint(anomaly_data_view.blueprint, url_prefix='/api/anomaly-data')
    return None


def register_errorhandlers(app):
    """Register error handlers."""

    def render_error(e):
        """Render error template."""
        response = e.get_response()
        response.data = json.dumps({
            "code": e.code,
            "name": e.name,
            "description": e.description,
        })
        response.content_type = "application/json"
        return response

    for errcode in [401, 404, 500]:
        app.errorhandler(errcode)(render_error)
    return None


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"db": db}  # , "User": user.models.User}

    app.shell_context_processor(shell_context)


def register_commands(app):
    """Register Click commands."""
    app.cli.add_command(commands.test)
    app.cli.add_command(commands.lint)
    app.cli.add_command(commands.integration_connector)
    app.cli.add_command(commands.run_anomaly)
    app.cli.add_command(commands.reinstall_db)
    app.cli.add_command(commands.insert_demo_data)


def configure_logger(app):
    """Configure loggers."""
    handler = logging.StreamHandler(sys.stdout)
    if not app.logger.handlers:
        app.logger.addHandler(handler)
