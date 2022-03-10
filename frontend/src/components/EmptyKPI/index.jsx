import React from 'react';

import Documents from '../../assets/images/document-green.svg';

import './emptykpi.scss';

const EmptyKPI = () => {
  return (
    <div className="empty-kpi-card">
      <h2>Creating your first KPI with Dimensions</h2>
      <p>
        Creating KPIs with Chaos Genius is super easy. Watch the 2 mins tutorial
        to learn how to handle tricky situations like date time formats,
        timezones, working with large data sets and how to select dimensions.
      </p>
      <div className="empty-kpi-title">
        <h4>How will it work?</h4>
        <a
          href="https://docs.chaosgenius.io/docs/kpi_explorer/adding-kpis"
          target="_blank"
          rel="noopener noreferrer">
          <img src={Documents} alt="Documents" />
          Documentation
        </a>
      </div>
      <div className="video-container">
        <iframe
          className="video-wrapper"
          src="https://www.youtube.com/embed/iF6qg29IfqU"
          title="ChaosGenius - The Open-Source Business Observability Platform"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
      <h5>
        Have any questions? Here’s the{' '}
        <a
          href="https://docs.chaosgenius.io/docs/Troubleshooting/tips"
          target="_blank"
          rel="noopener noreferrer">
          Troubleshoot guide{' '}
        </a>
        for you or feel free to ping us on our Community Slack!
      </h5>
    </div>
  );
};

export default EmptyKPI;
