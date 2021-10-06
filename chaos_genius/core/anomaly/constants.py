"""Provides constants for anomaly detection."""

from chaos_genius.core.anomaly.models.ets_model import ExpTSModel
from chaos_genius.core.anomaly.models.ewstd_model import EWSTDModel
from chaos_genius.core.anomaly.models.greykite_model import GreyKiteModel
from chaos_genius.core.anomaly.models.neuralprophet_model import \
    NeuralProphetModel
from chaos_genius.core.anomaly.models.prophet_model import ProphetModel
from chaos_genius.core.anomaly.models.standard_deviation_model import \
    StandardDeviationModel

FREQUENCY_DELTA = {"daily": {"days": 1}, "hourly": {"hours": 1}}

MODEL_MAPPER = {
    "StandardDeviationModel": StandardDeviationModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    "NeuralProphetModel": NeuralProphetModel,
    "GreyKiteModel": GreyKiteModel,
    "ETSModel": ExpTSModel
}

FREQUENCY_DELTA = {
    "daily": {"days": 1},
    "hourly": {"hours": 1}
}

RESAMPLE_FREQUENCY = {
    "daily": "D",
    "hourly": "H"
}

MODEL_NAME_MAPPING = {
    "StandardDeviationModel": "Standard Deviation",
    "ProphetModel": "Prophet",
    "EWSTDModel": "Exponentially Weighted Std Dev",
    "NeuralProphetModel": "NeuralProphet",
    "GreyKiteModel": "Greykite",
    "ETSModel": "ETS"
}
