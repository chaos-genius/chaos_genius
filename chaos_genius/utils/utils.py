# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import subprocess
from types import GeneratorType

from flask import flash
from pydantic.json import pydantic_encoder


def flash_errors(form, category="warning"):
    """Flash all errors for a form."""
    for field, errors in form.errors.items():
        for error in errors:
            flash(f"{getattr(form, field).label.text} - {error}", category)


def latest_git_commit_hash() -> str:
    """Hash of the latest checked out commit.

    Returns empty string if git command was unsuccessful.
    """
    try:
        return (
            subprocess.check_output(["git", "rev-parse", "--short", "HEAD"])
            .decode("ascii")
            .strip()
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def jsonable_encoder(obj):
    """Convert a (pydantic) object to a JSONable dict.

    See: https://github.com/samuelcolvin/pydantic/pull/317#issuecomment-443689941
    """
    if isinstance(obj, (str, int, float, type(None))):
        return obj
    if isinstance(obj, dict):
        return {
            jsonable_encoder(key): jsonable_encoder(value) for key, value in obj.items()
        }
    if isinstance(obj, (list, set, frozenset, GeneratorType, tuple)):
        return [jsonable_encoder(item) for item in obj]
    return pydantic_encoder(obj)
