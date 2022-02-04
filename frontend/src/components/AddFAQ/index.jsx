import React from 'react';
import { Link } from 'react-router-dom';

const AddFaq = () => {
  return (
    <div className="faq-section">
      <div className="faq__title">
        <h2>FAQs</h2>
      </div>
      <div className="faq__separate_links">
        <Link to="">
          {' '}
          <label>Add a KPI</label>
        </Link>
      </div>
    </div>
  );
};
export default AddFaq;
