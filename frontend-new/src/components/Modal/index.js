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

const ModalPopUp = ({ isOpen, setIsOpen, text }) => {
  const history = useHistory();

  const closeModal = () => {
    setIsOpen(false);
    store.dispatch(SETTING_RESET);
    store.dispatch(RESET_ACTION);
    store.dispatch(KPI_RESET);
  };

  const onNavigate = () => {
    if (text === 'kpi') {
      store.dispatch(KPI_RESET);
      history.push('/onboarding/3');
    } else if (text === 'datasource') {
      store.dispatch(RESET_ACTION);
      history.push('/onboarding/2');
    } else {
      store.dispatch(SETTING_RESET);
      history.push('/dashboard/autorca');
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
    } else if (text === 'activateanalytics') {
      store.dispatch(SETTING_RESET);
      history.push('/dashboard/autorca');
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
            <button className="btn black-button" onClick={() => onNavigate()}>
              <span>
                {text === 'kpi'
                  ? ' Add Activate Analytics'
                  : text === 'datasource'
                  ? 'Add KPI'
                  : text === 'activateanalytics'
                  ? 'Go to Dashboard'
                  : 'Go to Dashboard'}
              </span>
            </button>
          </div>
          <div onClick={() => onViewHandler()}>
            <label>
              {text === 'kpi'
                ? 'View added KPI’s'
                : text === 'datasource'
                ? 'View added data source'
                : text === 'activateanalytics'
                ? 'View Activate Analytics'
                : 'View created dashboard'}
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default ModalPopUp;
