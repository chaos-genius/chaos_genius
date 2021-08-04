import React from 'react';
import './setupcard.scss';
import DataSource from '../../assets/images/setupcard/data-source.svg';
import DataSourceActive from '../../assets/images/setupcard/data-source.svg';

const SetupCard = ({ heading, description, buttonText, optional, active }) => {
  return (
    <div className={active ? 'setup-card active' : 'setup-card'}>
      <img src={DataSource} className="in-active" alt="DataSource" />
      <img src={DataSourceActive} className="active" alt="DataSourceActive" />
      <h1>{heading}</h1>
      <p>{description}</p>
      <button className="btn black-button" disabled={active ? false : true}>
        <span>{buttonText}</span>
      </button>
      {optional && <label>Optional</label>}
    </div>
  );
};

export default SetupCard;
