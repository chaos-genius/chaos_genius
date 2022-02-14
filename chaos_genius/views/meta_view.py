# -*- coding: utf-8 -*-
"""Views for meta information of the API such as version."""

from flask.blueprints import Blueprint
from flask.json import jsonify

from chaos_genius.settings import (
    CHAOSGENIUS_VERSION,
    CHAOSGENIUS_VERSION_MAIN,
    CHAOSGENIUS_VERSION_POSTFIX,
)

blueprint = Blueprint("meta", __name__, static_folder="../static")


@blueprint.route("/version", methods=["GET"])
def version_view():
    """Chaosgenius version information."""
    return jsonify(
        {
            "version": CHAOSGENIUS_VERSION,
            "extra": {
                "main": CHAOSGENIUS_VERSION_MAIN,
                "postfix": CHAOSGENIUS_VERSION_POSTFIX,
            },
        }
    )
