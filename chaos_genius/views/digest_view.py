"""A basic view for monitoring services and analytics tasks status."""

import logging
from typing import Dict, Optional, cast

from flask import Blueprint, render_template

from chaos_genius.controllers.task_monitor import get_checkpoints

blueprint = Blueprint("digest", __name__, static_folder="../static")
logger = logging.getLogger(__name__)