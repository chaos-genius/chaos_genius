import React from 'react';

import { Link, useHistory } from 'react-router-dom';

import Modal from 'react-modal';

import Close from '../../assets/images/close.svg';
import Success from '../../assets/images/successful.svg';

import './modal.scss';

import store from '../../redux/store';

const SETTING_RESET = {
  type: 'SETTING_RESET'
};

const ModalPopUp = ({ isOpen, setIsOpen, text }) => {
  const location = useHistory().location.pathname.split('/');

  const closeModal = () => {
    setIsOpen(false);
    if (location[1] === 'onboarding' && location[2] === '3') {
      store.dispatch(SETTING_RESET);
    }
  };

  return (
    <Modal isOpen={isOpen} shouldCloseOnOverlayClick={false}>
      <div className="modal-close" onClick={closeModal}>
        <img src={Close} alt="Close" />
      </div>
      <div className="modal-body">
        <div className="modal-success-image">
          <img src={Success} alt="Success" />
        </div>
        <div className="modal-contents">
          <h3>
            You have successfully{' '}
            {text === 'kpi'
              ? 'Added a KPI'
              : text === ' datasource'
              ? 'Added a Data Source'
              : text === 'activateanalytics'
              ? 'Added a Activate Analytics'
              : 'created a Dashboard'}
          </h3>
          <p>
            {text === 'kpi'
              ? 'Next step is to create dashboards for monitoring.'
              : text === 'datasource'
              ? 'Next step is to set up KPI definitions.'
              : text === 'activateanalytics'
              ? 'Next step is to create dashboards for monitoring.'
              : 'Next step is to Activate the Analytics'}
          </p>
          <div className="next-step-navigate">
            <button className="btn black-button">
              <span>
                {text === 'kpi'
                  ? ' Add Activate Analytics'
                  : text === 'datasource'
                  ? 'Add KPI'
                  : text === 'activateanalytics'
                  ? 'Create Dashboard'
                  : ''}
              </span>
            </button>
          </div>
          <Link
            to={
              text === 'kpi'
                ? '/kpiexplorer'
                : text === 'datasource'
                ? '/datasource'
                : ''
            }>
            <label>
              {text === 'kpi'
                ? 'View added KPI’s'
                : text === 'datasource'
                ? 'View added data source'
                : text === 'activateanalytics'
                ? 'View Activate Analytics'
                : 'View created dashboard'}
            </label>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
export default ModalPopUp;
