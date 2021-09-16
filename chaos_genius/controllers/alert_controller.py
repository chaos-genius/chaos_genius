from chaos_genius.databases.models.alert_model import Alert

def get_alert_list(frequency=None):
    """get alert list"""
    if frequency:
        data = Alert.query.filter_by(alert_frequency=frequency).all()
    else:
        data = Alert.query.all()
    results = [point.as_dict for point in data]
    return results


def get_alert_info(id: int):
    """alert info for any given alert id

    Args:
        id (int): alert id
    """
    alert = Alert.query.filter_by(id=id).fetchone()
    if not alert:
        raise Exception("Alert ID doens't exist")
    return alert.as_dict
