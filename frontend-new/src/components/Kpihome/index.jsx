import React from 'react';

import Select from 'react-select';

import Search from '../../assets/images/search.svg';
import Up from '../../assets/images/up.svg';
// import Down from '../../assets/images/down.svg';

import './kpihome.scss';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

highchartsMore(Highcharts);

const data = [
  {
    value: 'mom',
    label: 'Current Month on Last Month'
  },
  {
    value: 'wow',
    label: 'Current Week on Last Week'
  }
];
const apiData = [
  {
    id: 7,
    name: 'Website Bouncerate',
    metric: 'sessions',
    current: 234,
    prev: 254,
    change: 20,
    anomaly_count: 3,
    graph_data: [
      {
        date: '2021/08/15 00:00:00',
        value: 12100000.0
      },
      {
        date: '2021/08/16 00:00:00',
        value: 6400000.0
      },
      {
        date: '2021/08/17 00:00:00',
        value: 4970000.0
      },
      {
        date: '2021/08/18 00:00:00',
        value: 11450000.0
      },
      {
        date: '2021/08/19 00:00:00',
        value: 12390000.0
      },
      {
        date: '2021/08/20 00:00:00',
        value: 19070000.0
      },
      {
        date: '2021/08/21 00:00:00',
        value: 9820000.0
      },
      {
        date: '2021/08/22 00:00:00',
        value: 4770000.0
      },
      {
        date: '2021/08/23 00:00:00',
        value: 3820000.0
      },
      {
        date: '2021/08/24 00:00:00',
        value: 10310000.0
      },
      {
        date: '2021/08/25 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/26 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/27 00:00:00',
        value: 6480000.0
      },
      {
        date: '2021/08/28 00:00:00',
        value: 2500000.0
      },
      {
        date: '2021/08/29 00:00:00',
        value: 11200000.0
      },
      {
        date: '2021/08/30 00:00:00',
        value: 17850000.0
      },
      {
        date: '2021/08/31 00:00:00',
        value: 10420000.0
      },
      {
        date: '2021/09/01 00:00:00',
        value: 3990000.0
      },
      {
        date: '2021/09/02 00:00:00',
        value: 2490000.0
      },
      {
        date: '2021/09/03 00:00:00',
        value: 4760000.0
      },
      {
        date: '2021/09/04 00:00:00',
        value: 30930000.0
      },
      {
        date: '2021/09/05 00:00:00',
        value: 7500000.0
      },
      {
        date: '2021/09/06 00:00:00',
        value: 23670000.0
      },
      {
        date: '2021/09/07 00:00:00',
        value: 11610000.0
      },
      {
        date: '2021/09/08 00:00:00',
        value: 23970000.0
      },
      {
        date: '2021/09/09 00:00:00',
        value: 12700000.0
      },
      {
        date: '2021/09/10 00:00:00',
        value: 12760000.0
      }
    ]
  },
  {
    id: 8,
    name: 'Website Bouncerate',
    metric: 'sessions',
    current: 234,
    prev: 254,
    change: 20,
    anomaly_count: 3,
    graph_data: [
      {
        date: '2021/08/15 00:00:00',
        value: 12100000.0
      },
      {
        date: '2021/08/16 00:00:00',
        value: 6400000.0
      },
      {
        date: '2021/08/17 00:00:00',
        value: 4970000.0
      },
      {
        date: '2021/08/18 00:00:00',
        value: 11450000.0
      },
      {
        date: '2021/08/19 00:00:00',
        value: 12390000.0
      },
      {
        date: '2021/08/20 00:00:00',
        value: 19070000.0
      },
      {
        date: '2021/08/21 00:00:00',
        value: 9820000.0
      },
      {
        date: '2021/08/22 00:00:00',
        value: 4770000.0
      },
      {
        date: '2021/08/23 00:00:00',
        value: 3820000.0
      },
      {
        date: '2021/08/24 00:00:00',
        value: 10310000.0
      },
      {
        date: '2021/08/25 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/26 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/27 00:00:00',
        value: 6480000.0
      },
      {
        date: '2021/08/28 00:00:00',
        value: 2500000.0
      },
      {
        date: '2021/08/29 00:00:00',
        value: 11200000.0
      },
      {
        date: '2021/08/30 00:00:00',
        value: 17850000.0
      },
      {
        date: '2021/08/31 00:00:00',
        value: 10420000.0
      },
      {
        date: '2021/09/01 00:00:00',
        value: 3990000.0
      },
      {
        date: '2021/09/02 00:00:00',
        value: 2490000.0
      },
      {
        date: '2021/09/03 00:00:00',
        value: 4760000.0
      },
      {
        date: '2021/09/04 00:00:00',
        value: 30930000.0
      },
      {
        date: '2021/09/05 00:00:00',
        value: 7500000.0
      },
      {
        date: '2021/09/06 00:00:00',
        value: 23670000.0
      },
      {
        date: '2021/09/07 00:00:00',
        value: 11610000.0
      },
      {
        date: '2021/09/08 00:00:00',
        value: 23970000.0
      },
      {
        date: '2021/09/09 00:00:00',
        value: 12700000.0
      },
      {
        date: '2021/09/10 00:00:00',
        value: 12760000.0
      }
    ]
  },
  {
    id: 5,
    name: 'Website Bouncerate',
    metric: 'sessions',
    current: 234,
    prev: 254,
    change: 20,
    anomaly_count: 3,
    graph_data: [
      {
        date: '2021/08/15 00:00:00',
        value: 12100000.0
      },
      {
        date: '2021/08/16 00:00:00',
        value: 6400000.0
      },
      {
        date: '2021/08/17 00:00:00',
        value: 4970000.0
      },
      {
        date: '2021/08/18 00:00:00',
        value: 11450000.0
      },
      {
        date: '2021/08/19 00:00:00',
        value: 12390000.0
      },
      {
        date: '2021/08/20 00:00:00',
        value: 19070000.0
      },
      {
        date: '2021/08/21 00:00:00',
        value: 9820000.0
      },
      {
        date: '2021/08/22 00:00:00',
        value: 4770000.0
      },
      {
        date: '2021/08/23 00:00:00',
        value: 3820000.0
      },
      {
        date: '2021/08/24 00:00:00',
        value: 10310000.0
      },
      {
        date: '2021/08/25 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/26 00:00:00',
        value: 0.0
      },
      {
        date: '2021/08/27 00:00:00',
        value: 6480000.0
      },
      {
        date: '2021/08/28 00:00:00',
        value: 2500000.0
      },
      {
        date: '2021/08/29 00:00:00',
        value: 11200000.0
      },
      {
        date: '2021/08/30 00:00:00',
        value: 17850000.0
      },
      {
        date: '2021/08/31 00:00:00',
        value: 10420000.0
      },
      {
        date: '2021/09/01 00:00:00',
        value: 3990000.0
      },
      {
        date: '2021/09/02 00:00:00',
        value: 2490000.0
      },
      {
        date: '2021/09/03 00:00:00',
        value: 4760000.0
      },
      {
        date: '2021/09/04 00:00:00',
        value: 30930000.0
      },
      {
        date: '2021/09/05 00:00:00',
        value: 7500000.0
      },
      {
        date: '2021/09/06 00:00:00',
        value: 23670000.0
      },
      {
        date: '2021/09/07 00:00:00',
        value: 11610000.0
      },
      {
        date: '2021/09/08 00:00:00',
        value: 23970000.0
      },
      {
        date: '2021/09/09 00:00:00',
        value: 12700000.0
      },
      {
        date: '2021/09/10 00:00:00',
        value: 12760000.0
      }
    ]
  }
];

const Kpihome = () => {
  const sparklineGraph = (graphData) => {
    return {
      title: { text: '' },
      xAxis: {
        visible: true,
        type: 'text',
        categories: graphData.map((chart) => chart.value),
        startOnTick: false,
        endOnTick: false,
        gridLineWidth: 0
      },
      yAxis: {
        visible: true,
        type: 'text',
        categories: graphData.map((chart) => chart.date),
        gridLineWidth: 0,
        title: '',
        labels: {
          enabled: true,
          step: 1,
          formatter: function () {
            return Highcharts.dateFormat('%d %b', this.value);
          }
        }
      },
      tooltip: {
        enabled: false
      },
      credits: false,
      series: [
        {
          color: '#60CA9A',
          dashStyle: 'Solid',
          showInLegend: false,
          data: graphData.map((chart) => chart.value),
          marker: {
            radius: 2,
            fillColor: '#E96560',
            states: {
              hover: {
                enabled: false
              }
            }
          }
        }
      ],

      chart: {
        backgroundColor: null,
        borderWidth: 0,
        type: 'line',
        margin: [2, 0, 2, 0],
        width: 200,
        height: 40,
        style: {
          overflow: 'visible'
        },
        skipClone: false
      }
    };
  };

  return (
    <>
      <div className="heading-option">
        <div className="heading-title">
          <h3>My KPIs</h3>
          <p>Lorem ipsum is a dummy text</p>
        </div>
      </div>
      <div className="homepage-setup-card-wrapper">
        <div className="homepage-options">
          <Select
            // value={monthWeek}
            classNamePrefix="selectcategory"
            placeholder="Sort by"
            isSearchable={false}
          />
          <div className="homepage-search-dropdown">
            <div className="form-group icon search-filter">
              <input
                type="text"
                className="form-control h-40"
                placeholder="Search KPI"
              />
              <span>
                <img src={Search} alt="Search Icon" />
              </span>
            </div>
            <Select
              // value={monthWeek}
              options={data}
              classNamePrefix="selectcategory"
              placeholder="Current week on last week"
              isSearchable={false}
            />
          </div>
        </div>
        {apiData.map((item) => {
          return (
            <div className="kpi-card" key={item.id}>
              <div className="kpi-content kpi-content-label">
                <h3>{item.name}</h3>
                <label>(Mins)</label>
              </div>
              <div className="kpi-content">
                <label>This Week</label>
                <span>{item.current}</span>
              </div>
              <div className="kpi-content">
                <label>Previous Week</label>
                <span>{item.prev}</span>
              </div>
              <div className="kpi-content">
                <label>Change</label>
                <span>
                  {item.change}
                  <label className="high-change">
                    <img src={Up} alt="High" />
                    33%
                  </label>
                </span>
              </div>
              <div className="kpi-content">
                <label>Anomalies</label>
                <span>
                  {item.anomaly_count}
                  <label className="anomalies-period">(last week)</label>
                </span>
              </div>
              <div className="kpi-content kpi-graph">
                {/* <img src={Graph} alt="Graph" /> */}
                <HighchartsReact
                  className="sparkline-graph"
                  highcharts={Highcharts}
                  options={sparklineGraph(item.graph_data)}
                />
              </div>
              <div className="kpi-content kpi-details">Details</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Kpihome;
