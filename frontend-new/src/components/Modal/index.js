import React, { useState } from 'react';

import Modal from 'react-modal';

import Close from '../../assets/images/close.svg';
import Success from '../../assets/images/successful.svg';

import './modal.scss';

const ModalPopUp = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          <h3>You have successfully Added a Data Source</h3>
          <p>Next step is to set up KPI definitions.</p>
          <div className="next-step-navigate">
            <button className="btn black-button">
              <span>Add KPI</span>
            </button>
          </div>
          <label>View added data source</label>
        </div>
      </div>
    </Modal>
  );
};
export default ModalPopUp;
