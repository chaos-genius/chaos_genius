import React, { useEffect, useState } from 'react';

import { Link, useHistory, useParams } from 'react-router-dom';

import Select from 'react-select';
import Search from '../../assets/images/search.svg';
import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import './kpihome.scss';

import Highcharts, { isNumber } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMore from 'highcharts/highcharts-more';
import HumanReadableNumbers from '../HumanReadableNumbers';

import { useDispatch, useSelector } from 'react-redux';
import { getHomeKpi } from '../../redux/actions';
import Fuse from 'fuse.js';
import Noresult from '../Noresult';
import Homefilter from '../Homefilter';

import { formatDateTime, getTimezone } from '../../utils/date-helper';
import { HRNumbers } from '../../utils/Formatting/Numbers/humanReadableNumberFormatter';
import { getDashboard, getTimeCuts } from '../../redux/actions';
import { CustomTooltip } from '../../utils/tooltip-helper';

import store from '../../redux/store';
import { debuncerReturn } from '../../utils/simple-debouncer';

const RESET_ACTION = {
  type: 'RESET_KPI_HOME_DATA'
};

const customStyles = {
  container: (provided) => ({
    ...provided,
    width: 180
  })
};

highchartsMore(Highcharts);
Highcharts.setOptions({
  time: {
    timezone: getTimezone()
  }
});

const Kpihome = () => {
  const dispatch = useDispatch();

  const history = useHistory();

  const [dashboardId, setDashboardId] = useState(useParams()?.id);

  const { homeKpiData, homeKpiLoading } = useSelector(
    (state) => state.onboarding
  );
  const { timeCutsData } = useSelector((state) => state.TimeCuts);

  const { dashboardListLoading, dashboardList } = useSelector((state) => {
    return state.DashboardHome;
  });

  const [search, setSearch] = useState('');
  const [kpiHomeData, setKpiHomeData] = useState(homeKpiData);
  const [kpiHomeloading, setKpiHomeLoading] = useState(homeKpiLoading);
  const [dashboard, setDashboard] = useState();
  const [timeCutOptions, setTimeCutOptions] = useState([]);

  const [timeline, setTimeLine] = useState({});

  useEffect(() => {
    if (dashboardId === undefined) {
      setDashboardId('0');
    }
    history.push(`/${dashboardId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardId]);

  useEffect(() => {
    dispatch(getDashboard());
    dispatch(getTimeCuts());
  }, [dispatch]);

  useEffect(() => {
    if (
      dashboardList &&
      dashboardList.length !== 0 &&
      dashboardId !== undefined
    ) {
      setDashboard(dashboardId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardList]);

  const getAllTimeCutOptions = (data) => {
    let res = [];
    if (data && data.length) {
      for (const dataKey of data) {
        res.push({
          value: `${dataKey?.id}`,
          label: dataKey?.display_name,
          grp2_name: dataKey?.current_period_name,
          grp1_name: dataKey?.last_period_name
        });
      }
    }
    setTimeCutOptions(res);
  };

  useEffect(() => {
    const timeCut = {
      label: timeCutsData[0]?.display_name,
      value: `${timeCutsData[0]?.id}`,
      grp2_name: timeCutsData[0]?.current_period_name,
      grp1_name: timeCutsData[0]?.last_period_name
    };
    if (timeCutsData && timeCutsData.length) {
      setTimeLine(timeCut);
      store.dispatch({ type: 'ACTIVE_TIMECUT', data: timeCut });
      getAllTimeCutOptions(timeCutsData);
    }
  }, [timeCutsData]);

  useEffect(() => {
    if (![null, undefined, ''].includes(dashboard) && timeline.value) {
      getHomeList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard, timeline.value]);

  const getHomeList = () => {
    store.dispatch(RESET_ACTION);
    dispatch(
      getHomeKpi({ timeline: timeline.value, dashboard_id: dashboardId })
    );
  };

  const clearDashboardDetails = () => {
    store.dispatch({
      type: 'RESET_AGGREGATION'
    });
    store.dispatch({
      type: 'RESET_LINECHART'
    });
    store.dispatch({ type: 'RESET_HIERARCHIAL_DATA' });
    store.dispatch({ type: 'RESET_DASHBOARD_RCA' });
  };

  useEffect(() => {
    clearDashboardDetails();
    if (search !== '') {
      searchKpi();
    } else {
      if (homeKpiData !== [] && homeKpiLoading === false) {
        setKpiHomeData(homeKpiData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, homeKpiData]);

  useEffect(() => {
    setKpiHomeLoading(homeKpiLoading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeKpiLoading]);

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
          labels: {
            formatter: function () {
              return HRNumbers.toHumanString(this.value);
            }
          },
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

  const implementSearch = (e) => {
    setSearch(e.target.value);
  };
  const debounce = () => debuncerReturn(implementSearch, 500);

  if (dashboardListLoading) {
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
                onChange={debounce()}
              />
              <span>
                <img src={Search} alt="Search Icon" />
              </span>
            </div>
            <Select
              options={timeCutOptions}
              styles={customStyles}
              classNamePrefix="selectcategory"
              placeholder="Current week on last week"
              value={timeline}
              onChange={(e) => {
                store.dispatch({
                  type: 'ACTIVE_TIMECUT',
                  data: e
                });
                setTimeLine(e);
              }}
              isSearchable={false}
            />
          </div>
        </div>
        <div className="homepage-setup-card-wrapper">
          <div className="explore-wrapper home-explore-wrapper">
            <div className="filter-section">
              {dashboardId !== undefined && (
                <Homefilter
                  data={dashboardList}
                  setDashboard={setDashboard}
                  dashboard={dashboardId}
                  setDashboardId={setDashboardId}
                />
              )}
            </div>
            {!kpiHomeloading ? (
              kpiHomeData && kpiHomeData.length !== 0 ? (
                <div className="graph-section">
                  {kpiHomeData.map((item) => {
                    const changeView =
                      item.change !== undefined && item.change !== null ? (
                        <HumanReadableNumbers number={item.change} />
                      ) : (
                        <span className="empty-data-span">-</span>
                      );
                    const percChangeView =
                      item.percentage_change !== undefined &&
                      item.percentage_change !== null &&
                      isNumber(item.percentage_change) ? (
                        <label
                          className={
                            +item.percentage_change > 0
                              ? 'high-change'
                              : 'low-change'
                          }>
                          {+item.percentage_change > 0 ? (
                            <img src={Up} alt="High" />
                          ) : (
                            <img src={Down} alt="Low" />
                          )}
                          {`${item.percentage_change}%`}
                        </label>
                      ) : (
                        <span className="empty-data-span">-</span>
                      );

                    const fullView =
                      item.change !== undefined &&
                      item.change !== null &&
                      isNumber(item.change) ? (
                        <>
                          {changeView}
                          {percChangeView}
                        </>
                      ) : (
                        <>
                          <span className="empty-data-span">-</span>
                        </>
                      );

                    return (
                      <Link
                        to={`/dashboard/${dashboard}/deepdrills/${item.id}`}
                        key={item.id}>
                        <div className="kpi-card" key={item.id}>
                          <div className="kpi-content kpi-content-label">
                            <h3 className="name-tooltip">
                              {CustomTooltip(item.name, true)}
                            </h3>
                          </div>
                          <div className="kpi-content">
                            <label>{item?.display_value_prev}</label>
                            <HumanReadableNumbers number={item.prev} />
                          </div>
                          <div className="kpi-content kpi-current">
                            <label>{item?.display_value_current}</label>
                            <HumanReadableNumbers number={item.current} />
                          </div>
                          <div className="kpi-content">
                            <label>Change</label>
                            <span>{fullView}</span>
                          </div>

                          <div className=" kpi-content kpi-graph ">
                            {item.graph_data &&
                              item.graph_data.length !== 0 && (
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
                kpiHomeData.length === 0 && (
                  <div className="home-card-section">
                    <div className="no-data-kpihome">
                      <Noresult text={search} title={'KPI'} />
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="home-data-load home-data-loader-page">
                <div className="preload"></div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
};
export default Kpihome;
