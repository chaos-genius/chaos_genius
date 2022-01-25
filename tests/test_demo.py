"""Demo behavioural testing using pytest-bdd."""

from pytest_bdd import given, scenario, then, when

from chaos_genius.controllers.kpi_controller import run_anomaly_for_kpi


@scenario("features/demo.feature", "run anomaly on lyft data")
def test_demo_anomaly_lyft():
    """Scenario to test anomaly. Only for demoing pytest-bdd."""
    pass


@given("we have the lyft data loaded into db")
def lyft_data_loaded():
    """Ensure lyft data is loaded into DB (demo only)."""
    # check for db data loaded
    pass


@when("we run anomaly on lyft data", target_fixture="anomaly_lyft_result")
def run_anomaly_lyft(flask_app_context):  # noqa: D103
    """Run anomaly for lyft KPI (demo only)."""
    return True


@then("we compare with the right results")
def compare_anomaly_results(anomaly_lyft_result):
    """Compare anomaly results with actual (demo only)."""
    # assert anomaly_result equals to db test data
    assert anomaly_lyft_result is True
