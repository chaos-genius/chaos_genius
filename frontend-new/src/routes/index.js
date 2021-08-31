import React from 'react';

import { Switch, Route } from 'react-router-dom';

import PrivateRouteWithSidebar from './PrivateRouteWithSidebar';

import Home from '../containers/Home';
import Dashboard from '../containers/Dashboard';
import DataSource from '../containers/DataSource';
import AddDataSource from '../containers/AddDataSource';
import KpiExplorer from '../containers/KpiExplorer';
import AddKpiExplorer from '../containers/AddKpiExplorer';
import Onboarding from '../containers/Onboarding';
import Channelconfiguration from '../containers/Channelconfiguration';
import Anomolies from '../containers/Anomolies';
import Alerts from '../containers/Alerts';
import AddAlerts from '../containers/AddAlerts';
import SetAlerts from '../containers/SetAlerts';
import AddKpiAlert from '../containers/AddKpiAlert';
import AddEventAlert from '../containers/AddEventAlert';
import Result from '../containers/Result';
import Login from '../containers/Login';

const Routes = () => (
  <Switch>
    <Route exact path="/login" component={Login}></Route>
    <Route exact path="/verifylogin" component={Login}></Route>
    <PrivateRouteWithSidebar
      exact
      path="/"
      component={(props) => <Home {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path={['/dashboard/autorca/', '/dashboard/autorca/:kpi']}
      component={(props) => <Dashboard {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard/anomolies/:kpi"
      component={(props) => <Dashboard {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/datasource"
      component={(props) => <DataSource {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/datasource/add"
      component={(props) => <AddDataSource {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/datasource/edit"
      component={(props) => <AddDataSource {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/kpiexplorer"
      component={(props) => <KpiExplorer {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/kpiexplorer/edit/:id"
      component={(props) => <AddKpiExplorer {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/kpiexplorer/add"
      component={(props) => <AddKpiExplorer {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/onboarding/:id"
      component={(props) => <Onboarding {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts"
      component={(props) => <Alerts {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts/channelconfiguration"
      component={(props) => <Channelconfiguration {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts/new"
      component={(props) => <SetAlerts {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts/:id"
      component={(props) => <AddAlerts {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts/new/kpi-alert"
      component={(props) => <AddKpiAlert {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/alerts/new/event-alert"
      component={(props) => <AddEventAlert {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/noresult"
      component={(props) => <Result {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      component={(props) => <Anomolies {...props} />}
    />
  </Switch>
);

export default Routes;
