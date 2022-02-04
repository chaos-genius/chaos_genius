import React, { useEffect } from 'react';

import ProgressBar from '@ramonak/react-progress-bar';

import SetupCard from '../../components/SetupCard';
import Kpihome from '../../components/Kpihome';

import { getOnboardingStatus } from '../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';

import './home.scss';
import store from '../../redux/store';
import { useState } from 'react';

const Home = () => {
  const dispatch = useDispatch();

  const { onboardingList } = useSelector((state) => state.onboarding);
  const [homeReady, setHomeReady] = useState(false);

  const clearHomeData = () => {
    store.dispatch({ type: 'RESET_KPI_HOME_DATA' });
    store.dispatch({ type: 'CLEAR_TIMECUTS' });
    store.dispatch({ type: 'DASHBOARD_RESET' });
    setHomeReady(true);
  };

  useEffect(() => {
    clearHomeData();
    dispatchOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchOnboarding = () => {
    dispatch(getOnboardingStatus());
  };

  return (
    <>
      {onboardingList.completion_precentage !== 100 ? (
        <>
          {/* common heading and options */}
          <div className="heading-option">
            <div className="heading-title">
              <h3>Get Started with Chaos Genius setup</h3>
            </div>

            <div className="progress-option">
              <ProgressBar
                completed={onboardingList?.completion_precentage}
                className="progressbar"
              />
              <p>{onboardingList?.completion_precentage}% Completed</p>
            </div>
          </div>
          {/* homepage setup card wrapper */}
          <div className="homepage-setup-card-wrapper">
            {onboardingList ? (
              onboardingList &&
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
              })
            ) : (
              <div className="load home-page-loader">
                <div className="preload"></div>
              </div>
            )}
          </div>
        </>
      ) : (
        homeReady && <Kpihome />
      )}
    </>
  );
};

export default Home;
