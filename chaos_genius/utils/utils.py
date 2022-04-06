# -*- coding: utf-8 -*-
"""Helper utilities and decorators."""
import csv
import io
import subprocess
from typing import Iterator, List
import time
import functools
from types import GeneratorType

from flask import flash
from pydantic import BaseModel
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


def time_my_func(func):
    """Print the runtime of the decorated function."""
    @functools.wraps(func)
    def wrapper_timer(*args, **kwargs):
        start_time = time.perf_counter()
        value = func(*args, **kwargs)
        end_time = time.perf_counter()
        run_time = end_time - start_time
        print("----------------------------")
        print("Finished {0} in {1:.4f} secs".format(func.__name__, run_time))
        print("----------------------------")
        return value
    return wrapper_timer


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
    if isinstance(obj, BaseModel):
        obj_dict = obj.dict()
        if "__root__" in obj_dict:
            obj_dict = obj_dict["__root__"]
        return jsonable_encoder(obj_dict)
    return pydantic_encoder(obj)
