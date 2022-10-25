# -*- coding: utf-8 -*-
"""The app module, containing the app factory function."""
import logging
import sys
import json

from flask import Flask, render_template, request
from flask.json import jsonify
from flask_cors import CORS

from chaos_genius import commands
from chaos_genius.logger import configure_logger
from chaos_genius.settings import REACT_APP_IS_DEMO
from chaos_genius.utils.utils import DEMO_ENDPOINT_WHITELIST
from chaos_genius.views import (
    data_source_view,
    download_view,
    kpi_view,
    public_view,
    meta_view,
    anomaly_data_view,
    config_setting_view,
    alert_view,
    dashboard_view,
    status_view,
    digest_view,
    rca_view,
    summary_view
)
from chaos_genius.extensions import (
    bcrypt,
    cache,
    # csrf_protect,
    db,
    flask_static_digest,
    login_manager,
    migrate,
    integration_connector,
    celery
)
from chaos_genius.settings import AIRBYTE_ENABLED


def create_app(config_object="chaos_genius.settings"):
    """Create application factory, as explained here: http://flask.pocoo.org/docs/patterns/appfactories/.

    :param config_object: The configuration object to use.
    """
    app = Flask(__name__.split(".")[0], static_url_path="/api/static")
    app.config.from_object(config_object)
    register_extensions(app)
    register_blueprints(app)
    register_hooks(app)
    register_errorhandlers(app)
    register_shellcontext(app)
    register_commands(app)
    configure_logger(app)
    configure_cors(app)
    return app


def configure_cors(app):
    """Configure cross origin request sharing."""
    if app.config["CORS_ENABLED"]:
        CORS(app)
    return None


def register_extensions(app):
    """Register Flask extensions."""
    bcrypt.init_app(app)
    cache.init_app(app)
    db.init_app(app)
    # csrf_protect.init_app(app)
    # login_manager.init_app(app)
    migrate.init_app(app, db)
    flask_static_digest.init_app(app)
    if AIRBYTE_ENABLED:
        integration_connector.init_app(app)
    celery.init_app(app)
    return None


def register_blueprints(app):
    """Register Flask blueprints."""
    app.register_blueprint(public_view.blueprint, url_prefix='/')
    app.register_blueprint(config_setting_view.blueprint, url_prefix='/api/config')
    # TODO: Rename the api endpoint to data source
    app.register_blueprint(data_source_view.blueprint, url_prefix='/api/connection')
    app.register_blueprint(kpi_view.blueprint, url_prefix='/api/kpi')
    app.register_blueprint(anomaly_data_view.blueprint, url_prefix='/api/anomaly-data')
    app.register_blueprint(alert_view.blueprint, url_prefix='/api/alert')
    app.register_blueprint(dashboard_view.blueprint, url_prefix='/api/dashboard')
    app.register_blueprint(download_view.blueprint, url_prefix='/api/downloads')
    app.register_blueprint(status_view.blueprint, url_prefix='/api/status')
    app.register_blueprint(meta_view.blueprint, url_prefix='/api/meta')
    app.register_blueprint(digest_view.blueprint, url_prefix='/api/digest')
    app.register_blueprint(rca_view.blueprint, url_prefix='/api/rca')
    app.register_blueprint(summary_view.blueprint, url_prefix='/api/summary')
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


def register_hooks(app):
    """Register hooks for Flask requests."""

    @app.before_request
    def demo_endpoints_blocker():
        """Hook to allow access to only whitelisted APIs in demo."""
        if REACT_APP_IS_DEMO:
            if request.endpoint not in DEMO_ENDPOINT_WHITELIST:
                return jsonify(
                    {
                        "status": "failure",
                        "message": "Endpoint not accessible in demo version",
                    }
                )
            else:
                if request.method not in DEMO_ENDPOINT_WHITELIST[request.endpoint]:
                    return jsonify(
                        {
                            "status": "failure",
                            "message": f"{request.method} method is not allowed for this endpoint in demo version",
                        }
                    )
                else:
                    pass


def register_commands(app):
    """Register Click commands."""
    app.cli.add_command(commands.test)
    app.cli.add_command(commands.lint)
    app.cli.add_command(commands.integration_connector)
    app.cli.add_command(commands.run_anomaly)
    app.cli.add_command(commands.run_rca)
    app.cli.add_command(commands.run_alert)
    app.cli.add_command(commands.reinstall_db)
    app.cli.add_command(commands.insert_demo_data)
    app.cli.add_command(commands.run_anomaly_rca_scheduler)
    app.cli.add_command(commands.run_digest)
    app.cli.add_command(commands.fetch_metadata)
