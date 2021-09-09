import React, { useState, useEffect } from 'react';

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

import { v4 as uuidv4 } from 'uuid';
import Dimension from './dimension';

import { formatDate } from '../../utils/date-helper';
import { kpiDisable } from '../../redux/actions';

const KPITable = ({ kpiData, kpiLoading, kpiSearch, changeData }) => {
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));

  const dispatch = useDispatch();

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
      changeData((prev) => !prev);
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeData, kpiDisableData]);

  const datasourceIcon = (type) => {
    let textHtml;
    connectionType.find((item) => {
      if (item.name === type) {
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
        <span>{type || '-'}</span>
      </>
    );
  };
  return (
    <table className="table">
      <thead>
        <tr>
          <th>KPI Name</th>
          <th>Dimensions</th>
          <th>Data Source Type</th>
          <th>Created On</th>
          <th>Last Modified</th>

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
                    <td>{kpi.name}</td>
                    <td>
                      {kpi.dimensions.length !== 0 ? (
                        <Dimension data={kpi.dimensions}></Dimension>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className="source-type">
                        {connectionType
                          ? datasourceIcon(kpi.connection_type)
                          : '-'}
                      </div>
                    </td>
                    <td className="date-column-formated">
                      {formatDate(kpi.created_at) || '-'}
                    </td>
                    <td className="date-column-formated">
                      {formatDate(kpi.created_at) || '-'}
                    </td>
                    <td>
                      <div className="dropdown more-dropdown">
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
                        <ul className="dropdown-menu">
                          <Link to={`/kpi/settings/${kpi.id}`}>
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
            ) : (
              <tr className="empty-table">
                <td colSpan={6}>
                  <Noresult text={kpiSearch} title="KPI" />
                </td>
              </tr>
            )}
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
  );
};

export default KPITable;
