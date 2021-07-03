import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "./routes";

import Sidebar from './components/Sidebar';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';


import UserOnboarding from './pages/UserOnboarding';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import Home from './pages/Home';
import Dashboards from './pages/Dashboards';
import KpiExplorer from './pages/Kpi';
import AddKpi from './pages/Kpi/AddKpi';
import ActionItems from './pages/ActionItems';
import Alerts from './pages/Alerts';
import Users from './pages/Users';
import DataSources from './pages/DataSource';
import OrganisationSettings from './pages/OrganisationSettings';


const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem('settingsVisible') === 'false' ? false : true
  }

  const [showSettings, setShowSettings] = useState(localStorageIsSettingsVisible);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem('settingsVisible', !showSettings);
  }

  return (
    <Route {...rest} render={props => (
      <>
        <Preloader show={loaded ? false : true} />
        <Sidebar />

        <main className="content">
          <Navbar />
          <Component {...props} />
        </main>
      </>
    )}
    />
  );
};



function App() {
  return (
    <Switch>

      <RouteWithSidebar exact path={Routes.UserOnboarding.path} component={UserOnboarding} />
      <RouteWithSidebar exact path={Routes.UserProfile.path} component={UserProfile} />
      <RouteWithSidebar exact path={Routes.UserSettings.path} component={UserSettings} />

      <RouteWithSidebar exact path={Routes.Home.path} component={Home} />
      <RouteWithSidebar exact path={Routes.Dashboards.path} component={Dashboards} />
      <RouteWithSidebar exact path={Routes.KpiExplorer.path} component={KpiExplorer} />
      <RouteWithSidebar exact path={Routes.AddKpi.path} component={AddKpi} />
      <RouteWithSidebar exact path={Routes.ActionItems.path} component={ActionItems} />
      <RouteWithSidebar exact path={Routes.Alerts.path} component={Alerts} />

      <RouteWithSidebar exact path={Routes.Users.path} component={Users} />
      <RouteWithSidebar exact path={Routes.DataSources.path} component={DataSources} />
      <RouteWithSidebar exact path={Routes.OrganisationSettings.path} component={OrganisationSettings} />

      <Redirect to={Routes.NotFound.path} />
    </Switch>
);
}

export default App;
