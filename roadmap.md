🚦 Coming soon
-----------

### Features

These are the main features that we will enable soon:

-   Anomaly detection
    -   Sub-Dimensional Anomaly Alert
    -   Enable Anomaly w/o Sub-Dimension
-   Code/API level configuration for
    -   Hyperparameters for any algorithms
    -   Subpopulation calculation logic 
-   Alerting
    -   Backoff for alerting to minimize repeated alerts

### New Connectors 

We will be enabling the following new connectors soon:

- [ ] Redshift
- [ ] Hubspot
- [ ] Salesforce
- [ ] Google Analytics Custom Report (will likely already enabled)
- [ ] CSV

### Scalability & Robustness Improvements

We are working on the following to improve & support data at larger scale:

-   Data ingestion
    -   Support for materialized views across dataware houses for large scale processing
    -   Support for OLAP cube support where available
-   Data processing
    -   Distributed Sub-Dimensional Anomaly Detection
    -   Higher level of sub population support 
-   Robustness
    -   More Robust & Fault Tolerant Task Scheduler
    -   Robust Error Messages that aid in debugging


:construction: Coming in 6-12 weeks
--------------------

### Features

These are the main features that we will enable in the next quarter

-   Correlation - AutoRCA
-   KPI Import
    -   Metabase (partially done)
    -   Superset
    -   Looker
    -   Dbt
-   API support for KPI management & analysis  
-   Anomaly detection
    -   Investigate Anomaly List
    -   More granular runtime frequency - currently 1 day
    -   Model/Params change
-   Data quality
    -   Deeper DQ metrics which account for data distribution
    -   Ability to define arbitrary DQ metrics with Great Expectations
-   KPI definition catalog
    -   Single data source
    -   Multi data source
-   Forecast as input for RCA 
-   K8 configuration for horizontal scaling
### Connectors

We will enabling the following new connectors:

- [ ] S3
- [ ] Data lake support including Delta Lake
- [ ] Google Playstore
- [ ] RPA based connectors platform (longer term)

### Scalability & Robustness Improvements 

We are working on the following to improve & support data at larger scale:

-   Data scalability 
    -   Distributed Pandas support - Koalas, Dask
    -   Compressed Data/ Metrics Store (longer term)
-   Interactive analysis at scale
    -   Implementation of Pinot & Druid based data store to enable interactive analysis 
-   ML scalability
    -   Model warm start where possible for heavier models
    -   Feature & model store
