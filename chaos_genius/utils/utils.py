# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import csv
import io
import subprocess
from typing import Iterator, List

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


def iter_csv(data: Iterator[List[str]]) -> Iterator[str]:
    """A Generator function to help in streaming csv downloads.

    Yields lines of CSV file made out of the input data"""
    line = io.StringIO()
    writer = csv.writer(line, delimiter=",")
    for csv_line in data:
        writer.writerow(csv_line)
        line.seek(0)
        yield line.read()
        line.truncate(0)
        line.seek(0)
