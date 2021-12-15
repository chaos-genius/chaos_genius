import React from 'react';
import Tooltip from 'react-tooltip-lite';
import HRNumbers from 'human-readable-numbers';

import './humanReadableNumbers.scss'

const HumanReadableNumbers = ({ number }) => {
  return (
    <>
      <Tooltip
        className="tooltip-original-numbers"
        direction="left"
        content={<span>{number}</span>}>
        <span>
          {parseFloat(number) > 999 || parseFloat(number) < -999
            ? HRNumbers.toHumanString(number)
            : number}
        </span>
      </Tooltip>
    </>
  );
};


export default HumanReadableNumbers;