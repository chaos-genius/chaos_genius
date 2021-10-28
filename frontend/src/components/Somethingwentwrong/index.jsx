import React from 'react';

import Wentwrong from '../../assets/images/wentwrong.svg';

const Somethingwentwrong = () => {
  return (
    <div className="no-data-card">
      <div className="no-data-img">
        <img src={Wentwrong} alt="Something Went Wrong" />
      </div>
      <h3>Something went wrong</h3>
      <p>You may refresh the page or try again later</p>
      <button type="submit" className="btn black-button">
        <span>try again</span>
      </button>
    </div>
  );
};

export default Somethingwentwrong;
