import pandas as pd
from typing import cast


def merge_dataframe_chunks(dataframe_chunk) -> pd.DataFrame:
    # TODO: add doc strings
    dfs = []
    for df in dataframe_chunk:
        dfs.append(df)
    if dfs:
        final_df = pd.concat(dfs, ignore_index=True)
    else:
        final_df = pd.DataFrame()
    return final_df
