import pandas as pd
from typing import cast

def merge_dataframe_chunks(dataframe_chunk) -> pd.DataFrame:
    # TODO: add doc strings
    return pd.concat([chunk for chunk in dataframe_chunk], ignore_index=True)
