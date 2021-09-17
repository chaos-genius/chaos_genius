import React from 'react';

import Noresult from '../../components/Noresult';
// import Connectionlost from '../../components/Connectionlost';
// import Somethingwentwrong from '../../components/Somethingwentwrong';

const Result = () => {
  return (
    <div className="no-data-container">
      <Noresult />
      {/* <Connectionlost /> */}
      {/* <Somethingwentwrong /> */}
    </div>
  );
};

export default Result;
