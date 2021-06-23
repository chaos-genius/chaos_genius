
import React from "react";
import { Button, Container, Row, Col, Alert } from '@themesberg/react-bootstrap';
import {
  DialogContent, DialogContentText, DialogActions,
  Card, CardContent, Grid, FormControl,
  TextField, InputLabel, Select
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faEdit } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'
import CustomModal from '../../components/CustomModal'
import CustomTabs from '../../components/CustomTabs'

import Api from '../../Service/Api'
import './../../assets/css/custom.css'

import postgresql from './../../assets/img/postgresql.png'
import mysql from './../../assets/img/mysql.png'

import * as dataSource from './data-source.json';

import { tab1Fields } from './HelperFunction'
class DataSources extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showDefault: false,
      connectionTypes: [],
      connection: '',
      connection_name: '',
      properties: [],
      connectionError: '',
      dataSource: '',
      dataSourceError: '',
      dbURI: '',
      dbURIError: '',
      tableData: []
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New DataSource</span>
    )
  }
  editActionButton = () => {
    return (
      <Button variant="white" className="m-1" onClick={() => this.setState({ showDefault: true })}><FontAwesomeIcon icon={faEdit} /></Button>
    )
  }
  handleClose = () => {
    this.setState({
      showDefault: false
    })
  }


  componentDidMount() {
    this.fetchConnection();
    this.fetchConnectionTypes();
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
    fetch('/api/connection')
      .then(response => response.json())
      .then(data => {
        const tabData = [];
        if (data?.data) {
          data.data.map((obj) => {
            const datum = {};
            datum['name'] = obj.name;
            datum['connection_type'] = this.renderConnectionType(obj.connection_type);
            datum['active'] = this.renderActiveDataSource(obj.active)
            datum['action'] = this.editActionButton()
            datum['date'] = obj.created_at
            tabData.push(datum);
          })
          this.setState({
            tableData: tabData
          })
        }
      });
  }
  handleInputChange = (e, key) => {
    console.log(e.target)
    const value = e.target.value;

    const setObj = {};

    setObj[key] = value
    this.setState(setObj);
    this.setState({
      connectionError: '',
      dataSourceError: '',
      dbURIError: ''
    })



  }
  filterProperties = () => {
    const { connectionTypes, connection } = this.state;
    // console.log("connectionTypes",connectionTypes)
    let renderData = [];
    if (Object.keys(connectionTypes).length > 0) {
      renderData = connectionTypes.filter((obj) => {
        return obj.name === connection
      })
    }
    if (Object.keys(renderData).length > 0) {
      this.setState({
        properties: renderData[0]['connectionSpecification'].properties
      })
    }
  }
  handleAutoComplete = (e, value) => {
    if (value?.name) {
      this.setState({
        connection: value.name,
      }, () => {
        this.filterProperties()
      })
    }
  }

  handleInputAutoComplete = (e, value) => {
    this.setState({
      connection_name: value
    })
  }

  fetchConnectionTypes = () => {

    // fetch(greeting)
    //   .then(response => response.json())
    //   .then(data => {
    //     this.setState({
    //       connectionTypes: data.data,
    //       connection: data.data[0]['value'],
    //       connection_name: data.data[0]['name']
    //     })
    //   });
    this.setState({
      connectionTypes: dataSource.data,
      connection: dataSource.data[0]['name'],
    }, () => {
      this.filterProperties()
    })
  }

  handleFormSubmit = () => {
    const { connection, dataSource, dbURI } = this.state;
    if (!connection) {
      this.setState({
        connectionError: "Please Select Connection Type"
      })
      return
    } else if (!dataSource) {
      this.setState({
        dataSourceError: "Please Enter DataSource Name"
      })
      return
    } else if (!dbURI) {
      this.setState({
        dbURIError: "Please Enter URL"
      })
      return
    }
    const data = {
      "name": dataSource,
      "connection_type": connection,
      "db_uri": dbURI
    }

    const apiService = new Api();
    apiService.post('/api/connection/', data).then((response) => {
      // <Alert onClose={() => { }}>This is a success alert — check it out!</Alert>
      this.setState({
        dataSource: '',
        dbURI: ''
      })
      this.handleClose();
      this.fetchConnection();
    }).catch((err) => {

    })




  }

  addModalContent = () => {
    const tabData = [{
      title: "Connect New",
      body: ((Object.keys(this.state.connectionTypes).length > 0) && Object.keys(this.state.properties).length > 0) ? (tab1Fields(this.state, this.handleAutoComplete, this.handleInputAutoComplete)) : ("")
    }, {
      title: "Upload Files",
      body: "Tab2"
    }
    ];


    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <CustomTabs tabs={tabData} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="primary" onClick={this.handleFormSubmit}>Add</Button>
        </DialogActions>
      </>
    )
  }

  render() {
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
                      tooltip: 'Add User',
                      isFreeAction: true,
                      onClick: () => this.setState({ showDefault: true })
                    }
                  ]}
                />
              </Col>
            </Row>
          </CardContent>
        </Card>
        <CustomModal
          title="Add New Data Source"
          body={this.addModalContent()}
          open={this.state.showDefault}
          handleCloseCallback={this.handleClose}
        />
      </Container>
    )
  }


}
export default DataSources;
