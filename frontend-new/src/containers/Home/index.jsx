import React, { useEffect } from 'react';

import './home.scss';

import SetupCard from '../../components/SetupCard';

import { getOnboardingStatus } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

const Home = () => {
  const dispatch = useDispatch();

  const { onboardingList } = useSelector((state) => state.onboarding);

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
      </div>
    </div>
  );
};

export default Home;
