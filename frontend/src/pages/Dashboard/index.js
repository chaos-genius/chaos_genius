
import React from "react";
import {
  Grid, Card, CardContent, CardActions,
  Button, Typography, InputLabel, Switch,
  FormControl, Select, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';

import CustomTabs from '../../components/CustomTabs'

import { tab1Fields } from './HelperFunctions'
import SideBar from './SideBar'
import MultidimensionTable from './MultidimensionTable'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import RcaAnalysisTable from '../../components/DashboardTable';
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';

import Anomaly from './Anomaly';
import AutoRCA from './AutoRCA';

class Dashboard extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      kpi: 0,
      kpiName: "",      
      kpiData: [],
      timeline:"mom"
    }

  }
  fetchKPIData = () => {
    this.setState({ loading: true })
    fetch(`${BASE_URL}/api/kpi/`)
      .then(response => response.json())
      .then(data => {
        if (data?.data) {
          if (data.data?.[0]['id']) {
            this.setState({
              kpi: data.data[0]['id'],
              kpiName: data.data[0]['name'],
              kpiData: data.data,
              loading: false
            })
          }
        }
      });
  }
 
  handleKpiChange = (e) => {
    const targetComponent = e.target;
    const componentValue = targetComponent.id;

    this.setState({
      kpi: componentValue,
      kpiName: targetComponent.innerText,
      tabState: 0
    })
  }
  handleTimelineChange = (e) => {
    const targetComponent = e.target;
    this.setState({
      timeline: targetComponent.value,
    })
  }

  componentDidMount() {
    this.fetchKPIData();
  }
  render() {
    const tabChartData = [{
      "title": "AutoRCA",
      "body": (this.state.kpi > 0)?(<AutoRCA kpi={this.state.kpi} timeline={this.state.timeline} kpiName={this.state.kpiName} handleTimelineChange={this.handleTimelineChange}  />):("")
    },{
      "title": "Anomaly",
      "body": (this.state.kpi > 0)?(<Anomaly kpi={this.state.kpi} timeline={this.state.timeline} />):("")
    }];

    return (
      <Grid container spacing={2} className="custom-width-grid">
        <Grid item  xs={3} className="custom-col-3">
          {(Object.keys(this.state.kpiData).length > 0) ? (
            <SideBar handleKpiChange={this.handleKpiChange} kpiData={this.state.kpiData} kpiID={this.state.kpi} />
          ) : ("")}
        </Grid>
        <Grid item xs={9}  className="tab-with-borders custom-col-9">
          <CustomTabs tabs={tabChartData} />
          {/* <AutoRCA /> */}
        </Grid>
      </Grid>
    )
  }


}
export default Dashboard;
