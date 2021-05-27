# -*- coding: utf-8 -*-
"""Dataset views for creating and viewing the Datasets."""
from flask import (
    Blueprint,
    current_app,
    flash,
    redirect,
    render_template,
    request,
    url_for,
    jsonify
)

from chaos_genius.databases.models.dataset_model import Dataset
from chaos_genius.utils import flash_errors

blueprint = Blueprint("api_dataset", __name__, static_folder="../static")


@blueprint.route("/", methods=["GET", "POST"])
def dataset():
    """Dataset list view."""
    current_app.logger.info("Dataset list")
    # Handle logging in
    if request.method == "POST":
        pass
    return jsonify({'data': 'Dataset list'})
    # return render_template("public/home.html", form=form)
