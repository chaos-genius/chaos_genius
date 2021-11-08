"""Provides constants for anomaly detection."""

FREQUENCY_DELTA = {
    "daily": {"days": 1},
    "hourly": {"hours": 1},
    "D": {"days": 1},
    "H": {"hours": 1},
}

RESAMPLE_FREQUENCY = {"daily": "D", "hourly": "H", "D": "D", "H": "H"}

MODEL_NAME_MAPPING = {
    "StandardDeviationModel": "Standard Deviation",
    "ProphetModel": "Prophet",
    "EWSTDModel": "Exponentially Weighted Std Dev",
    # "NeuralProphetModel": "NeuralProphet",
    # "GreyKiteModel": "Greykite",
    "ETSModel": "ETS",
}
