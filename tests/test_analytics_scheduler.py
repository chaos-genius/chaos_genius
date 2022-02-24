"""Tests for analytics_scheduler"""

# Test cases:
# 1 minute/1 hour since last scheduled - should not schedule again
# 23 hours since last scheduled - should not schedule again
# 24 hours + 1 minute since last scheduled - should schedule again
# Anomaly not setup
    # 1 hour since KPI setup - should not schedule again
    # 24 hours + 1 minute since KPI setup - should schedule
    # Anomaly should not run in any case, only DeepDrills
# Anomaly setup after DeepDrills has run
    # DeepDrills should not run at 24 hours after first run
    # DeepDrills should run 24 hours after anomaly run


# Integration Tests
# Test anomaly/deepdrills invocation outside of scheduler:
#     When KPI is setup:
# Deepdrils should run
# When anomaly is setup:
#     Only anomaly should run
#     Next DeepDrills should run with anomaly
