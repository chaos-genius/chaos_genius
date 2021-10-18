import React, { useState, useEffect } from 'react';

import Select from 'react-select';

import { useHistory, Link } from 'react-router-dom';

import Slack from '../../assets/images/table/slack.svg';
import Email from '../../assets/images/alerts/email.svg';
//import Edit from '../../assets/images/disable-edit.svg';

import './eventalertdestinationform.scss';

import { getChannelStatus } from '../../redux/actions';

import ReactTagInput from '@pathofdev/react-tag-input';
import '@pathofdev/react-tag-input/build/index.css';
import { useDispatch, useSelector } from 'react-redux';

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const getOption = (channel) => {
  return {
    label: (
      <div className="optionlabel">
        <img src={channel === 'email' ? Email : Slack} alt="datasource" />
        {channel}
      </div>
    ),
    value: channel
  };
};

const EventAlertDestinationForm = ({ setEventSteps }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const path = history.location.pathname.split('/');

  const [resp, setresp] = useState([]);
  const [option, setOption] = useState([]);
  const [field, setField] = useState('email');
  const [channelName, setChannelName] = useState('');

  const { channelStatusData } = useSelector((state) => {
    return state.alert;
  });

  const onBack = () => {
    setEventSteps(1);
  };

  useEffect(() => {
    dispatch(getChannelStatus());
  }, [dispatch]);

  useEffect(() => {
    if (channelStatusData && channelStatusData.length !== 0) {
      setOption(
        channelStatusData.map((channel) => {
          return getOption(channel.name);
        })
      );
    }
    channelStatusData.forEach((data) => {
      if (data.name === 'slack') {
        setChannelName(data?.config_setting.channel_name || '');
      }
    });
  }, [channelStatusData]);

  const handleChange = (tags) => {
    if (field === 'email') {
      setresp(tags);
    }
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; //eslint-disable-line
    return re.test(String(email).toLowerCase());
  };

  return (
    <>
      <div className="form-group">
        <h5>Alert Destination</h5>
      </div>
      <div className="form-group">
        <label>Select Channel *</label>
        <div className="editable-field">
          <Select
            options={option}
            classNamePrefix="selectcategory"
            placeholder="Select"
            components={{ SingleValue: customSingleValue }}
            onChange={(e) => {
              setField(e.value);
            }}
          />
        </div>
        <div className="channel-tip">
          <p>
            Tip: Go to{' '}
            <Link to="/alerts/channelconfiguration">Channel configuration</Link>{' '}
            to connect channel
          </p>
        </div>
      </div>
      {field === 'email' ? (
        <div className="form-group">
          <label>Add Recepients </label>
          <div className="editable-field">
            <ReactTagInput
              tags={resp}
              placeholder="Add Recepients"
              onChange={(newTags) => handleChange(newTags, 'email')}
              validator={(value) => {
                const isEmail = validateEmail(value);
                if (!isEmail) {
                }
                // Return boolean to indicate validity
                return isEmail;
              }}
            />
          </div>
        </div>
      ) : field === 'slack' ? (
        <div className="form-group">
          <label>Channel name</label>
          <div className="editable-field">
            <input
              type="text"
              className="form-control"
              placeholder="Channel Name"
              disabled={true}
              value={channelName}
            />
          </div>
        </div>
      ) : (
        ''
      )}
      {/* commented add another channel*/}
      {/*Add empty space div*/}
      <div className="add-options-wrapper options-spacing"></div>
      <div className="form-action alerts-button">
        <button className="btn white-button" onClick={() => onBack()}>
          <span>Back</span>
        </button>
        <button className="btn black-button">
          <div className="btn-spinner">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading...</span>
          </div>
          <div className="btn-content">
            <span>{path[2] === 'edit' ? 'Save changes' : 'Add Alert'} </span>
          </div>
        </button>
      </div>
    </>
  );
};

export default EventAlertDestinationForm;
