"""Provides constants for anomaly detection."""

from chaos_genius.core.anomaly.models import (EWSTDModel, ExpTSModel,
                                              GreyKiteModel,
                                              NeuralProphetModel, ProphetModel,
                                              StdDeviModel)

MODEL_MAPPER = {
    "StdDeviModel": StdDeviModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    "NeuralProphetModel": NeuralProphetModel,
    "GreyKiteModel": GreyKiteModel,
    "ETSModel": ExpTSModel,
}

FREQUENCY_DELTA = {"daily": {"days": 1}, "hourly": {"hours": 1}}

RESAMPLE_FREQUENCY = {"daily": "D", "hourly": "H"}
