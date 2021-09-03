import React from 'react';

import Noresultimage from '../../assets/images/no-result.svg';

const Noresult = ({ text, title }) => {
  return (
    <div className="no-data-card">
      <div className="no-data-img">
        <img src={Noresultimage} alt="No Result" />
      </div>
      <h3>Sorry! No {title} Found</h3>
      <p>
        We couldn’t find what you are looking for{' '}
        {text ? text : ' please try again'}
      </p>
    </div>
  );
};

export default Noresult;
