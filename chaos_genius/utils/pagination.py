"""Utilities to support pagination of API responses."""

from dataclasses import asdict, dataclass
from typing import Any, Dict, Tuple

from flask.wrappers import Request
from flask_sqlalchemy import Pagination


@dataclass
class PaginationInfo:
    """Info about pagination to be returned from the API."""

    page: int
    per_page: int
    total: int
    pages: int
    has_next: bool
    has_prev: bool
    first_entry_position: int
    last_entry_position: int

    def as_dict(self) -> Dict[str, Any]:
        """Converts to a dictionary."""
        return asdict(self)


def pagination_info(pagination: Pagination) -> PaginationInfo:
    """Extract info about pagination from Flask-SQLAlchemy Pagination object."""
    return PaginationInfo(
        page=pagination.page,
        per_page=pagination.per_page,
        total=pagination.total,
        pages=pagination.pages,
        has_next=pagination.has_next,
        has_prev=pagination.has_prev,
        first_entry_position=(pagination.page - 1) * pagination.per_page + 1,
        last_entry_position=(pagination.page - 1) * pagination.per_page
        + len(pagination.items),
    )


def pagination_args(
    req: Request, default_page=1, default_per_page=10
) -> Tuple[int, int]:
    """Extracts page number and per_page from Flask request args.

    Extracted from URL request parameters, not from the body.
    """
    page = int(req.args.get("page", default_page))
    per_page = int(req.args.get("per_page", default_per_page))

    return page, per_page
