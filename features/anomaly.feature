Feature: showcase anomaly

  Scenario: run anomaly on lyft data
     Given we have the lyft data loaded into db
      When we run anomaly on lyft data
      Then we compare with the right results