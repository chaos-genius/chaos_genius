
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
      kpi: 0,
      kpiName: "",
      kpiData: [],
      tableData: [
        {
          'name': 'My SQL Demo',
          'data-source': 'Google Analytics',
          'last-modified': '12/03/2020',
          'certified': 'Yes',
          'owner': 'Austin'
        }
      ],
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
          if (data.data?.[0]['id']) {
            this.setState({
              kpi: data.data[0]['id'],
              kpiName: data.data[0]['name'],
              kpiData: data.data,
              // loading: false
            })
          }
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
              { title: 'Data Source', field: 'data-source' },
              { title: 'Last Modified', field: 'last-modified' },
              { title: 'Certified', field: 'certified' },
              { title: 'Owner', field: 'owner' }
            ]}
            data={this.state.tableData}
            title=""
            options={{
              paginationType: "stepped",
              showTitle: false,
              search: false,
              toolbar: false,
              // searchFieldAlignment: 'left',
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
            <Typography component="h4" className="page-title">KPI Explorer</Typography>
          </Grid>
          <Grid item xs={3} justify="flex-end">
            <Button href="/#/kpi/new" variant="primary" className="btn btn-primary btn-toolbar pull-right" ><ControlPoint className="btn-icon" /> New KPI</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={3} className="custom-col-3">
            {(Object.keys(this.state.kpiData).length > 0) ? (
              <SideBar handleKpiChange={this.handleKpiChange} kpiData={this.state.kpiData} kpiID={this.state.kpi} />
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
