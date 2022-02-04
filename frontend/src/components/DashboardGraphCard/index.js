import React from 'react';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';
import HumanReadableNumbers from '../HumanReadableNumbers';
import './dashboardgraphcard.scss';
import { formatDateTime } from '../../utils/date-helper';
import { isNumber } from 'highcharts';

const Dashboardgraphcard = ({ aggregationData, monthWeek }) => {
  let aggregationDataMap = [];
  if (
    aggregationData &&
    aggregationData.aggregation &&
    aggregationData.aggregation.length
  ) {
    aggregationDataMap = aggregationData?.aggregation?.map((data) => {
      switch (data.label) {
        case 'perc_change': {
          return {
            label: '% Change',
            value:
              data.value !== undefined &&
              data.value !== null &&
              isNumber(data.value)
                ? `${Math.abs(data?.value)} %`
                : '-',
            textColor:
              data?.value &&
              data?.value !== undefined &&
              data?.value !== null &&
              isNumber(data?.value)
                ? data?.value >= 0
                  ? { indicator: 'Up', color: '#60CA9A' }
                  : { indicator: 'Down', color: '#E96560' }
                : { color: '#222222' },
            format: false,
            borderColor: 'accent-blue',
            hasChangeIndicator:
              data?.value !== undefined &&
              data?.value !== null &&
              isNumber(data?.value)
                ? true
                : false
          };
        }
        case 'difference': {
          return {
            label: 'Difference',
            value:
              data.value !== undefined && data.value !== null
                ? data.value
                : '-',
            textColor: data?.value
              ? data?.value >= 0
                ? { indicator: 'Up', color: '#60CA9A' }
                : { indicator: 'Down', color: '#E96560' }
              : { color: '#222222' },
            format: true,
            borderColor: 'primary-green'
          };
        }
        case 'group1_value': {
          return {
            label: monthWeek?.grp1_name,
            value:
              data.value !== undefined && data.value !== null
                ? data.value
                : '-',
            format: true,
            textColor: { color: '#222222' },
            borderColor: 'main-dark',
            timeCutsDate:
              aggregationData?.timecuts_date &&
              aggregationData?.timecuts_date[0]?.start_date
                ? `(${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[0]?.start_date,
                      true,
                      false,
                      false
                    )
                  } - ${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[0]?.end_date,
                      true,
                      false,
                      false
                    )
                  })`
                : `${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[0]?.end_date,
                      true,
                      false,
                      false
                    )
                  }`
          };
        }
        case 'group2_value': {
          return {
            label: monthWeek?.grp2_name,
            value:
              data.value !== undefined && data.value !== null
                ? data.value
                : '-',
            format: true,
            textColor: { color: '#222222' },
            borderColor: 'main-grey',
            timeCutsDate:
              aggregationData?.timecuts_date &&
              aggregationData?.timecuts_date[1]?.start_date
                ? `(${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[1]?.start_date,
                      true,
                      false,
                      false
                    )
                  } - ${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[1]?.end_date,
                      true,
                      false,
                      false
                    )
                  })`
                : `${
                    aggregationData?.timecuts_date &&
                    formatDateTime(
                      aggregationData?.timecuts_date[1]?.end_date,
                      true,
                      false,
                      false
                    )
                  }`
          };
        }
        default:
          return null;
      }
    });
  }
  const aggregationCards =
    aggregationDataMap && aggregationDataMap.length ? (
      aggregationDataMap.map((data, index) => {
        return (
          <div className="aggregate-card" key={index}>
            <div className={`card-border ${data.borderColor}`}></div>
            <div className="content-container">
              <div className="label-date-container">
                <span className="label-container">{data.label}</span>
                {data.timeCutsDate && (
                  <span className="date-container">{data.timeCutsDate}</span>
                )}
              </div>
              <h5 style={{ color: data.textColor.color }}>
                {data.hasChangeIndicator ? (
                  data.textColor.indicator === 'Up' ? (
                    <img src={Up} alt="Up" />
                  ) : (
                    <img src={Down} alt="Down" />
                  )
                ) : null}
                {data ? (
                  data.format ? (
                    <HumanReadableNumbers is_bold number={data.value} />
                  ) : (
                    data.value
                  )
                ) : (
                  '-'
                )}
              </h5>
            </div>
          </div>
        );
      })
    ) : (
      <div className="aggregate-card">
        <div className="content-container">
          <h5>No Data To Display</h5>
        </div>
      </div>
    );
  return (
    <>
      <div className="aggregate-parent-container">{aggregationCards}</div>
    </>
  );
};
export default Dashboardgraphcard;
