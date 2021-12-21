Feature: KPI Validation
    Tests for KPI validation. Note that the assumption here is that the Data
    Loader returns a correct DataFrame from the source. So these tests use
    a DataFrame directly (to eliminate dependency on DB).

    Scenario: KPI is valid without modifications
        Given a newly added KPI and its DataFrame
        Then validation should pass

    Scenario: metric column does not exist or invalid
        Given a newly added KPI and its DataFrame
        When metric column name is incorrect
        Then validation should fail
        And error message should end with "was not found as a column in the table!"

    Scenario: date/time column does not exist or invalid
        Given a newly added KPI and its DataFrame
        When date/time column name is incorrect
        Then validation should fail
        And error message should end with "was not found as a column in the table!"

    Scenario: duplicate column names in obtained data
        Given a newly added KPI and its DataFrame
        When a column name is repeated
        Then validation should fail
        And error message should start with "Duplicate column names found -"

    Scenario: invalid or unsupported aggregation
        Given a newly added KPI and its DataFrame
        When aggregation given for metric is invalid - say "abcd"
        Then validation should fail
        And error message should be ""abcd" aggregation is not supported. Supported aggregations are mean, sum, count"

    Scenario: numerical aggregation on categorical column
        Given a newly added KPI and its DataFrame
        When a numerical aggregation (mean or sum) on a non-numerical column
        Then validation should fail
        And error message should end with "column is categorical. Quantitative data is required to perform sum aggregation."

    Scenario: numerical aggregation on a string column
        Given a newly added KPI and its DataFrame
        When a numerical aggregation (mean or sum) on a column with strings
        Then validation should fail
        And error message should end with "column is categorical. Quantitative data is required to perform sum aggregation."

    Scenario: numerical aggregation on a numerical column
        Given a newly added KPI and its DataFrame
        When a numerical aggregation (mean or sum) on a numerical column
        Then validation should pass

    Scenario: metric column is same as date/time column
        Given a newly added KPI and its DataFrame
        When the metric column name is same as the date/time column
        Then validation should fail
        And error message should end with "KPI column cannot be the date column"

    Scenario: date/time column is a floating point value
        Given a newly added KPI and its DataFrame
        When the date/time column is of type float
        Then validation should fail
        And error message should be "The datetime column is of the type float, acceptable types are string and datetime"

    Scenario: date/time column is some categorical string
        Given a newly added KPI and its DataFrame
        When the date/time column is a categorical string
        Then validation should fail
        And error message should start with "Unable to parse"
        And error message should end with "Check that your date column is formatted properly and consistely."

    Scenario: date/time column has a very large timestamp or in a weird format
        Given a newly added KPI and its DataFrame
        When date/time column has a very large timestamp or in a weird format
        Then validation should fail
        And error message should start with "Timestamps in "
        And error message should end with " were out of bounds. Check that your date column is formatted properly and consistely."

    Scenario: date/time column has unix timestamp
        Given a newly added KPI and its DataFrame
        When date/time column has integer unix timestamp
        Then validation should pass
