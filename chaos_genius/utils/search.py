"""Helpers for text-based search of data in the DB.

Note: these are not for a full text search, instead they are for searching for things
like KPI name, data source name, etc.
"""

from flask.wrappers import Request


def make_search_filter(req: Request, column):
    """Creates a search filter on the given column from the `query` URL argument.

    Note: to be used with a GET request since this works on the URL parameters.

    Uses `ILIKE` to search - does not support fuzzy matching.

    Returns:
        An SQLAlchemy filter if the `query` argument was given, `None` otherwise.
    """
    query = req.args.get("query")
    if query is not None:
        return column.ilike(f"%{query}%")
