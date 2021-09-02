from chaos_genius.core.anomaly.models import StdDeviModel
from chaos_genius.core.anomaly.models import ProphetModel
from chaos_genius.core.anomaly.models import EWSTDModel
from chaos_genius.core.anomaly.models import NeuralProphetModel
from chaos_genius.core.anomaly.models import GreyKiteModel

MODEL_MAPPER = {
    "StdDeviModel": StdDeviModel,
    "ProphetModel": ProphetModel,
    "EWSTDModel": EWSTDModel,
    "NeuralProphetModel": NeuralProphetModel,
    "GreyKiteModel": GreyKiteModel
}
