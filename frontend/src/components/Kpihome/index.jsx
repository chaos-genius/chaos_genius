import React, { useEffect, useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import Select from 'react-select';
import Search from '../../assets/images/search.svg';
import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import './kpihome.scss';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';
import HumanReadableNumbers from '../HumanReadableNumbers';

import { useDispatch, useSelector } from 'react-redux';
import { getHomeKpi } from '../../redux/actions';
import Fuse from 'fuse.js';
import Noresult from '../Noresult';
import Homefilter from '../Homefilter';

import { formatDateTime, getTimezone } from '../../utils/date-helper';
import { getDashboard } from '../../redux/actions';
import { CustomTooltip } from '../../utils/tooltip-helper';

import store from '../../redux/store';

const RESET_ACTION = {
  type: 'RESET_KPI_HOME_DATA'
};

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  }
});

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

  const { dashboardListLoading, dashboardList } = useSelector((state) => {
    return state.DashboardHome;
  });

  const [search, setSearch] = useState('');
  const [kpiHomeData, setKpiHomeData] = useState(homeKpiData);
  const [dashboard, setDashboard] = useState(dashboardList[0]?.id);

  const [timeline, setTimeLine] = useState({
    value: 'mom',
    label: 'Current Month on Last Month'
  });

  useEffect(() => {
    store.dispatch(RESET_ACTION);
    dispatch(getDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (dashboardList && dashboardList.length !== 0) {
      setDashboard(dashboardList[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardList]);

  useEffect(() => {
    if (![null, undefined, ''].includes(dashboard)) {
      getHomeList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard, timeline]);

  const getHomeList = () => {
    store.dispatch(RESET_ACTION);
    dispatch(getHomeKpi({ timeline: timeline.value, dashboard_id: dashboard }));
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

  const lineChart = (line) => {
    if (line) {
      let demoChart = {
        chart: {
          backgroundColor: null,
          borderWidth: 0,
          type: 'line',
          margin: [2, 0, 2, 0],
          width: 200,
          height: 50,
          style: {
            overflow: 'visible'
          },
          skipClone: false
        },

        xAxis: {
          type: 'datetime',
          gridLineWidth: 0,

          categories: line.map((data) => formatDateTime(data.date)),
          labels: {
            enabled: false,
            step: 0,
            formatter: function () {
              return Highcharts.dateFormat('%d %b', this.value);
            }
          }
        },
        title: {
          text: ''
        },
        yAxis: {
          step: 1,
          title: '',
          gridLineWidth: 0,
          lineWidth: 1
        },
        plotOptions: {
          line: {
            marker: {
              enabled: false
            }
          }
        },
        legend: {
          enabled: false
        },
        tooltip: {
          enabled: false
        },
        series: [
          {
            color: '#60ca9a',
            data: line.map((linedata) => linedata.value),
            marker: {
              radius: 0,
              states: {
                hover: {
                  enabled: false
                }
              }
            }
          }
        ]
      };
      return demoChart;
    }
  };

  if (homeKpiLoading || dashboardListLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="heading-option kpihome-heading">
          <div className="heading-title">
            <h3>My KPIs</h3>
          </div>
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
        <div className="homepage-setup-card-wrapper">
          <div className="explore-wrapper home-explore-wrapper">
            <div className="filter-section">
              <Homefilter
                data={dashboardList}
                setDashboard={setDashboard}
                dashboard={dashboard}
              />
            </div>
            {kpiHomeData && kpiHomeData.length !== 0 ? (
              <div className="graph-section">
                {kpiHomeData.map((item) => {
                  return (
                    <Link to={`/dashboard/${dashboard}/deepdrills/${item.id}`}>
                      <div className="kpi-card" key={item.id}>
                        <div className="kpi-content kpi-content-label">
                          <h3 className="name-tooltip">
                            {CustomTooltip(item.name, true)}
                          </h3>
                        </div>
                        <div className="kpi-content kpi-current">
                          <label>
                            {timeline.value === 'wow'
                              ? 'This Week'
                              : timeline.value === 'mom'
                              ? 'This Month'
                              : 'This Day'}
                          </label>
                          <HumanReadableNumbers number={item.current} />
                        </div>
                        <div className="kpi-content">
                          <label>
                            {timeline.value === 'wow'
                              ? 'Previous Week'
                              : timeline.value === 'mom'
                              ? 'Previous Month'
                              : 'Previous Day'}
                          </label>
                          <HumanReadableNumbers number={item.prev} />
                        </div>
                        <div className="kpi-content">
                          <label>Change</label>
                          <span>
                            {item.percentage_change !== '--' && (
                              <>
                                <HumanReadableNumbers number={item.change} />
                                <label
                                  className={
                                    item.percentage_change > 0
                                      ? 'high-change'
                                      : 'low-change'
                                  }>
                                  {item.percentage_change > 0 ? (
                                    <img src={Up} alt="High" />
                                  ) : (
                                    <img src={Down} alt="Low" />
                                  )}
                                  {item.percentage_change}
                                  {item.percentage_change !== '--' ? '%' : ''}
                                </label>
                              </>
                            )}
                            {item.percentage_change === '--' && <>-</>}
                          </span>
                        </div>

                        <div className=" kpi-content kpi-graph ">
                          {item.graph_data && item.graph_data.length !== 0 && (
                            <HighchartsReact
                              className="sparkline-graph"
                              highcharts={Highcharts}
                              options={lineChart(item.graph_data)}
                            />
                          )}
                        </div>
                        <div
                          className="kpi-content kpi-details"
                          onClick={() =>
                            history.push(
                              `/dashboard/${dashboard}/deepdrills/${item.id}`
                            )
                          }>
                          Details
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              kpiHomeData !== '' && (
                <div className="home-card-section">
                  <div className="no-data-kpihome">
                    <Noresult text={search} title={'KPI'} />
                  </div>
                </div>
              )
            )}{' '}
          </div>
        </div>
      </>
    );
  }
};
export default Kpihome;
