from behave import *
from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi

@given('we have the lyft data loaded into db')
def step_impl(context):
    # check for db data loaded
    pass

@when('we run anomaly on lyft data')
def step_impl(context):
    with context.app.app_context():
        context.anomaly_result = run_anomaly_for_kpi(1)

@then('we compare with the right results')
def step_impl(context):
    # assert context.anomaly_result equals to db test data
    pass