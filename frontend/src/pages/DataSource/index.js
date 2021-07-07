
import React from "react";
import {
  Redirect
} from 'react-router-dom';
import { Button, Container, Row, Col, Alert } from '@themesberg/react-bootstrap';
import {
  DialogContent, DialogContentText, DialogActions,
  Card, CardContent, Typography
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'
import CustomModal from '../../components/CustomModal'

import './../../assets/css/custom.css'

import postgresql from './../../assets/img/postgresql.png'
import mysql from './../../assets/img/mysql.png'

import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
class DataSources extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      tableData: [],
      isRedirect: false,
      confirmation:false
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New Data Source</span>
    )
  }
  editActionButton = (id) => {
    return (
      <Button variant="white" className="m-1" onClick={() => this.setState({ confirmation: true, deleteID: id })}><FontAwesomeIcon icon={faTrashAlt} /></Button>
    )
  }
  handleClose = (key) => {
    let stateObj = {};
    stateObj[key] = false
    this.setState(stateObj);
  }


  componentDidMount() {
    this.fetchConnection();
  }
  renderActiveDataSource = (active) => {
    if (active) {
      return (
        <span className="text-success"><FontAwesomeIcon icon={faCircle} /></span>
      )
    } else {
      return (
        <span className="text-danger"><FontAwesomeIcon icon={faCircle} /></span>
      )
    }
  }
  renderConnectionType = (conn_type) => {
    if (conn_type === "postgresql") {
      return (
        <span><img src={postgresql} className="image-small rounded-circle me-2" /> {conn_type}</span>
      )
    } else if (conn_type === "mysql") {
      return (
        <span><img src={mysql} className="image-small rounded-circle me-2" /> {conn_type}</span>
      )
    } else {
      return (
        <span>{conn_type}</span>
      )
    }
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
            datum['active'] = this.renderActiveDataSource(obj.active)
            datum['action'] = this.editActionButton(obj.id)
            datum['date'] = obj.created_at
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
  render() {
    if (this.state.isRedirect) {
      return (
        <Redirect to={{
          pathname: '/datasource/new',
        }} />
      )
    }
    return (
      <Container fluid>
        <Card>
          <CardContent>
            <Row>
              <Col className="custom-table">
                <CustomTable
                  columns={[
                    { title: 'Name', field: 'name' },
                    { title: 'Type', field: 'connection_type' },
                    { title: 'Active', field: 'active' },
                    { title: 'Date', field: 'date' },
                    { title: '', field: 'action' }
                  ]}
                  data={this.state.tableData}
                  title=""
                  options={{
                    paginationType: "stepped",
                    showTitle: false,
                    searchFieldAlignment: 'left',
                    paging: false
                  }}
                  actions={[
                    {
                      icon: () => this.addActionButton(),
                      tooltip: 'Add New Data Source',
                      isFreeAction: true,
                      onClick: () => this.setState({ isRedirect: true })
                    }
                  ]}
                />
              </Col>
            </Row>
          </CardContent>
        </Card>
        <CustomModal
          title=""
          body={this.deleteConfirmation()}
          open={this.state.confirmation}
          handleCloseCallback={() => this.handleClose("confirmation")}
        />
      </Container>
    )
  }


}
export default DataSources;
