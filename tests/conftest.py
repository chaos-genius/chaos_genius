"""pytest utility functions for ChaosGenius.

conftest.py is a special file that is loaded for all tests
by pytest. See: https://stackoverflow.com/a/34520971/11199009.
Hence, it does not have to be imported in any test file.
"""

import pytest

from chaos_genius.app import create_app

app = create_app()


@pytest.fixture
def flask_app():
    """The Flask app to use for app context."""
    return app


@pytest.fixture
def flask_app_context():
    """Fixture that provides flask app context."""
    with app.app_context() as context:
        yield context


@pytest.fixture
def flask_client():
    """Fixture that provides the flask test client.

    Can be used to send requests to any configured route.
    """
    with app.test_client() as client:
        yield client
