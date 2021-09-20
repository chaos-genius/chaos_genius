import React, { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';
import { Range, getTrackBackground } from 'react-range';

import Anomoly from '../../assets/images/alerts/anomoly.svg';
import AnomolyActive from '../../assets/images/alerts/anomoly-active.svg';
//import Static from '../../assets/images/alerts/static.svg';
//import StaticActive from '../../assets/images/alerts/static-active.svg';

import './kpialertconfigurationform.scss';

import { getAllKpiExplorer } from '../../redux/actions';

const alertFrequency = [
  {
    value: 'daily',
    label: 'Daily'
  },
  {
    value: 'hourly',
    label: 'Hourly'
  }
];
const KpiAlertConfigurationForm = ({
  setSteps,
  setAlertFormData,
  alertFormData
}) => {
  const dispatch = useDispatch();
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));
  const [type, setType] = useState('anomoloy');
  const [conditionType, setConditionType] = useState('');
  const [value, setValue] = useState([90]);

  const [option, setOption] = useState([]);

  const onSubmit = () => {
    setSteps(2);
  };

  const { isLoading, kpiExplorerList } = useSelector(
    (state) => state.kpiExplorer
  );

  useEffect(() => {
    dispatchGetAllKpiExplorer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchGetAllKpiExplorer = () => {
    dispatch(getAllKpiExplorer());
  };

  useEffect(() => {
    if (kpiExplorerList) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiExplorerList]);

  const fieldData = () => {
    if (kpiExplorerList && isLoading === false) {
      var optionArr = [];
      kpiExplorerList &&
        kpiExplorerList.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
            datasource_id: data.data_source,
            label: <div className="optionlabel">{datasourceIcon(data)}</div>
          });
          setOption(optionArr);
        });
    }
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
    connectionType &&
      connectionType.find((item) => {
        if (item.name === type.connection_type) {
          textHtml = item.icon;
        }
        return '';
      });
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: textHtml }}
          className="datasource-svgicon"
        />
        {type.name}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="load ">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <div className="form-group">
          <h5>Alert Definition</h5>
        </div>
        <div className="form-group">
          <label>Select KPI*</label>
          <Select
            classNamePrefix="selectcategory"
            placeholder="Select"
            options={option}
            onChange={(e) => {
              setAlertFormData({
                ...alertFormData,
                data_source: e.datasource_id,
                kpi: e.id
              });
              //setAlertFormData({ ...alertFormData, kpi: e.id });
            }}
          />
        </div>
        <div className="form-group">
          <label>Name of your Alert *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter alert name"
            required
            onChange={(e) => {
              setAlertFormData({
                ...alertFormData,
                alert_name: e.target.value
              });
            }}
          />
        </div>
        <div className="form-group">
          <label>Alert Type *</label>
          <div className="alerts-type-container">
            <div
              className={
                type === 'anomoloy' ? 'alerts-type active' : 'alerts-type'
              }
              onClick={() => setType('anomoloy')}>
              <img src={Anomoly} alt="Anomoly" className="alert-image" />
              <img
                src={AnomolyActive}
                alt="Anomoly"
                className="alert-image-active"
              />
              <span>Anomoly</span>
            </div>
            {/* <div
            className={type === 'static' ? 'alerts-type active' : 'alerts-type'}
            onClick={() => setType('static')}>
            <img src={Static} alt="Static" className="alert-image" />
            <img
              src={StaticActive}
              alt="Static"
              className="alert-image-active"
            />
            <span>Static</span>
          </div> */}
          </div>
        </div>
        <div className="form-group">
          <h5>Alert Condition</h5>
        </div>
        {type === 'static' ? (
          <>
            <div className="form-group">
              <label>Name of your Alert *</label>
              <div className="alert-condition">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Spike"
                    name="alert"
                    value="spike"
                    onChange={(e) => {
                      setConditionType(e.target.value);
                    }}
                  />
                  <label
                    className={
                      conditionType === 'spike'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Spike">
                    Spike
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Drop"
                    name="alert"
                    value="drop"
                    onChange={(e) => {
                      setConditionType(e.target.value);
                    }}
                  />
                  <label
                    className={
                      conditionType === 'drop'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Drop">
                    Drop
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="Both"
                    name="alert"
                    value="both"
                    onChange={(e) => setConditionType(e.target.value)}
                  />
                  <label
                    className={
                      conditionType === 'both'
                        ? 'form-check-label active'
                        : 'form-check-label'
                    }
                    for="Both">
                    Both
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Deviation Value *</label>
              <div className="deviation-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Value"
                  required
                />

                <Select
                  classNamePrefix="selectcategory"
                  placeholder="Select Unit"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>Significance Score *</label>
            <div className="score-range">
              <div className="score-card">{value}</div>
              <div className="range-selector">
                <Range
                  values={value}
                  step={1}
                  min={1}
                  max={100}
                  onChange={(values) => {
                    setValue([values]);
                    setAlertFormData({
                      ...alertFormData,
                      severity_cutoff_score: values[0]
                    });
                  }}
                  renderTrack={({ props, children }) => (
                    <div
                      onMouseDown={props.onMouseDown}
                      onTouchStart={props.onTouchStart}
                      style={{
                        ...props.style,
                        display: 'flex',
                        width: '100%'
                      }}>
                      <div
                        ref={props.ref}
                        style={{
                          height: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          background: getTrackBackground({
                            values: value,
                            colors: [
                              ['#60CA9A 0%', '#FAC06B', '#E96560'],
                              '#EFEFEF'
                            ],
                            min: 0,
                            max: 100
                          }),
                          alignSelf: 'center'
                        }}>
                        {children}
                      </div>
                    </div>
                  )}
                  renderThumb={({ props, isDragged }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '18px',
                        width: '18px',
                        borderRadius: '50%',
                        outline: 'none',
                        background: '#FFFFFF',
                        border: '2px solid #60CA9A',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}></div>
                  )}
                />
                <div className="range-category">
                  <span>Low</span> <span>Med</span> <span>High</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="form-group">
          <label>Alert Frequency *</label>
          <Select
            classNamePrefix="selectcategory"
            placeholder="Daily"
            options={alertFrequency}
            onChange={(e) =>
              setAlertFormData({ ...alertFormData, alert_frequency: e.value })
            }
          />
        </div>
        <div className="form-group alert-textarea">
          <label>Message Body *</label>
          <textarea
            placeholder="Enter message here"
            onChange={(e) => {
              setAlertFormData({
                ...alertFormData,
                alert_message: e.target.value
              });
            }}
          />
        </div>
        <div className="form-action ">
          <button className="btn black-button" onClick={() => onSubmit()}>
            <span>Next Step</span>
          </button>
        </div>
      </>
    );
  }
};

export default KpiAlertConfigurationForm;
