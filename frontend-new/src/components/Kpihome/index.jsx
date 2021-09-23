import React, { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';

import Select from 'react-select';

import Search from '../../assets/images/search.svg';
import Up from '../../assets/images/up.svg';

import './kpihome.scss';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';

import { useDispatch, useSelector } from 'react-redux';
import { getHomeKpi } from '../../redux/actions';
import Fuse from 'fuse.js';
import Noresult from '../Noresult';

highchartsMore(Highcharts);

const data = [
  {
    value: 'mom',
    label: 'Current Month on Last Month'
  },
  {
    value: 'wow',
    label: 'Current Week on Last Week'
  },
  {
    value: 'dod',
    label: 'Current Day on Last Day'
  }
];

const Kpihome = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { homeKpiData, homeKpiLoading } = useSelector(
    (state) => state.onboarding
  );
  const [kpiHomeData, setKpiHomeData] = useState([]);
  const [search, setSearch] = useState('');
  const [timeline, setTimeLine] = useState({
    value: 'wow',
    label: 'Current Week on Last Week'
  });

  useEffect(() => {
    dispatch(getHomeKpi({ timeline: timeline.value }));
  }, [dispatch, timeline]);

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

  useEffect(() => {
    if (search !== '') {
      searchKpi();
    } else {
      setKpiHomeData(homeKpiData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, homeKpiData]);

  const searchKpi = () => {
    if (search !== '') {
      const options = {
        keys: ['name']
      };

      const fuse = new Fuse(homeKpiData, options);

      const result = fuse.search(search);
      setKpiHomeData(
        result.map((item) => {
          return item.item;
        })
      );
    } else {
      setKpiHomeData(homeKpiData);
    }
  };

  if (homeKpiLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="heading-option">
          <div className="heading-title">
            <h3>My KPIs</h3>
            {/* <p>Lorem ipsum is a dummy text</p> */}
          </div>
        </div>
        <div className="homepage-setup-card-wrapper">
          <div className="homepage-options">
            {/* <Select
              classNamePrefix="selectcategory"
              placeholder="Sort by"
              isSearchable={false}
            /> */}
            <div></div>
            <div className="homepage-search-dropdown">
              <div className="form-group icon search-filter">
                <input
                  type="text"
                  className="form-control h-40"
                  placeholder="Search KPI"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span>
                  <img src={Search} alt="Search Icon" />
                </span>
              </div>
              <Select
                options={data}
                classNamePrefix="selectcategory"
                placeholder="Current week on last week"
                value={timeline}
                onChange={(e) => setTimeLine(e)}
                isSearchable={false}
              />
            </div>
          </div>

          {kpiHomeData && kpiHomeData.length !== 0 ? (
            <>
              {kpiHomeData.map((item) => {
                return (
                  <div className="kpi-card" key={item.id}>
                    <div className="kpi-content kpi-content-label">
                      <h3>{item.name}</h3>
                      <label>{item.metric}</label>
                    </div>
                    <div className="kpi-content">
                      <label>
                        {timeline.value === 'wow'
                          ? 'This Week'
                          : timeline.value === 'mom'
                          ? 'This Month'
                          : 'This Day'}
                      </label>
                      <span>{item.current}</span>
                    </div>
                    <div className="kpi-content">
                      <label>
                        {timeline.value === 'wow'
                          ? 'Previous Week'
                          : timeline.value === 'mom'
                          ? 'Previous Month'
                          : 'Previous Day'}
                      </label>
                      <span>{item.prev}</span>
                    </div>
                    <div className="kpi-content">
                      <label>Change</label>
                      <span>
                        {item.change}
                        <label className="high-change">
                          <img src={Up} alt="High" />
                          {item.percentage_change}
                        </label>
                      </span>
                    </div>
                    <div className="kpi-content">
                      <label>Anomalies</label>
                      <span>
                        {item.anomaly_count}
                        <label className="anomalies-period">
                          {' '}
                          {timeline.value === 'wow'
                            ? '(last week)'
                            : timeline.value === 'mom'
                            ? '(last month)'
                            : ' (last day)'}{' '}
                        </label>
                      </span>
                    </div>
                    <div className="kpi-content kpi-graph">
                      {item.graph_data && item.graph_data.length !== 0 && (
                        <HighchartsReact
                          className="sparkline-graph"
                          highcharts={Highcharts}
                          options={sparklineGraph(item.graph_data)}
                        />
                      )}
                    </div>
                    <div
                      className="kpi-content kpi-details"
                      onClick={() =>
                        history.push(`/dashboard/autorca/${item.id}`)
                      }>
                      Details
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="no-data-kpihome">
              <Noresult text={search} title={'KPI'} />
            </div>
          )}
        </div>
      </>
    );
  }
};
export default Kpihome;
