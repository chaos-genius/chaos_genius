import React from 'react';
import Tooltip from 'react-tooltip-lite';

import './humanReadableNumbers.scss';
import { convertNumberToHRN } from '../../utils/Formatting/Numbers/numberFormat';

const HumanReadableNumbers = ({ number, is_bold }) => {
  const spanClass = is_bold ? 'bold-text' : 'normal';
  return (
    <>
      <Tooltip
        className="tooltip-original-numbers"
        direction="left"
        content={<span>{number}</span>}>
        <span className={spanClass}>{convertNumberToHRN(number)}</span>
      </Tooltip>
    </>
  );
};

export default HumanReadableNumbers;
