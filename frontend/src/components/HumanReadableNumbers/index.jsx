import React from 'react';
import Tooltip from 'react-tooltip-lite';

import './humanReadableNumbers.scss';
import { convertNumberToHRN } from '../../utils/numberFormat';

const HumanReadableNumbers = ({ number }) => {
  return (
    <>
      <Tooltip
        className="tooltip-original-numbers"
        direction="left"
        content={<span>{number}</span>}>
        <span>{convertNumberToHRN(number)}</span>
      </Tooltip>
    </>
  );
};

export default HumanReadableNumbers;
