import {
  getAllDataSources,
  getConnectionType,
  testDatasourceConnection,
  createDataSource,
  deleteDatasource,
  getDatasourceMetaInfo,
  getDatasourceById,
  updateDatasourceById
} from './DataSources';
//import { getAllDataSources } from './DataSources';
import {
  getAllKpiExplorer,
  getAllKpiExplorerForm,
  getAllKpiExplorerField,
  getAllKpiExplorerSubmit,
  getTestQuery,
  kpiDisable,
  getEditMetaInfo,
  getKpibyId,
  getUpdatekpi
} from './KpiEplorer';
import {
  getDashboardAggregation,
  getDashboardRcaAnalysis,
  getAllDashboardDimension,
  getAllDashboardHierarchical
} from './Dashboard';
import { getOnboardingStatus, getHomeKpi } from './Onboarding';
import { getDashboardLinechart } from './LineChart';
import { getDashboardSidebar } from './Sidebarlist';
import {
  getAllAlertEmail,
  getChannelStatus,
  getEditChannel,
  getEmailMetaInfo,
  getSlackMetaInfo,
  getAllAlerts,
  createKpiAlert,
  kpiAlertMetaInfo,
  getKpiAlertById,
  updateKpiAlert,
  kpiAlertDisable,
  kpiAlertEnable,
  kpiAlertDeleteById
} from './Alert';
import {
  anomalyDetection,
  getAnomalyQualityData,
  anomalyDrilldown,
  anomalySetting
} from './Anomaly';
import { kpiSettingSetup, kpiEditSetup, settingMetaInfo } from './setting';
import {
  getDashboard,
  getDashboardDelete,
  getCreateDashboard,
  getEditDashboard,
  getUpdateDashboard
} from './DashboardHome';

import {
  onboardingOrganisationStatus,
  onboardOrganisation,
  onboardOrganisationUpdate
} from './Organisation';
import { getDashboardConfig } from './Config';
import { getGlobalSetting } from './GlobalSetting';
export {
  getAllDataSources,
  getConnectionType,
  testDatasourceConnection,
  createDataSource,
  deleteDatasource,
  getAllKpiExplorer,
  getAllKpiExplorerForm,
  getAllKpiExplorerField,
  getAllKpiExplorerSubmit,
  getDashboardSidebar,
  getDashboardAggregation,
  getDashboardLinechart,
  getDashboardRcaAnalysis,
  getAllDashboardDimension,
  getAllDashboardHierarchical,
  getOnboardingStatus,
  getTestQuery,
  anomalyDetection,
  getAnomalyQualityData,
  anomalyDrilldown,
  kpiDisable,
  getAllAlertEmail,
  getChannelStatus,
  getEditChannel,
  kpiSettingSetup,
  kpiEditSetup,
  getEditMetaInfo,
  getKpibyId,
  getUpdatekpi,
  getDatasourceMetaInfo,
  getDatasourceById,
  updateDatasourceById,
  getEmailMetaInfo,
  getSlackMetaInfo,
  getHomeKpi,
  getAllAlerts,
  createKpiAlert,
  kpiAlertMetaInfo,
  getKpiAlertById,
  updateKpiAlert,
  kpiAlertDisable,
  kpiAlertEnable,
  anomalySetting,
  settingMetaInfo,
  getDashboard,
  getDashboardDelete,
  getCreateDashboard,
  getEditDashboard,
  getUpdateDashboard,
  onboardingOrganisationStatus,
  onboardOrganisation,
  onboardOrganisationUpdate,
  getDashboardConfig,
  getGlobalSetting,
  kpiAlertDeleteById
};
