import React from 'react';

import Documents from '../../assets/images/document-green.svg';

import './emptykpi.scss';

const EmptyKPI = () => {
  return (
    <div className="empty-kpi-card">
      <h2>Creating your first KPI</h2>
      <p>
        We're kind of like Looker, but without the price tag. At Chaosgenius,
        our mission is simple: we want to enable everybody in your company to
        answer their own questions using data
      </p>
      <div className="empty-kpi-title">
        <h4>How it will work?</h4>
        <a>
          <img src={Documents} alt="Documents" />
          Documentation
        </a>
      </div>
      <div className="video-container">
        <iframe
          className="video-wrapper"
          src="https://www.youtube.com/embed/Z-kbVFh1zB8"
          title="ChaosGenius - The Open-Source Business Observability Platform"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
      <h5>
        Have any questions? Feel free to send us a message at
        <label>support@Chaosgenius.com</label>
      </h5>
    </div>
  );
};

export default EmptyKPI;
