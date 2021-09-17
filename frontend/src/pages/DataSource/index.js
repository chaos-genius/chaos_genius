
import React from "react";
import {
  Redirect
} from 'react-router-dom';
import {
  DialogContent, DialogContentText, DialogActions, ButtonGroup,
  Card, CardContent, Typography, Container, Grid, Button
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'
import CustomModal from '../../components/CustomModal'

import { ControlPoint } from '@material-ui/icons'
import moment from 'moment'

import SideBar from './Sidebar'
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import AddAlertIcon from '@material-ui/icons/AddAlert';

class DataSources extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      tableData: [],
      isRedirect: false,
      confirmation: false,
      connectionTypes: []
    }
  }

  editActionButton = (id) => {
    return (
      <ButtonGroup aria-label="outlined button group">
        <Button onClick={() => this.setState({ confirmation: true, deleteID: id })}><FontAwesomeIcon icon={faTrashAlt} /></Button>
        <Button onClick={() => this.props.history.push('/alert/new')}><AddAlertIcon fontSize="small"/></Button>
      </ButtonGroup>
      )
  }

  handleClose = (key) => {
    let stateObj = {};
    stateObj[key] = false
    this.setState(stateObj);
  }

  componentDidMount() {
    this.fetchConnectionTypes();
  }

  renderActiveDataSource = (active) => {
    if (active) {
      return (
        <span className="text-success">Live</span>
      )
    } else {
      return (
        <span className="text-danger">Broken</span>
      )
    }
  }

  renderConnectionType = (conn_type) => {
    const { connectionTypes } = this.state
    let renderData = [];
    if (Object.keys(connectionTypes).length > 0) {
      renderData = connectionTypes.filter((obj) => {
        return obj.name === conn_type
      })
      let textHtml = (renderData[0]?.['icon'])?(renderData[0]['icon']):("");
      return (
        <span>
          <span dangerouslySetInnerHTML={{ __html: textHtml }} className="datasource-svgicon" />
          {conn_type}
        </span>
      )
    }
  }

  fetchConnectionTypes = () => {
    fetch(`${BASE_URL}/api/connection/types`)
      .then(response => response.json())
      .then(data => {
        const tabData = [];
        if (data?.data) {
          this.setState({
            connectionTypes: data.data,
            // connection: data.data[0]['name'],
          },()=>{
            this.fetchConnection();
          })
        }
      });
  }

  fetchConnection = () => {
    fetch(`${BASE_URL}/api/connection`)
      .then(response => response.json())
      .then(data => {
        const tabData = [];
        if (data?.data) {
          data.data.map((obj) => {
            const datum = {};
            datum['name'] = obj.name;
            datum['connection_type'] = this.renderConnectionType(obj.connection_type);
            datum['active'] = this.renderActiveDataSource(obj.active);
            datum['delete'] = this.editActionButton(obj.id);
            datum['date'] = moment(obj.created_at).format('DD MMMM YYYY');
            tabData.push(datum);
          })
          this.setState({
            tableData: tabData
          })
        }
      });
  }
  deleteDataSource = () => {

    let payload = {
      data_source_id: this.state.deleteID
    }

    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: DEFAULT_HEADERS,
    };

    fetch(`${BASE_URL}api/connection/delete`, requestOptions)
      .then(response => response.json())
      .then(data => {
        this.setState({
          confirmation: false,
          deleteID: ''
        }, () => {
          this.fetchConnection()
        })
      }).catch(error => {
        console.log(error);
      });
  }

  deleteConfirmation = () => {
    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <Typography component="h4"> Do you want to delete?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="text-center">
          <Button variant="primary" onClick={this.deleteDataSource}>Yes</Button>
          <Button variant="default" onClick={() => this.handleClose("confirmation")}>No</Button>
        </DialogActions>
      </>
    )
  }
  renderTable = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} className="custom-table">
          <CustomTable
            columns={[
              { title: 'Data Connection Name', field: 'name' },
              { title: 'Status', field: 'active' },
              { title: 'Data Source Type', field: 'connection_type' },
              { title: 'Date', field: 'date' },
              { title: '', field: 'delete' },
            ]}
            data={this.state.tableData}
            title=""
            options={{
              paginationType: "stepped",
              showTitle: false,
              searchFieldAlignment: 'left',
              paging: false,
              search: false,
              toolbar: false,
            }}
          />
        </Grid>
      </Grid>
    )
  }


  render() {
    if (this.state.isRedirect) {
      return (
        <Redirect to={{
          pathname: '/datasource/new',
        }} />
      )
    }
    return (
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Typography component="h4" className="page-title">Data Source</Typography>
          </Grid>
          <Grid item xs={3} justify="flex-end">
            <Button href="/#/datasource/new" variant="primary" className="btn btn-primary btn-toolbar pull-right" ><ControlPoint className="btn-icon" /> New Data Source</Button>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={3} className="custom-col-3">
            {(Object.keys(this.state.connectionTypes).length > 0) ? (
              <SideBar connectionTypes={this.state.connectionTypes} />
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
export default DataSources;
