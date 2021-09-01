import React from 'react';

import { Link } from 'react-router-dom';

import Edit from '../../assets/images/edit.svg';
import EditActive from '../../assets/images/datasourceedit-active.svg';
import DeleteActive from '../../assets/images/delete-active.svg';
import More from '../../assets/images/more.svg';
import Moreactive from '../../assets/images/more-active.svg';
import Noresult from '../Noresult';
import Setting from '../../assets/images/table/setting.svg';
import Settingactive from '../../assets/images/table/setting-active.svg';

import '../../assets/styles/table.scss';

import { v4 as uuidv4 } from 'uuid';
import Dimension from './dimension';

import { formatDate } from '../../utils/date-helper';

const KPITable = ({ kpiData, kpiSearch }) => {
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));

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
                    {connectionType ? datasourceIcon(kpi.connection_type) : '-'}
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
                      <Link to="/datasource/edit">
                        <li>
                          <img
                            src={Setting}
                            alt="Edit"
                            className="action-disable"
                          />
                          <img
                            src={Settingactive}
                            alt="Edit"
                            className="action-active"
                          />
                          Configure Analytics
                        </li>
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
                          // setIsOpen(true);
                          // setData(datasource);
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
              <Noresult text={kpiSearch} />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default KPITable;
