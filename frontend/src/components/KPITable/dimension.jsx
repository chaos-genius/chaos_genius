import React, { useState } from 'react';
import Down from '../../assets/images/tipsdown.svg';
import Up from '../../assets/images/tipsup.svg';
import '../../assets/styles/table.scss';

const Dimension = ({ data }) => {
  const [show, setShow] = useState(1);
  return (
    <ul className="table-tips">
      {data &&
        data.length !== 0 &&
        data.slice(0, show).map((dimension, index) => (
          <li key={index}>
            <span>{dimension}</span>
          </li>
        ))}
      {data && data.length !== 0 && data.length > show && (
        <li className="additional-tips" onClick={() => setShow(data.length)}>
          <label>
            +{data.length - 1}
            <img src={Down} alt="Down" />
          </label>
        </li>
      )}
      {show === data.length && data.length !== 1 && (
        <li className="additional-tips" onClick={() => setShow(1)}>
          <span>
            <img src={Up} alt="Up" />
          </span>
        </li>
      )}
    </ul>
  );
};

export default Dimension;
