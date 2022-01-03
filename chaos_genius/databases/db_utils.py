

# TODO: Delete this function and attached functionality
def create_sqlalchemy_uri(db_type, host, port, database, username, password):
    db_uri = ""
    if db_type == "postgres":
        db_uri = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database}"
    elif db_type == "mysql":
        db_uri = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"
    return db_uri


def chech_editable_field(meta_info,field_name):
    # meta_info = Kpi.meta_info()
    return next((item['is_editable'] for item in meta_info['fields'] if item["name"] == field_name), False)

