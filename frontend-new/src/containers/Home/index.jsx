import React from 'react';

import './home.scss';

import SetupCard from '../../components/SetupCard';

const Home = () => {
  return (
    <div>
      {/* common heading and options */}
      <div className="heading-option">
        <div className="heading-title">
          <h3>Get Started with Chaos Genius setup</h3>
        </div>
        <div className="option-button"></div>
      </div>
      {/* homepage setup card wrapper */}
      <div className="homepage-setup-card-wrapper">
        <SetupCard
          heading="Add Data Sources"
          description="Select the data you want to monitor and analyse"
          buttonText="Add Data Source"
          active={true}
        />
        <SetupCard
          heading="Add KPI"
          description="Select the data you want to monitor and analyse"
          buttonText="Add KPI"
        />
        <SetupCard
          heading="Create Dashboard"
          description="Select the data you want to monitor and analyse"
          buttonText="Create Dashboard"
        />
        <SetupCard
          heading="Activate Analytics"
          description="Select the data you want to monitor and analyse"
          buttonText="Activate Analytics"
        />
        <SetupCard
          heading="Setup Smart Alerts"
          description="Select the data you want to monitor and analyse"
          buttonText="Setup Smart Alerts"
          optional={true}
        />
      </div>
    </div>
  );
};

export default Home;
