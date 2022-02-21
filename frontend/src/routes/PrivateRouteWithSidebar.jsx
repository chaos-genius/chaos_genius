import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Route, withRouter } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';

import { env } from '../env';

import { useHistory } from 'react-router-dom';
// import { isAuthenticated } from '../utils/user-helper';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

import {
  getConnectionType,
  getGlobalSetting,
  getVersionSetting,
  onboardingOrganisationStatus
} from '../redux/actions';

import { connectionContext } from '../components/context';
import { getOnboardingStatus } from '../redux/actions';
import posthog from 'posthog-js';
import ServerError from '../containers/ServerError';
import { saveLocalStorage } from '../utils/storage-helper';

let timeout = undefined;
const PrivateRouteWithSidebar = ({ component: Component, ...rest }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [stateValue, setState] = useState();
  const { connectionType } = useSelector((state) => state.dataSource);
  const { globalSettingData } = useSelector((state) => state.GlobalSetting);
  const { isLoading, error, onboardingList } = useSelector(
    (state) => state.onboarding
  );
  const { organisationData } = useSelector((state) => state.organisation);
  useEffect(() => {
    if (
      env.REACT_APP_DISABLE_TELEMETRY === 'true' ||
      env.NODE_ENV === 'development'
    ) {
      console.log('disable telemetry');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } else {
      if (
        organisationData !== undefined &&
        Object.keys(organisationData).length &&
        organisationData.active
      ) {
        const userEmail = organisationData.config_setting.account.email;
        const isAnonymized =
          organisationData.config_setting.metrics
            .anonymize_usage_data_collection;
        if (isAnonymized === false) {
          posthog.init('phc_KcsaN1oBtVUwKUvd9owb3Cz42MYDpR6No00EJRLAprH', {
            api_host: 'https://app.posthog.com',
            loaded: function (posthog) {
              posthog.identify(userEmail);
            }
          });
        } else {
          posthog.init('phc_KcsaN1oBtVUwKUvd9owb3Cz42MYDpR6No00EJRLAprH', {
            api_host: 'https://app.posthog.com'
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organisationData]);

  const reload = () => {
    dispatchGetConnectionType();
    dispatch(getGlobalSetting());
    dispatch(getVersionSetting());
    dispatch(getOnboardingStatus());
    dispatch(onboardingOrganisationStatus());
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatchGetConnectionType = () => {
    dispatch(getConnectionType());
  };

  useEffect(() => {
    if (
      organisationData === undefined &&
      Object.keys(onboardingList).length !== 0 &&
      onboardingList.organisation_onboarding !== undefined &&
      onboardingList.organisation_onboarding === false
    ) {
      history.push('/organisation-onboarding');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingList]);

  useEffect(() => {
    if (globalSettingData) {
      saveLocalStorage('GlobalSetting', JSON.stringify(globalSettingData));
    }
  }, [globalSettingData]);

  useEffect(() => {
    if (connectionType && connectionType.length !== 0) {
      setState(connectionType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionType]);

  if (isLoading) {
    return (
      <div className="load loader-page">
        <div className="preload"></div>
      </div>
    );
  } else if (error === 502 || error === 503 || error === 504) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      reload();
    }, 15000);
    return <ServerError />;
  }

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <connectionContext.Provider value={stateValue}>
            <div className="container-wrapper">
              <Navbar />
              <Sidebar />
              <main>
                <div className="body-container">
                  <Component {...props} />
                </div>
              </main>
              <ToastContainer
                position={toast.POSITION.BOTTOM_RIGHT}
                autoClose={5000}
              />
            </div>
          </connectionContext.Provider>
        </>
      )}
    />
  );
};

export default withRouter(PrivateRouteWithSidebar);
