
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

import { tab1Fields, renderInputFields } from './HelperFunction'
import { BASE_URL } from '../../config/Constants'
import { LegendToggleOutlined } from "@material-ui/icons";
class DataSources extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showDefault: false,
      connectionTypes: [],
      connection: '',
      connection_name: '',
      properties: [],
      selectedConnection: '',
      connectionError: '',
      dataSource: '',
      dataSourceError: '',
      dbURI: '',
      dbURIError: '',
      tableData: [],
      formData: {},
      validate: [],
      formError: [],
      testConnection: false,
      testLogs: ''
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
    const setObj = this.state.formData;
    // const setObj = {};

    // setObj[this.state.formData[key]] = value
    setObj[key] = value
    // console.log("key", key)
    // console.log("setObj", setObj)
    this.setState(setObj);
    this.setState({
      formError: []
    })



  }
  handleBooleanChange = (e, key) => {
    console.log(e.target)
    const value = e.target.checked;
    const setObj = this.state.formData;
    // const setObj = {};

    // setObj[this.state.formData[key]] = value
    setObj[key] = value
    // console.log("key", key)
    // console.log("setObj", setObj)
    this.setState(setObj);
    this.setState({
      formError: []
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
        properties: renderData[0]['connectionSpecification'].properties,
        validate: renderData[0]['connectionSpecification'].required,
        selectedConnection: renderData[0]['sourceDefinitionId']
      })
    }
  }
  handleAutoComplete = (e, value) => {
    console.log("value", value)
    if (value?.name) {
      this.setState({
        connection: value.name,
        formData: {},
        formError: []
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
    fetch(`${BASE_URL}/api/connection/types`)
      .then(response => response.json())
      .then(data => {
        const tabData = [];
        if (data?.data) {
          this.setState({
            connectionTypes: data.data,
            connection: data.data[0]['name'],
          }, () => {
            this.filterProperties()
          })
        }
      });

  }

  saveDataSource = () => {
    const contexualForm = this.createPayload();
    // TODO: Change the values
    const payload = {
      sourceForm: contexualForm,
      connectionName: 'Mysql Order Data',
      connectionType: 'mysql'
    }
    if (!payload) return;
    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload)
    };
    fetch(`${BASE_URL}api/connection/create`, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log("response", data);
        // TODO: Close the model and reload the connection list
      }).catch(error => {
        console.log(error);
    });
  }

  createPayload = () => {
    const { formData, formError, validate, selectedConnection } = this.state;
    const setObj = formError;
    if (Object.keys(validate).length > 0) {
      validate.map((obj) => {
        const textField = formData[obj]
        if (!textField) {
          setObj[obj] = "Please Enter " + obj;
        }
      })
      this.setState(setObj)
    }
    if (Object.keys(formError).length === 0) {
      let payloadData = {};
      payloadData['sourceDefinitionId'] = selectedConnection
      payloadData['connectionConfiguration'] = formData
    }
    return null;
  }


  handleTestConnection = () => {
    const { formData, formError, validate, selectedConnection } = this.state;
    const setObj = formError;
    // console.log("validate",validate)
    if (Object.keys(validate).length > 0) {
      validate.map((obj) => {
        const textField = formData[obj]
        if (!textField) {
          setObj[obj] = "Please Enter " + obj;
        }
      })
      this.setState(setObj)
    }
    if (Object.keys(formError).length === 0) {
      // console.log("setObj",setObj)
      // console.log("formError",formError)
      // console.log("formData",formData)
      let submitData = {};
      submitData['sourceDefinitionId'] = selectedConnection
      submitData['connectionConfiguration'] = formData

      // let finalData = submitData;
      let myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      myHeaders.append("Access-Control-Allow-Origin", "*");
      myHeaders.append("Access-Control-Allow-Credentials", true);
      let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(submitData),
        redirect: 'follow'
        // mode: 'no-cors'
      };

      fetch(`${BASE_URL}api/connection/test`, requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log("response", data)
          this.setState({
            testLogs: data.data.jobInfo.logs,
            testConnection: data.data.status
          })
        }).catch(error => {
          // this.setState({
          //   testLogs: demo,
          //   testConnection: false
          // })
        });
      // console.log("formData",JSON.stringify(formData))
      // console.log("finalData",finalData)
      // const apiService = new Api();
      // apiService.post(`${BASE_URL}api/connection/test`, finalData).then((response) => {
      //   this.setState({
      //     testLogs: response.data.jobInfo.logs,
      //     testConnection: response.data.status
      //   })
      //   // this.handleClose();
      // })

    }

  }
  renderlogs = (logs) => {
    const logsfield = []

    logs.map((obj) => {
      logsfield.push(<p>{obj}</p>)
    })
    return (
      <>
        {logsfield}
      </>
    )
  }
  addModalContent = () => {
    // const tabData = [{
    //   title: "Connect New",
    //   body: 
    // }, {
    //   title: "Upload Files",
    //   body: "Tab2"
    // }
    // ];

    // console.log("logLines",this.state.testLogs.logs['logLines'])
    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <Card className="mb-4">
              <CardContent>
                <Grid container spacing={3}>
                  {((Object.keys(this.state.connectionTypes).length > 0)) ? (tab1Fields(this.state, this.handleAutoComplete, this.handleInputAutoComplete)) : ("")}
                  {(Object.keys(this.state.properties).length > 0) ? (renderInputFields(this.state, this.handleInputChange, this.handleBooleanChange)) : ("")}
                </Grid>
                <pre>{(!this.state.testConnection && this.state.testLogs) ? (this.renderlogs(this.state.testLogs.logs['logLines'])) : ("")}</pre>
              </CardContent>
            </Card>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="primary" onClick={this.handleTestConnection}>Test Connection</Button>
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
