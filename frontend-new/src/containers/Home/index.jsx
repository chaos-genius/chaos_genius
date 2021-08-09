import React, { useEffect } from 'react';

import './home.scss';

import SetupCard from '../../components/SetupCard';

import { getOnboardingStatus } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

const onboardingList = {
  completion_precentage: 50,
  steps: [
    {
      step_done: true,
      step_name: 'Add Data Source',
      step_no: 1
    },
    {
      step_done: true,
      step_name: 'Add KPI',
      step_no: 2
    },
    {
      step_done: false,
      step_name: 'Activate Analytics',
      step_no: 3
    },
    {
      step_done: false,
      step_name: 'Setup Smart Alert',
      step_no: 4
    }
  ]
};

const Home = () => {
  const dispatch = useDispatch();

  const { onboardingLis } = useSelector((state) => state.onboarding);

  useEffect(() => {
    dispatchOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const dispatchOnboarding = () => {
    dispatch(getOnboardingStatus());
  };

  return (
    <div>
      {/* common heading and options */}
      <div className="heading-option">
        <div className="heading-title">
          <h3>Get Started with Chaos Genius setup</h3>
        </div>
        {onboardingList.completion_precentage && (
          <div className="option-button">
            <progress
              value={onboardingList.completion_precentage}
              max="100"></progress>
            <p>{onboardingList.completion_precentage}% Completed</p>
          </div>
        )}
      </div>
      {/* homepage setup card wrapper */}
      <div className="homepage-setup-card-wrapper">
        {onboardingList &&
          onboardingList.steps &&
          onboardingList.steps.map((item, index) => {
            if (index > 0) {
              if (item.step_done === false) {
                if (onboardingList.steps[index - 1].step_done === true)
                  return (
                    <SetupCard
                      heading={item.step_name}
                      step={item.step_no}
                      buttonText={item.step_name}
                      active="pending"
                    />
                  );
                else {
                  return (
                    <SetupCard
                      heading={item.step_name}
                      step={item.step_no}
                      buttonText={item.step_name}
                      active="Notcompleted"
                    />
                  );
                }
              } else {
                return (
                  <SetupCard
                    heading={item.step_name}
                    step={item.step_no}
                    buttonText={item.step_name}
                    active="completed"
                  />
                );
              }
            } else if (index === 0) {
              if (item.step_done === false) {
                return (
                  <SetupCard
                    heading={item.step_name}
                    step={item.step_no}
                    buttonText={item.step_name}
                    active="pending"
                  />
                );
              } else {
                return (
                  <SetupCard
                    heading={item.step_name}
                    step={item.step_no}
                    buttonText={item.step_name}
                    active="completed"
                  />
                );
              }
            }
            return <></>;
          })}

        {/* <SetupCard
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
        /> */}
      </div>
    </div>
  );
};

export default Home;
