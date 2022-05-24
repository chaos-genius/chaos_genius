import React, { useState } from 'react';
import Down from '../../assets/images/tipsdown.svg';
import Up from '../../assets/images/tipsup.svg';
import '../../assets/styles/table.scss';
import Tooltip from 'react-tooltip-lite';

const Dashboardname = ({ data }) => {
  const [show, setShow] = useState(2);

  return (
    <ul className="table-tips dashboard-tip">
      {data &&
        data.length !== 0 &&
        data.slice(0, show).map((dashboard, index) => (
          <li key={index}>
            <label className="name-tooltip">
              <Tooltip
                className="tooltip-name"
                direction="right"
                content={<span>{dashboard?.name}</span>}>
                {data.length - 1 === index
                  ? dashboard?.name
                  : show > 2
                  ? dashboard?.name.concat('', ',')
                  : show === 2 && show - 1 === index
                  ? dashboard?.name
                  : dashboard?.name.concat('', ',')}
              </Tooltip>
            </label>
          </li>
        ))}

      {data && data.length !== 0 && data.length > show && (
        <li className="additional-tips" onClick={() => setShow(data.length)}>
          <label>
            +{data.length - 2}
            <img src={Down} alt="Down" />
          </label>
        </li>
      )}
      {show === data.length && data.length !== 2 && (
        <li className="additional-tips" onClick={() => setShow(2)}>
          <span>
            <img src={Up} alt="Up" />
          </span>
        </li>
      )}
    </ul>
  );
};

export default Dashboardname;
