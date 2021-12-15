import React from 'react';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';
import HumanReadableNumbers from '../HumanReadableNumbers';
import './dashboardgraphcard.scss';

const Dashboardgraphcard = ({
  aggregationData,
  monthWeek,
  kpi,
  kpiName,
  kpiAggregate
}) => {
  return (
    <>
      <div className="graph-custom-card-container">
        <div className="graph-custom-card-titles">
          <div className="graph-titles">
            {kpiAggregate === 'sum' ? <h5>Sum</h5> : <h4>Sum</h4>}
            {kpiAggregate === 'mean' ? <h5>Mean</h5> : <h4>Mean</h4>}
            {kpiAggregate === 'count' ? <h5>Count</h5> : <h4>Count</h4>}
            {kpiAggregate === 'median' ? <h5>Median</h5> : <h4>Median</h4>}
            {kpiAggregate === 'max' ? <h5>Max</h5> : <h4>Max</h4>}
            {kpiAggregate === 'min' ? <h5>Max</h5> : <h4>Min</h4>}
          </div>
        </div>
        {/* Last Month/Last Week */}
        <div className="graph-custom-card">
          <label>
            {monthWeek.value === 'wow'
              ? 'Last Week'
              : monthWeek.value === 'mom'
              ? 'Last Month'
              : 'Last Day'}
          </label>
          <div className="grey-card">
            {kpiAggregate === 'sum' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.sum ? (
                  <HumanReadableNumbers
                    number={aggregationData.panel_metrics.grp1_metrics.sum}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.sum ? (
                  <HumanReadableNumbers
                    number={aggregationData.panel_metrics.grp1_metrics.sum}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'mean' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.mean ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.mean
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.mean ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.mean
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'count' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.count ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.count
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.count ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.count
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'median' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.median ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.median
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.median ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.median
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'max' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.max ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.max
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp1_metrics?.max ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.max
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'min' ? (
              <h5>
                {aggregationData &&
                aggregationData?.panel_metrics?.grp1_metrics?.min ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.min
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData?.panel_metrics?.grp1_metrics?.min ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp1_metrics?.min
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
          </div>
        </div>
        {/* This Month/This Week */}
        <div className="graph-custom-card">
          <label>
            {monthWeek.value === 'wow'
              ? 'This Week'
              : monthWeek.value === 'mom'
              ? 'This Month'
              : 'This Day'}
          </label>
          <div className="white-card">
            {kpiAggregate === 'sum' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.sum ? (
                  <HumanReadableNumbers
                    number={aggregationData.panel_metrics?.grp2_metrics?.sum}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.sum ? (
                  <HumanReadableNumbers
                    number={aggregationData.panel_metrics?.grp2_metrics?.sum}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'mean' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.mean ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.mean
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.mean ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.mean
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'count' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.count ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.count
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.count ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.count
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'median' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.median ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.median
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.median ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.median
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
            {kpiAggregate === 'max' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.max ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.max
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.max ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.max
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}

            {kpiAggregate === 'min' ? (
              <h5>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.min ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.min
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </h5>
            ) : (
              <span>
                {aggregationData &&
                aggregationData.panel_metrics?.grp2_metrics?.min ? (
                  <HumanReadableNumbers
                    number={parseFloat(
                      aggregationData.panel_metrics?.grp2_metrics?.min
                    ).toFixed(2)}
                  />
                ) : (
                  '-'
                )}
              </span>
            )}
          </div>
        </div>
        {/* Difference */}
        <div className="graph-custom-card">
          <label>Difference</label>
          <div className="white-card">
            {kpiAggregate === 'sum' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.sum !== undefined &&
                aggregationData.panel_metrics?.impact?.sum > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={aggregationData.panel_metrics?.impact?.sum}
                      />
                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.sum !== undefined &&
                  aggregationData.panel_metrics?.impact?.sum < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={aggregationData.panel_metrics?.impact?.sum}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.sum !== undefined &&
                aggregationData.panel_metrics?.impact?.sum > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={aggregationData.panel_metrics?.impact?.sum}
                      />

                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.sum !== undefined &&
                  aggregationData.panel_metrics?.impact?.sum < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={aggregationData.panel_metrics?.impact?.sum}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
            {kpiAggregate === 'mean' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.mean !== undefined &&
                aggregationData.panel_metrics?.impact?.mean > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.mean
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.mean !== undefined &&
                  aggregationData.panel_metrics.impact.mean < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.mean
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.mean !== undefined &&
                aggregationData.panel_metrics?.impact?.mean > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.mean
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.mean !== undefined &&
                  aggregationData.panel_metrics.impact.mean < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.mean
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
            {kpiAggregate === 'count' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.count !== undefined &&
                aggregationData.panel_metrics?.impact?.count > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.count
                        ).toFixed(2)}
                      />

                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.count !== undefined &&
                  aggregationData.panel_metrics.impact.count < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.count
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.count !== undefined &&
                aggregationData.panel_metrics?.impact?.count > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.count
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.count !== undefined &&
                  aggregationData.panel_metrics.impact.count < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.count
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
            {kpiAggregate === 'median' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.median !== undefined &&
                aggregationData.panel_metrics?.impact?.median > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.median
                        ).toFixed(2)}
                      />

                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.median !== undefined &&
                  aggregationData.panel_metrics?.impact?.median < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.median
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.median !== undefined &&
                aggregationData.panel_metrics?.impact?.median > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.median
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.median !== undefined &&
                  aggregationData.panel_metrics?.impact?.median < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.median
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
            {kpiAggregate === 'max' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.max !== undefined &&
                aggregationData.panel_metrics?.impact?.max > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.max
                        ).toFixed(2)}
                      />

                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.max !== undefined &&
                  aggregationData.panel_metrics?.impact?.max < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.max
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.max !== undefined &&
                aggregationData.panel_metrics?.impact?.max > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.max
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.max !== undefined &&
                  aggregationData.panel_metrics?.impact?.max < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.max
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
            {kpiAggregate === 'min' ? (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.min !== undefined &&
                aggregationData.panel_metrics.impact.min > 0 ? (
                  <div className="difference-high-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.min
                        ).toFixed(2)}
                      />

                      <img src={Up} alt="Up" />
                    </h5>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.min !== undefined &&
                  aggregationData.panel_metrics?.impact?.min < 0 ? (
                  <div className="difference-low-heading">
                    <h5>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.min
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </h5>
                  </div>
                ) : (
                  <h5> {'-'}</h5>
                )}
              </>
            ) : (
              <>
                {aggregationData &&
                aggregationData.panel_metrics?.impact?.min !== undefined &&
                aggregationData.panel_metrics.impact.min > 0 ? (
                  <div className="difference-high-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.min
                        ).toFixed(2)}
                      />
                      <img src={Up} alt="Up" />
                    </span>
                  </div>
                ) : aggregationData &&
                  aggregationData.panel_metrics?.impact?.min !== undefined &&
                  aggregationData.panel_metrics?.impact?.min < 0 ? (
                  <div className="difference-low-heading">
                    <span>
                      <HumanReadableNumbers
                        number={parseFloat(
                          aggregationData.panel_metrics?.impact?.min
                        ).toFixed(2)}
                      />
                      <img src={Down} alt="Down" />
                    </span>
                  </div>
                ) : (
                  <span> {'-'}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboardgraphcard;
