import React, { useState, useEffect, useContext } from 'react';

import Select from 'react-select';

import './eventalertform.scss';
import Play from '../../assets/images/play-green.png';

import { connectionContext } from '../context';
import { useDispatch, useSelector } from 'react-redux';
import { getAllKpiExplorerForm, getTestQuery } from '../../redux/actions';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const EventAlertForm = ({ setSteps }) => {
  const dispatch = useDispatch();
  const [setting, setSetting] = useState('');
  const connectionType = useContext(connectionContext);
  const [option, setOption] = useState([]);
  const [datasourceid, setDataSourceId] = useState('');
  const [query, setQuery] = useState('');
  const { kpiFormLoading, kpiFormData } = useSelector(
    (state) => state.kpiExplorer
  );

  const onSubmit = () => {
    setSteps(2);
  };

  useEffect(() => {
    dispatch(getAllKpiExplorerForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (kpiFormData && connectionType) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFormData, connectionType]);

  const fieldData = () => {
    if (kpiFormData && kpiFormLoading === false) {
      var optionArr = [];
      kpiFormData &&
        kpiFormData.data.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
            label: <div className="optionlabel">{datasourceIcon(data)}</div>
          });
          setOption(optionArr);
        });
    }
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
    connectionType &&
      connectionType.length !== 0 &&
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

  const onTestQuery = () => {
    const payload = {
      data_source_id: datasourceid,
      from_query: true,
      query: query
    };
    dispatch(getTestQuery(payload));
  };

  return (
    <>
      <div className="form-group">
        <label>Name Of Your Alert *</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Alert Name"
          required
        />
      </div>
      <div className="form-group">
        <label>Select Data Source*</label>
        <Select
          options={option}
          classNamePrefix="selectcategory"
          placeholder="Select Data Source"
          components={{ SingleValue: customSingleValue }}
          onChange={(e) => {
            setDataSourceId(e.id);
          }}
        />
      </div>
      <div className="form-group query-form">
        <label>Query *</label>
        <textarea
          placeholder="Enter Query"
          onChange={(e) => {
            setQuery(e.target.value);
          }}></textarea>
        <div className="test-query-connection">
          <div className="test-query" onClick={() => onTestQuery()}>
            <span>
              <img src={Play} alt="Play" />
              Test Query
            </span>
          </div>
        </div>
      </div>
      <div className="form-group">
        <label>Alert Frequency *</label>
        <Select classNamePrefix="selectcategory" placeholder="Daily" />
      </div>

      <div className="form-group">
        <label>Alert Settings *</label>
        <div className="alert-setting">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="newentry"
              name="alert"
              value="newentry"
              onChange={(e) => {
                setSetting(e.target.value);
              }}
            />
            <label
              className={
                setting === 'newentry'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="newentry">
              New Entry
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="allchanges"
              name="alert"
              value="allchanges"
              onChange={(e) => {
                setSetting(e.target.value);
              }}
            />
            <label
              className={
                setting === 'allchanges'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="allchanges">
              All Changes
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              id="alwayssend"
              name="alert"
              value="alwayssend"
              onChange={(e) => setSetting(e.target.value)}
            />
            <label
              className={
                setting === 'alwayssend'
                  ? 'form-check-label active'
                  : 'form-check-label'
              }
              for="alwayssend">
              Always Send
            </label>
          </div>
        </div>
      </div>
      <div className="form-group ">
        <label>Message Body *</label>
        <textarea placeholder="Enter Message Here"></textarea>
      </div>
      <div className="form-action">
        <button className="btn black-button" onClick={() => onSubmit()}>
          <span>Next Step</span>
        </button>
      </div>
    </>
  );
};
export default EventAlertForm;
