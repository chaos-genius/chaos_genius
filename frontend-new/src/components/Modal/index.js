import React from 'react';

import { Link } from 'react-router-dom';

import Modal from 'react-modal';

import Close from '../../assets/images/close.svg';
import Success from '../../assets/images/successful.svg';

import './modal.scss';

const ModalPopUp = ({ isOpen, setIsOpen, text }) => {
  // const [isOpen, setIsOpen] = useState(false);
  const closeModal = () => {
    setIsOpen(false);
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
              : 'created a Dashboard'}
          </h3>
          <p>
            {text === 'kpi'
              ? 'Next step is to create dashbaords for monitoring.'
              : text === 'datasource'
              ? 'Next step is to set up KPI definitions.'
              : 'Next step is to Activate the Analytics'}
          </p>
          <div className="next-step-navigate">
            <button className="btn black-button">
              <span>
                {text === 'kpi'
                  ? 'Create Dashboard'
                  : text === 'datasource'
                  ? 'Add KPI'
                  : 'Activate Analytics'}
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
                : 'View created dashboard'}
            </label>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
export default ModalPopUp;
