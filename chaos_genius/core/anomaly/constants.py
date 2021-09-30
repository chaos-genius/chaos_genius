"""Provides constants for anomaly detection."""

from chaos_genius.core.anomaly.models import (EWSTDModel, ExpTSModel,
                                              GreyKiteModel,
                                              NeuralProphetModel, ProphetModel,
                                              StandardDeviationModel)

MODEL_MAPPER = {
    "StandardDeviationModel": StandardDeviationModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    "NeuralProphetModel": NeuralProphetModel,
    "GreyKiteModel": GreyKiteModel,
    "ETSModel": ExpTSModel,
}

FREQUENCY_DELTA = {"daily": {"days": 1}, "hourly": {"hours": 1}}

RESAMPLE_FREQUENCY = {"daily": "D", "hourly": "H"}
