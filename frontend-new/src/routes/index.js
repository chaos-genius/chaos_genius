import React from 'react';

import { Switch } from 'react-router-dom';

import PrivateRouteWithSidebar from './PrivateRouteWithSidebar';

import Home from '../containers/Home';
import Dashboard from '../containers/Dashboard';
import DataSource from '../containers/DataSource';
import AddDataSource from '../containers/AddDataSource';
import KpiExplorer from '../containers/KpiExplorer';
import AddKpiExplorer from '../containers/AddKpiExplorer';
import Onboarding from '../containers/Onboarding';
import Alerts from '../containers/Alerts';

const Routes = () => (
  <Switch>
    <PrivateRouteWithSidebar
      exact
      path="/"
      component={(props) => <Home {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard"
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
      path="/kpi"
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
  </Switch>
);

export default Routes;
