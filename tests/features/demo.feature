Feature: showcase anomaly
    A demo of what a feature looks like. This test does not do anything.

    Scenario: run anomaly on lyft data
        Given we have the lyft data loaded into db

        When we run anomaly on lyft data

        Then we compare with the right results
