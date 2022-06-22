import React, { useState, useEffect, useContext } from 'react';

import { Link } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Noresult from '../Noresult';
import Setting from '../../assets/images/table/setting.svg';
import Settingactive from '../../assets/images/table/setting-active.svg';
import Modal from 'react-modal';
import Close from '../../assets/images/close.svg';

import '../../assets/styles/table.scss';

import Dashboardname from './dashboardname';

import { v4 as uuidv4 } from 'uuid';
import Dimension from './dimension';

import { formatDateTime } from '../../utils/date-helper';
import { kpiDisable } from '../../redux/actions';

import { useToast } from 'react-toast-wnm';

import { CustomContent, CustomActions } from '../../utils/toast-helper';
import { connectionContext } from '../context';
import { CustomTooltip } from '../../utils/tooltip-helper';
import Pagination from '../Pagination';

const KPITable = ({
  kpiData,
  kpiLoading,
  kpiSearch,
  changeData,
  pagination,
  pgInfo,
  setPgInfo
}) => {
  const connectionType = useContext(connectionContext);

  const dispatch = useDispatch();

  const toast = useToast();

  const [data, setData] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { kpiDisableData } = useSelector((state) => state.kpiExplorer);
  const closeModal = () => {
    setIsOpen(false);
  };

  const onDelete = (kpi) => {
    dispatch(kpiDisable(kpi.id));
  };

  useEffect(() => {
    if (kpiDisableData && kpiDisableData.status === 'success') {
      customToast({
        type: 'success',
        header: 'KPI deleted successfully',
        description: kpiDisableData.message
      });
      changeData((prev) => !prev);
    } else if (kpiDisableData && kpiDisableData.status === 'failed') {
      customToast({
        type: 'error',
        header: 'Failed to Delete',
        description: kpiDisableData.message
      });
    }
    setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeData, kpiDisableData]);

  const datasourceIcon = (type) => {
    let textHtml;
    connectionType.find((item) => {
      if (item.name === type.data_source.connection_type) {
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
        <span>{type?.data_source?.name || '-'}</span>
      </>
    );
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

  const handleBtnClick = (e) => {
    window.scrollTo({ top: 0 });
    setPgInfo({ ...pgInfo, page: e });
  };

  const handleSelectClick = (e) => {
    window.scrollTo({ top: 0 });
    setPgInfo({ ...pgInfo, page: 1, per_page: e.target.value });
  };

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>KPI Name</th>
            <th>Dashboard Name</th>
            <th>Dimensions</th>
            <th>Data Source Name</th>
            <th>Created On</th>
            {/* <th>Last Modified</th> */}

            <th></th>
          </tr>
        </thead>
        <tbody>
          {kpiLoading ? (
            <tr className="table-loader">
              <td colSpan={6}>
                <div className="load">
                  <div className="preload"></div>
                </div>
              </td>
            </tr>
          ) : (
            <>
              {kpiData && kpiData.length !== 0 ? (
                kpiData.map((kpi) => {
                  return (
                    <tr key={uuidv4()}>
                      <td className="name-tooltip">
                        <span>{CustomTooltip(kpi.name)}</span>
                      </td>
                      <td>
                        {kpi?.dashboards.length !== 0 ? (
                          <Dashboardname data={kpi?.dashboards} />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {kpi.dimensions.length !== 0 ? (
                          <Dimension data={kpi.dimensions}></Dimension>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="source-type">
                          {connectionType ? datasourceIcon(kpi) : '-'}
                        </div>
                      </td>
                      <td className="date-column-formated">
                        {formatDateTime(kpi.created_at, true) || '-'}
                      </td>
                      <td>
                        <div className={' more-dropdown dropdown'}>
                          <div
                            data-bs-toggle="dropdown"
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
                          <ul className="dropdown-menu ">
                            <Link
                              to={`/dashboard/${kpi?.dashboards[0]?.id}/settings/${kpi.id}`}>
                              <li>
                                <img
                                  src={Setting}
                                  alt="Configure Analytics"
                                  className="action-disable"
                                />
                                <img
                                  src={Settingactive}
                                  alt="Configure Analytics"
                                  className="action-active"
                                />
                                Configure Analytics
                              </li>
                            </Link>
                            <Link to={`/kpiexplorer/edit/${kpi.id}`}>
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
                            <li
                              className="delete-item"
                              onClick={() => {
                                setIsOpen(true);
                                setData(kpi);
                              }}>
                              <img src={DeleteActive} alt="Delete" />
                              Delete
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : kpiData && kpiData !== '' ? (
                <tr className="empty-table">
                  <td colSpan={6}>
                    <Noresult text={kpiSearch} title="KPI" />
                  </td>
                </tr>
              ) : null}
            </>
          )}
        </tbody>

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
      </table>
      {pagination && kpiData && kpiData.length !== 0 && (
        <Pagination
          handleBtnClick={handleBtnClick}
          pagination={pagination}
          pgInfo={pgInfo}
          handleSelectClick={handleSelectClick}
        />
      )}
    </>
  );
};

export default KPITable;
