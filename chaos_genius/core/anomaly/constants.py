from chaos_genius.core.anomaly.models import StdDeviModel
from chaos_genius.core.anomaly.models import ProphetModel
from chaos_genius.core.anomaly.models import EWSTDModel
from chaos_genius.core.anomaly.models import NeuralProphetModel
from chaos_genius.core.anomaly.models import GreyKiteModel
from chaos_genius.core.anomaly.models import ExpTSModel


MODEL_MAPPER = {
    "StdDeviModel": StdDeviModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    "NeuralProphetModel": NeuralProphetModel,
    "GreyKiteModel": GreyKiteModel,
    "ETSModel" : ExpTSModel
}

FREQUENCY_DELTA = {
    "daily": {"days": 1},
    "hourly": {"hours": 1}
}

RESAMPLE_FREQUENCY = {
    "daily": "D",
    "hourly": "H"
}