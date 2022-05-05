"""Helpers for text-based search of data in the DB.

Note: these are not for a full text search, instead they are for searching for things
like KPI name, data source name, etc.
"""

from typing import Any, Tuple

from flask.wrappers import Request

SEARCH_PARAM_NAME = "search"


def make_search_filter(req: Request, column) -> Tuple[str, Any]:
    """Creates a search filter on the given column from the `search` URL argument.

    Note: to be used with a GET request since this works on the URL parameters.

    Uses `ILIKE` to search - does not support fuzzy matching.

    Returns:
        The search query if present, empty string otherwise.
        An SQLAlchemy filter if the `search` argument was present, `None` otherwise.
    """
    query = req.args.get(SEARCH_PARAM_NAME)
    if query is not None:
        return query, column.ilike(f"%{query}%")
    return "", None
