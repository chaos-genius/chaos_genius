import React from 'react';

import './faq.scss';

const AddFaq = () => {
  return (
    <div className="faq-section">
      <div className="faq__wrapper-content">
        <div className="faq__title">
          <h2>FAQs</h2>
        </div>
        <div className="faq__separate_links">
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#add-a-kpi"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>Add a KPI</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#table-vs-custom-query-kpis"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>Table vs Custom Query KPIs</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#kpi-parameters"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>KPI Parameters</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#kpi-validation"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>KPI Validation</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#add-a-kpi"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>Add a KPI</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#table-vs-custom-query-kpis"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>Table vs Custom Query KPIs</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#kpi-parameters"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>KPI Parameters</label>
          </a>
          <a
            href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis#kpi-validation"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>KPI Validation</label>
          </a>
        </div>
      </div>
      <div className="faq__wrapper-content">
        <div className="faq__title">
          <h2>Video tutorials</h2>
        </div>
        <div className="faq__separate_links">
          <a
            href="https://www.youtube.com/embed/Z-kbVFh1zB8"
            target="_blank"
            rel="noopener noreferrer">
            {' '}
            <label>Chaos genius 101</label>
          </a>
        </div>
      </div>
      <div className="faq__support-content">
        <p>
          Need help? Feel free to send us a message at{' '}
          <a href="mailto: support@Chaosgenius.com" rel="noopener noreferrer">
            support@Chaosgenius.com
          </a>{' '}
        </p>
      </div>
    </div>
  );
};
export default AddFaq;
