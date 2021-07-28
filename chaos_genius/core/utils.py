import os
from typing import Union

import pandas as pd

# Required to supress pystan output while running facebook's prophet
# from https://github.com/facebook/prophet/issues/223
class suppress_stdout_stderr(object):
    '''
    A context manager for doing a "deep suppression" of stdout and stderr in
    Python, i.e. will suppress all print, even if the print originates in a
    compiled C/Fortran sub-function.
       This will not suppress raised exceptions, since exceptions are printed
    to stderr just before a script exits, and after the context manager has
    exited (at least, I think that is why it lets exceptions through).
    '''
    def __init__(self):
        # Open a pair of null files
        self.null_fds = [os.open(os.devnull, os.O_RDWR) for x in range(2)]
        # Save the actual stdout (1) and stderr (2) file descriptors.
        self.save_fds = [os.dup(1), os.dup(2)]

    def __enter__(self):
        # Assign the null pointers to stdout and stderr.
        os.dup2(self.null_fds[0], 1)
        os.dup2(self.null_fds[1], 2)

    def __exit__(self, *_):
        # Re-assign the real stdout/stderr back to (1) and (2)
        os.dup2(self.save_fds[0], 1)
        os.dup2(self.save_fds[1], 2)
        # Close the null files
        for fd in self.null_fds + self.save_fds:
            os.close(fd)


def round_number(n: float) -> Union[int, float]:
    abs_n = abs(n)
    if abs_n >= 10000:
        return round(n)
    elif abs_n >= 100:
        return round(n, 1)
    elif abs_n >= 1:
        return round(n, 2)
    else:
        return round(n, 3)

def round_series(series: pd.Series) -> pd.Series:
    if series.dtype != object:
        return series.apply(lambda x: round_number(x))
    else:
        return series

def round_df(df: pd.DataFrame) -> pd.DataFrame:
    new_df = df.copy()
    for col in new_df.columns:
        new_df[col] = round_series(new_df[col])
    return new_df
