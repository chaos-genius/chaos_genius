# -*- coding: utf-8 -*-
"""Views for meta information of the API such as version."""

from copy import deepcopy

from flask.blueprints import Blueprint
from flask.json import jsonify
from pytz import all_timezones

from chaos_genius.settings import (
    CHAOSGENIUS_VERSION,
    CHAOSGENIUS_VERSION_MAIN,
    CHAOSGENIUS_VERSION_POSTFIX,
)

blueprint = Blueprint("meta", __name__, static_folder="../static")


# add UTC to the beginning to show it first in the dropdown
# since it will be default in most cases
# (UTC will be repeated again below in the list)
PYTZ_TIMEZONES = [
    # this format (label-value pairs) is needed for the frontend
    {"label": tz, "value": tz} for tz in ["UTC"] + deepcopy(all_timezones)
]


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


@blueprint.route("/supported-timezones", methods=["GET"])
def support_timezones():
    """Returns a list of support timezone (region) names."""
    return jsonify({"timezones": PYTZ_TIMEZONES})
