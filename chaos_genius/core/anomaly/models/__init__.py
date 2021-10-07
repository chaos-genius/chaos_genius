"""Provides models for anomaly detection."""

from chaos_genius.core.anomaly.models.anomaly_model import AnomalyModel  # noqa
from chaos_genius.core.anomaly.models.ets_model import ExpTSModel
from chaos_genius.core.anomaly.models.ewstd_model import EWSTDModel
# from chaos_genius.core.anomaly.models.greykite_model import GreyKiteModel
# from chaos_genius.core.anomaly.models.neuralprophet_model import \
#     NeuralProphetModel
from chaos_genius.core.anomaly.models.prophet_model import ProphetModel
from chaos_genius.core.anomaly.models.standard_deviation_model import \
    StandardDeviationModel

MODEL_MAPPER = {
    "StandardDeviationModel": StandardDeviationModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    # "NeuralProphetModel": NeuralProphetModel,
    # "GreyKiteModel": GreyKiteModel,
    "ETSModel": ExpTSModel,
}
