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
import Kpisetting from '../containers/KpiSetting';
import Dashboardconfigure from '../containers/Dashboardconfigure';
import AddDashboard from '../containers/AddDashboard';
import OrganisationOnboarding from '../containers/Onboarding/OrganisationOnboarding';
import OrganisationSettings from '../containers/OrganisationSettings/OrganisationSettings';
import TaskManager from '../containers/TaskManagement/TaskManager';

const Routes = () => (
  <Switch>
    <Route exact path="/login" component={Login}></Route>
    <Route exact path="/verifylogin" component={Login}></Route>
    <Route
      exact
      path="/organisation-onboarding"
      component={OrganisationOnboarding}></Route>
    <PrivateRouteWithSidebar
      exact
      path={[
        '/dashboard/:dashboard/deepdrills/',
        '/dashboard/:dashboard/deepdrills/:kpi'
      ]}
      component={(props) => <Dashboard {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard/:dashboard/anomaly/:kpi"
      component={(props) => <Dashboard {...props} />}
    />{' '}
    <PrivateRouteWithSidebar
      exact
      path={'/dashboard'}
      component={(props) => <Dashboardconfigure {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard/:dashboard/settings/:id"
      component={(props) => <Kpisetting {...props} />}
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
      path="/datasource/edit/:id"
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
      path={['/alerts/new/kpi-alert', '/alerts/edit/kpi-alert/:id']}
      component={(props) => <AddKpiAlert {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path={['/alerts/new/event-alert', '/alerts/edit/event-alert/:id']}
      component={(props) => <AddEventAlert {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path={[
        '/alerts/channelconfiguration/:id/',
        '/alerts/channelconfiguration/:id/:edit'
      ]}
      component={(props) => <AddAlerts {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/noresult"
      component={(props) => <Result {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/organisation-settings"
      component={(props) => <OrganisationSettings {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard/add"
      component={(props) => <AddDashboard {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/dashboard/edit/:id"
      component={(props) => <AddDashboard {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path="/task-manager"
      component={(props) => <TaskManager {...props} />}
    />
    <PrivateRouteWithSidebar
      exact
      path={['/', '/:id']}
      component={(props) => <Home {...props} />}
    />{' '}
    <PrivateRouteWithSidebar
      exact
      component={(props) => <Anomolies {...props} />}
    />
  </Switch>
);

export default Routes;
