# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import subprocess

from flask import flash


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
