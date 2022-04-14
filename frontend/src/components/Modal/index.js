import React from 'react';

import { useHistory } from 'react-router-dom';

import Modal from 'react-modal';

import Close from '../../assets/images/close.svg';
import Success from '../../assets/images/successful.svg';

import './modal.scss';

import store from '../../redux/store';

const SETTING_RESET = {
  type: 'SETTING_RESET'
};

const RESET_ACTION = {
  type: 'CREATE_RESPONSE_RESET'
};

const KPI_RESET = {
  type: 'KPI_RESET'
};

const DASHBOARD_RESET = {
  type: 'DASHBOARD_RESET'
};
const DASHBOARD_KPILIST_RESET = {
  type: 'DASHBOARD_KPILIST_RESET'
};

const ModalPopUp = ({ isOpen, setIsOpen, text }) => {
  const history = useHistory();

  const path = history.location.pathname.split('/');

  const closeModal = () => {
    setIsOpen(false);
    if (path[1] === 'onboarding' && path[2] === '3') {
      store.dispatch(SETTING_RESET);
      store.dispatch(RESET_ACTION);
      store.dispatch(DASHBOARD_RESET);
      store.dispatch(DASHBOARD_KPILIST_RESET);
    } else {
      store.dispatch(SETTING_RESET);
      store.dispatch(RESET_ACTION);
      store.dispatch(KPI_RESET);
    }
  };

  const onNavigate = () => {
    if (text === 'kpi') {
      store.dispatch(KPI_RESET);
      history.push('/onboarding/3');
    } else if (text === 'datasource') {
      store.dispatch(RESET_ACTION);
      history.push('/onboarding/2');
    } else if (text === 'dashboard') {
      store.dispatch(DASHBOARD_KPILIST_RESET);
      store.dispatch(DASHBOARD_RESET);
      history.push('/onboarding/4');
    } else if (text === 'activateanalytics') {
      store.dispatch(SETTING_RESET);
      history.push('/dashboard/0/deepdrills');
    } else {
      store.dispatch(SETTING_RESET);
      history.push('/dashboard/');
    }
    setIsOpen(false);
  };
  const onViewHandler = () => {
    if (text === 'kpi') {
      store.dispatch(KPI_RESET);
      history.push('/kpiexplorer');
    } else if (text === 'datasource') {
      store.dispatch(RESET_ACTION);
      history.push('/datasource');
    } else if (text === 'dashboard') {
      store.dispatch(DASHBOARD_RESET);
      store.dispatch(DASHBOARD_KPILIST_RESET);
      history.push('/dashboard');
    } else if (text === 'activateanalytics') {
      store.dispatch(SETTING_RESET);
      history.push('/dashboard/');
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
              : text === 'datasource'
              ? 'Added a Data Source'
              : text === 'activateanalytics'
              ? 'Activated Analytics'
              : 'Created a Dashboard'}
          </h3>
          <p>
            {text === 'datasource'
              ? 'Next step is to set up KPI definitions.Please wait for a few minutes for data sync to complete before adding a KPI'
              : text === 'kpi'
              ? 'Next step is to Activate the Analytics.'
              : text === 'activateanalytics'
              ? "Let's check the Dashboard for Analytics."
              : 'Check the Dashboard for Analytics'}
          </p>
          <div className="next-step-navigate">
            <button className="btn black-button" onClick={() => onNavigate()}>
              <span>
                {text === 'kpi'
                  ? 'Activate Analytics'
                  : text === 'datasource'
                  ? 'Add KPI'
                  : text === 'activateanalytics'
                  ? 'Go to Analytics'
                  : 'Go to Dashboard'}
              </span>
            </button>
          </div>
          <div onClick={() => onViewHandler()}>
            <label>
              {text === 'kpi'
                ? "View added KPI's"
                : text === 'datasource'
                ? 'View added data source'
                : text === 'activateanalytics'
                ? 'View Dashboard'
                : 'View Dashboard'}
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalPopUp;
