"""Provides base class for anomaly detection models."""

import os


class AnomalyModel(object):
    """Base class for anomaly detection models."""

    def __init__(self, *args, **kwargs) -> None:
        """Initialize model for anomaly detection."""
        pass

    def save(self, *args, **kwargs):
        """Save model."""
        raise NotImplementedError

    def load(self, *args, **kwargs):
        """Load model."""
        raise NotImplementedError

    def check_and_make_path(self, file_path: str):
        """Check if file path exists and create it if not.

        :param file_path: path to file
        :type file_path: str
        """
        dir_path, _ = file_path.rsplit("/", 1)
        try:
            os.makedirs(dir_path)
        except FileExistsError:
            pass
