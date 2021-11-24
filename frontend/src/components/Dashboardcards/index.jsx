import React, { useState } from 'react';

import { useDispatch } from 'react-redux';

import Modal from 'react-modal';

import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';

// import { getDashboardDelete } from '../../redux/actions';

import './dashboardcards.scss';
import { formatDate } from '../../utils/date-helper';

const Dashboardcards = ({ dashboardList }) => {
  // const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState('');

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDelete = (value) => {
    // dispatch(getDashboardDelete(value.id));
  };

  return (
    <>
      <div className="dashboard-card-container">
        {dashboardList &&
          dashboardList.map((dashboard) => {
            return (
              <div className="dashboardcard">
                <div className="header-card">
                  <div className="header-content">
                    <h3>{dashboard.name}</h3>
                    <span>
                      Last modified: {formatDate(dashboard?.last_modified)}
                    </span>
                  </div>
                  <div className="more-dropdown dropstart">
                    <div
                      data-bs-toggle="dropdown"
                      className="dropdown-image"
                      aria-expanded="false"
                      aria-haspopup="true">
                      <img
                        src={More}
                        alt="More"
                        className="moreoption"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title="Actions"
                      />
                      <img
                        src={Moreactive}
                        alt="More"
                        className="moreoption-active"
                        data-bs-toggle="tooltip"
                        data-bs-placement="bottom"
                        title="Actions"
                      />
                    </div>
                    <ul className="dropdown-menu">
                      <li>
                        <img src={Edit} alt="Edit" className="action-disable" />
                        <img
                          src={EditActive}
                          alt="Edit"
                          className="action-active"
                        />
                        Edit
                      </li>
                      <li
                        className="delete-item"
                        onClick={() => {
                          setIsOpen(true);
                          setData(dashboard);
                        }}>
                        <img src={DeleteActive} alt="Delete" />
                        Delete
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="body-card">
                  <div className="body-content">
                    <span>No of KPI’s</span>
                    <h5>{dashboard.kpi_count}</h5>
                  </div>
                  <div className="body-content created-on-content">
                    <span>Created On</span>
                    <h5>{formatDate(dashboard?.created_at)}</h5>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <Modal
        isOpen={isOpen}
        shouldCloseOnOverlayClick={false}
        portalClassName="deletemodal">
        <div className="modal-close">
          <img src={Close} alt="Close" onClick={closeModal} />
        </div>
        <div className="modal-body">
          <div className="modal-contents">
            <h3>Delete {data.name} ?</h3>
            <p>Are you sure you want to delete </p>
            <div className="next-step-navigate">
              <button className="btn white-button" onClick={closeModal}>
                <span>Cancel</span>
              </button>
              <button
                className="btn black-button"
                onClick={() => onDelete(data)}>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default Dashboardcards;
