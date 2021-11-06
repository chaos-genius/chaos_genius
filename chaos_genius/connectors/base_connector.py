import pandas as pd
from sqlalchemy import create_engine


def get_df_from_db_uri(db_uri, query):
    engine = create_engine(db_uri)
    df = pd.read_sql_query(query, engine)
    # pd.read_sql(session.query(Complaint).filter(Complaint.id == 2).statement,
    # session.bind)
    return df
