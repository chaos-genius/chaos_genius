import React, { useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import './dashboardgraphcard.scss';

import { getDashboardAggregation } from '../../redux/actions';

const Dashboardgraphcard = ({ kpi, data }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    getAllAggregationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, kpi]);

  const getAllAggregationData = () => {
    dispatch(getDashboardAggregation(kpi, { timeline: data }));
  };

  const { aggregationLoading, aggregationData } = useSelector(
    (state) => state.aggregation
  );

  if (aggregationLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  } else {
    return (
      <div className="graph-custom-card-container">
        <div className="graph-custom-card-titles">
          <div className="graph-titles">
            <p>Mean</p>
            <p>Median</p>
            <p>Max</p>
            <p>Min</p>
          </div>
        </div>
        <div className="graph-custom-card">
          <label>Last Month</label>

          <div className="grey-card">
            <h5>
              {aggregationData && aggregationData.panel_metrics.grp1_metrics.sum
                ? aggregationData.panel_metrics.grp1_metrics.sum
                : '-'}
            </h5>
            <span>
              {aggregationData &&
              aggregationData.panel_metrics.grp1_metrics.mean
                ? parseFloat(
                    aggregationData.panel_metrics.grp1_metrics.mean
                  ).toFixed(2)
                : '-'}
            </span>
            <span>
              {aggregationData &&
              aggregationData.panel_metrics.grp1_metrics.median
                ? parseFloat(
                    aggregationData.panel_metrics.grp1_metrics.median
                  ).toFixed(2)
                : '-'}
            </span>
            <span>
              {aggregationData && aggregationData.panel_metrics.grp1_metrics.max
                ? parseFloat(
                    aggregationData.panel_metrics.grp1_metrics.max
                  ).toFixed(2)
                : '-'}
            </span>
            <span>
              {aggregationData && aggregationData.panel_metrics.grp1_metrics.min
                ? parseFloat(
                    aggregationData.panel_metrics.grp1_metrics.min
                  ).toFixed(2)
                : '-'}
            </span>
          </div>
        </div>
        <div className="graph-custom-card">
          <label>This Month</label>
          <div className="white-card">
            <h5>
              {aggregationData && aggregationData.panel_metrics.grp2_metrics.sum
                ? aggregationData.panel_metrics.grp2_metrics.sum
                : '-'}
            </h5>
            <span>
              {aggregationData &&
              aggregationData.panel_metrics.grp2_metrics.mean
                ? parseFloat(
                    aggregationData.panel_metrics.grp2_metrics.mean
                  ).toFixed(2)
                : '-'}
            </span>{' '}
            <span>
              {aggregationData &&
              aggregationData.panel_metrics.grp2_metrics.median
                ? parseFloat(
                    aggregationData.panel_metrics.grp2_metrics.median
                  ).toFixed(2)
                : '-'}
            </span>{' '}
            <span>
              {aggregationData && aggregationData.panel_metrics.grp2_metrics.max
                ? parseFloat(
                    aggregationData.panel_metrics.grp2_metrics.max
                  ).toFixed(2)
                : '-'}
            </span>
            <span>
              {aggregationData && aggregationData.panel_metrics.grp2_metrics.min
                ? parseFloat(
                    aggregationData.panel_metrics.grp2_metrics.min
                  ).toFixed(2)
                : '-'}
            </span>
          </div>
        </div>
        <div className="graph-custom-card">
          <label>Difference</label>
          <div className="white-card">
            {aggregationData && aggregationData.panel_metrics.impact.sum > 0 ? (
              <div className="difference-high-heading">
                <h5>
                  {aggregationData.panel_metrics.impact.sum}
                  <img src={Up} alt="Up" />
                </h5>
              </div>
            ) : aggregationData &&
              aggregationData.panel_metrics.impact.sum < 0 ? (
              <div className="difference-low-heading">
                <h5>
                  {aggregationData.panel_metrics.impact.sum}
                  <img src={Down} alt="Down" />
                </h5>
              </div>
            ) : (
              <span> {'-'}</span>
            )}
            {aggregationData &&
            aggregationData.panel_metrics.impact.mean > 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(
                    aggregationData.panel_metrics.impact.mean
                  ).toFixed(2)}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : aggregationData &&
              aggregationData.panel_metrics.impact.mean < 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(
                    aggregationData.panel_metrics.impact.mean
                  ).toFixed(2)}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : (
              <span> {'-'}</span>
            )}
            {aggregationData &&
            aggregationData.panel_metrics.impact.median > 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(
                    aggregationData.panel_metrics.impact.median
                  ).toFixed(2)}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : aggregationData &&
              aggregationData.panel_metrics.impact.median < 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(
                    aggregationData.panel_metrics.impact.median
                  ).toFixed(2)}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : (
              <span> {'-'}</span>
            )}
            {aggregationData && aggregationData.panel_metrics.impact.max > 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(aggregationData.panel_metrics.impact.max).toFixed(
                    2
                  )}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : aggregationData &&
              aggregationData.panel_metrics.impact.max < 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(aggregationData.panel_metrics.impact.max).toFixed(
                    2
                  )}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : (
              <span> {'-'}</span>
            )}

            {aggregationData && aggregationData.panel_metrics.impact.min > 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(aggregationData.panel_metrics.impact.min).toFixed(
                    2
                  )}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : aggregationData &&
              aggregationData.panel_metrics.impact.min < 0 ? (
              <div className="difference-low-item">
                <span>
                  {parseFloat(aggregationData.panel_metrics.impact.min).toFixed(
                    2
                  )}
                  <img src={Down} alt="Down" />
                </span>
              </div>
            ) : (
              <span> {'-'}</span>
            )}
          </div>
        </div>
      </div>
    );
  }
};
export default Dashboardgraphcard;
