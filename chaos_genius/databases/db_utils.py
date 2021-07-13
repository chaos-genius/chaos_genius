

def create_sqlalchemy_uri(db_type, host, port, database, username, password):
    db_uri = ""
    if db_type == "postgres":
        db_uri = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
    elif db_type == "mysql":
        db_uri = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
    return db_uri
