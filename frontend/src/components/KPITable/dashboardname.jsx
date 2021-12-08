import React, { useState } from 'react';
import Down from '../../assets/images/tipsdown.svg';
import Up from '../../assets/images/tipsup.svg';
import '../../assets/styles/table.scss';

const Dashboardname = ({ data }) => {
  const [show, setShow] = useState(1);

  return (
    <ul className="table-tips dashboard-tip">
      {data &&
        Object.keys(data).length !== 0 &&
        Object.entries(data)
          .slice(0, show)
          .map((dashboard, index) => (
            <li>
              <label>
                {Object.keys(data).length - 1 === index
                  ? dashboard[1]
                  : show > 1
                  ? dashboard[1].concat('', ',')
                  : dashboard[1]}
                {/* {show !== 1 && ','} */}
              </label>
            </li>
          ))}

      {data &&
        Object.keys(data).length !== 0 &&
        Object.keys(data).length > show && (
          <li
            className="additional-tips"
            onClick={() => setShow(Object.keys(data).length)}>
            <label>
              +{Object.keys(data).length - 1}
              <img src={Down} alt="Down" />
            </label>
          </li>
        )}
      {show === Object.keys(data).length && Object.keys(data).length !== 1 && (
        <li className="additional-tips" onClick={() => setShow(1)}>
          <span>
            <img src={Up} alt="Up" />
          </span>
        </li>
      )}
    </ul>
  );
};

export default Dashboardname;
