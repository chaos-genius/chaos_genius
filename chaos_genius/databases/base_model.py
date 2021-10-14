# -*- coding: utf-8 -*-
"""Database module, including the SQLAlchemy database object and DB-related utilities."""

from typing import AbstractSet
from marshmallow import Schema, post_dump, pre_load
from marshmallow.exceptions import ValidationError

from chaos_genius.extensions import db

# Alias common SQLAlchemy names
Column = db.Column
relationship = db.relationship


class CRUDMixin(object):
    """Mixin that adds convenience methods for CRUD (create, read, update, delete) operations."""

    @classmethod
    def create(cls, **kwargs):
        """Create a new record and save it the database."""
        instance = cls(**kwargs)
        return instance.save()

    def update(self, commit=True, **kwargs):
        """Update specific fields of a record."""
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        return commit and self.save() or self

    def save(self, commit=True):
        """Save the record."""
        db.session.add(self)
        if commit:
            db.session.commit()
        return self

    def delete(self, commit=True):
        """Remove the record from the database."""
        db.session.delete(self)
        return commit and db.session.commit()


class Model(CRUDMixin, db.Model):
    """Base model class that includes CRUD convenience methods."""

    __abstract__ = True


class PkModel(Model):
    """Base model class that includes CRUD convenience methods, plus adds a 'primary key' column named ``id``."""

    __abstract__ = True
    id = Column(db.Integer, primary_key=True)

    @classmethod
    def get_by_id(cls, record_id):
        """Get record by ID."""
        if any(
            (
                isinstance(record_id, (str, bytes)) and record_id.isdigit(),
                isinstance(record_id, (int, float)),
            )
        ):
            return cls.query.get(int(record_id))
        return None


def reference_col(
    tablename, nullable=False, pk_name="id", foreign_key_kwargs=None, column_kwargs=None
):
    """Column that adds primary key foreign key reference.

    Usage: ::

        category_id = reference_col('category')
        category = relationship('Category', backref='categories')
    """
    foreign_key_kwargs = foreign_key_kwargs or {}
    column_kwargs = column_kwargs or {}

    return Column(
        db.ForeignKey(f"{tablename}.{pk_name}", **foreign_key_kwargs),
        nullable=nullable,
        **column_kwargs,
    )


# Marshmallow base classes follow
def get_readable_validation_error(excp: ValidationError):
    """Return a human-readable string for given ValidationError."""
    msg = "Incorrect data received\n"

    for field_name, error in excp.normalized_messages().items():
        if isinstance(error, list):
            error = ", ".join(error)

        msg += f"{field_name}: {error}\n"

    return msg


class BaseSchema(Schema):
    """Base class for all chaosgenius marshmallow schemas."""

    # different names of certain fields
    # the format is: alias -> original name
    _aliases = {}

    # these two functions map the aliases
    @pre_load
    def _preprocess_aliases(self, in_data: dict, **kwargs):
        for alias, orig_name in self._aliases.items():
            if alias in in_data:
                if orig_name not in in_data:
                    in_data[orig_name] = in_data[alias]

                in_data.pop(alias)

        return in_data

    @post_dump
    def _postprocess_aliases(self, out_data: dict, **kwargs):
        for alias, orig_name in self._aliases.items():
            if orig_name in out_data:
                out_data[alias] = out_data[orig_name]

        return out_data

    @staticmethod
    def _validate_oneof_maker(choices: AbstractSet[str]):
        """Create validator that checks if the value is one of `choices`."""

        def validator(value):
            if value not in choices:
                raise ValidationError(
                    f"must be one of {', '.join(choices)}. Got: {value}"
                )

        return validator
