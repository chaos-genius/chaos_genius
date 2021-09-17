
import React from "react";
import {
  Redirect
} from 'react-router-dom';
import {
  Card, CardContent, Container, Grid, Button, Typography
} from '@material-ui/core';
import {ControlPoint} from '@material-ui/icons'

import CustomTable from '../../components/CustomTable'

import SideBar from './../Dashboard/SideBar'

import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'

class KpiList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      kpiData: [],
      isRedirect: false
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New KPI</span>
    )
  }
  fetchKPIData = () => {
    // this.setState({ loading: true })
    fetch(`${BASE_URL}/api/kpi/`)
      .then(response => response.json())
      .then(data => {
        if (data?.data) {
          console.log(data.data);
          this.setState({
            kpiData: data.data
          })
        }
      });
  }

  handleKpiChange = (e) => {
  }

  renderTable = () => {
    return (

      <Grid container spacing={3}>
        <Grid item xs={12} className="custom-table">
          <CustomTable
            columns={[
              { title: 'KPI Name', field: 'name' },
              { title: 'Data Source ID', field: 'data_source' },
              { title: 'Certified', field: 'is_certified' },
              { title: 'Created At', field: 'created_at' }
            ]}
            data={this.state.kpiData}
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
    this.fetchKPIData()
  }
  render() {
    if (this.state.isRedirect) {
      return (
        <Redirect to={{
          pathname: '/kpi/new',
        }} />
      )
    }

    return (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Typography component="h4" className="page-title">KPI</Typography>
          </Grid>
          <Grid item xs={3} justify="flex-end">
            <Button href="/#/kpi/new" variant="primary" className="btn btn-primary btn-toolbar pull-right" ><ControlPoint className="btn-icon" /> New KPI</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={3} className="custom-col-3">
            {(Object.keys(this.state.kpiData).length > 0) ? (
              <SideBar handleKpiChange={this.handleKpiChange} key={this.state.kpiData} kpiData={this.state.kpiData}/>
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
export default KpiList;
