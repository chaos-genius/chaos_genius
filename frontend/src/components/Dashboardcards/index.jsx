import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import Modal from 'react-modal';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import Close from '../../assets/images/close.svg';

import { getDashboardDelete } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import './dashboardcards.scss';

import { formatDate } from '../../utils/date-helper';

import { useToast } from 'react-toast-wnm';

import { CustomContent, CustomActions } from '../../utils/toast-helper';
import { getLocalStorage } from '../../utils/storage-helper';
import { CustomTooltip } from '../../utils/tooltip-helper';
import store from '../../redux/store';

const Dashboardcards = ({ dashboarddata, setChange }) => {
  const dispatch = useDispatch();
  const limited = getLocalStorage('GlobalSetting');
  const toast = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState('');

  const { dashboardDelete } = useSelector((state) => {
    return state.DashboardHome;
  });

  const closeModal = () => {
    setIsOpen(false);
  };

  const onDelete = (value) => {
    dispatch(getDashboardDelete({ dashboard_id: value.id }));
  };

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  useEffect(() => {
    store.dispatch({ type: 'RESET_DASHBOARD_RCA' });
    store.dispatch({
      type: 'RESET_AGGREGATION'
    });
    store.dispatch({
      type: 'RESET_LINECHART'
    });
    store.dispatch({ type: 'RESET_HIERARCHIAL_DATA' });
    store.dispatch({
      type: 'RESET_DATA'
    });
    store.dispatch({
      type: 'RESET_CONFIG'
    });
  }, []);

  useEffect(() => {
    if (dashboardDelete && dashboardDelete.status === 'success') {
      customToast({
        type: 'success',
        header: 'Dashboard deleted successfully'
      });
      setChange((prev) => !prev);
    } else if (dashboardDelete && dashboardDelete.status === 'failure') {
      customToast({
        type: 'failure',
        header: 'Failed to delete the dashboard',
        description: dashboardDelete.message
      });
    }
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setChange, dashboardDelete]);

  return (
    <>
      <div className="dashboard-card-container">
        {dashboarddata &&
          dashboarddata.length !== 0 &&
          dashboarddata.map((dashboard) => {
            return (
              <Link
                to={`/dashboard/${dashboard.id}/deepdrills/`}
                className="dashboardcard">
                <div>
                  <div className="header-card">
                    <div className="header-content">
                      <h3 className="name-tooltip">
                        {CustomTooltip(dashboard.name)}
                      </h3>
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
                        <Link to={`/dashboard/edit/${dashboard.id}`}>
                          <li>
                            <img
                              src={Edit}
                              alt="Edit"
                              className="action-disable"
                            />
                            <img
                              src={EditActive}
                              alt="Edit"
                              className="action-active"
                            />
                            Edit
                          </li>
                        </Link>

                        {limited?.is_ee && (
                          <Link to="/dashboard">
                            <li
                              className="delete-item"
                              onClick={() => {
                                setIsOpen(true);
                                setData(dashboard);
                              }}>
                              <img src={DeleteActive} alt="Delete" />
                              Delete
                            </li>
                          </Link>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="body-card">
                    <div className="body-content">
                      <span>No of KPIs</span>
                      <h5>{dashboard?.kpis?.length}</h5>
                    </div>
                    <div className="body-content created-on-content">
                      <span>Last modified</span>
                      <h5>{formatDate(dashboard?.last_modified)}</h5>
                    </div>
                  </div>
                </div>
              </Link>
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
