
import React from "react";
import {
  Redirect
} from 'react-router-dom';
import {
  Card, CardContent, Container, Grid, Button, Typography
} from '@material-ui/core';
import {ControlPoint} from '@material-ui/icons';
import CustomTable from '../../components/CustomTable';
import SideBar from '../Dashboard/SideBar';
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants';


class AlertList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertData: [
        {
          "name": "Website High Traffic Alert",
          "alert_type": "Event Based",
          "active": true,
          "created_at": "Wed, 20 Jul 2021 13:53:55 GMT",
        },
        {
          "name": "Alert for Anomaly in AOV",
          "alert_type": "KPI Based",
          "active": true,
          "created_at": "Wed, 22 Jul 2021 20:33:55 GMT",
        },
        {
          "name": "Alert for Low Net Sales",
          "alert_type": "Event Based",
          "active": true,
          "created_at": "Wed, 24 Jul 2021 08:03:55 GMT",
        },
        {
          "name": "Spike Alert in Ads Spend",
          "alert_type": "KPI Based",
          "active": true,
          "created_at": "Wed, 21 Jul 2021 01:53:55 GMT",
        }

      ],
      isRedirect: false
    };
  }

  fetchAlertData = () => {
  }

  handleAlertChange = (e) => {
  }

  renderTable = () => {
    return (

      <Grid container spacing={3}>
        <Grid item xs={12} className="custom-table">
          <CustomTable
            columns={[
              { title: 'Alert Name', field: 'name' },
              { title: 'Alert Type', field: 'alert_type' },
              { title: 'Active', field: 'active' },
              { title: 'Created At', field: 'created_at' }
            ]}
            data={this.state.alertData}
            title=""
            options={{
              paginationType: "stepped",
              showTitle: false,
              search: false,
              toolbar: false,
              paging: false
            }}
          />
        </Grid>
      </Grid>


    )
  }
  componentDidMount() {
    this.fetchAlertData()
  }
  render() {
    if (this.state.isRedirect) {
      return (
        <Redirect to={{
          pathname: '/alert/new',
        }} />
      )
    }

    return (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Typography component="h4" className="page-title">Alert</Typography>
          </Grid>
          <Grid item xs={3} justify="flex-end">
            <Button href="/#/alert/new" variant="primary" className="btn btn-primary btn-toolbar pull-right" ><ControlPoint className="btn-icon" /> New Alert</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={3} className="custom-col-3">
            {(Object.keys(this.state.alertData).length > 0) ? (
              <SideBar handleKpiChange={this.handleAlertChange} key={this.state.alertData} kpiData={this.state.alertData} sidebarName="Alert"/>
            ) : ("")}
          </Grid>
          <Grid item xs={9} className="tab-with-borders custom-col-9">
            {this.renderTable()}
          </Grid>
        </Grid>
      </Container>
    )
  }


}
export default AlertList;
