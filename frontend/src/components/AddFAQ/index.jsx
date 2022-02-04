import React from 'react';
import { Link } from 'react-router-dom';
import './faq.scss';

const AddFaq = () => {
  return (
    <div className="faq-section">
      <div className="faq__wrapper-content">
        <div className="faq__title">
          <h2>FAQs</h2>
        </div>
        <div className="faq__separate_links">
          <Link to="">
            {' '}
            <label>Add a KPI</label>
          </Link>
          <Link to="">
            {' '}
            <label>Table vs Custom Query KPIs</label>
          </Link>
          <Link to="">
            {' '}
            <label>KPI Parameters</label>
          </Link>
          <Link to="">
            {' '}
            <label>KPI Validation</label>
          </Link>
          <Link to="">
            {' '}
            <label>Add a KPI</label>
          </Link>
          <Link to="">
            {' '}
            <label>Table vs Custom Query KPIs</label>
          </Link>
          <Link to="">
            {' '}
            <label>KPI Parameters</label>
          </Link>
          <Link to="">
            {' '}
            <label>KPI Validation</label>
          </Link>
        </div>
      </div>
      <div className="faq__wrapper-content">
        <div className="faq__title">
          <h2>Video tutorials</h2>
        </div>
        <div className="faq__separate_links">
          <Link to="">
            {' '}
            <label>Chaos genius 101</label>
          </Link>
        </div>
      </div>
      <div className="faq__support-content">
        <p>
          Need help? Feel free to send us a message at{' '}
          <Link to="">support@Chaosgenius.com</Link>{' '}
        </p>
      </div>
    </div>
  );
};
export default AddFaq;
