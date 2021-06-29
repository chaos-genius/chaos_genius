
import React from "react";
import { Button, Container, Row, Col, Alert } from '@themesberg/react-bootstrap';
import {
  DialogContent, DialogContentText, DialogActions,
  Card, CardContent, Grid, FormControl,
  TextField, InputLabel, Typography
} from '@material-ui/core';


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'
import CustomModal from '../../components/CustomModal'
import CustomTabs from '../../components/CustomTabs'

import Api from '../../Service/Api'
import './../../assets/css/custom.css'

import postgresql from './../../assets/img/postgresql.png'
import mysql from './../../assets/img/mysql.png'

import { tab1Fields, renderInputFields, renderlogs } from './HelperFunction'
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import { LegendToggleOutlined } from "@material-ui/icons";
class DataSources extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showDefault: false,
      connectionTypes: [],
      connectionName: '',
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
      testConnection: '',
      testLogs: '',
      confirmation: false,
      deleteID: ''
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New DataSource</span>
    )
  }
  editActionButton = (id) => {
    return (
      <Button variant="white" className="m-1" onClick={() => this.setState({ confirmation: true, deleteID: id })}><FontAwesomeIcon icon={faTrashAlt} /></Button>
    )
  }
  handleClose = (key) => {
    this.setState({
      key: false
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
          confirmation:false,
          deleteID:''
        },() => {
          this.fetchConnection()
        })
      }).catch(error => {
        console.log(error);
      });
  }
  handleInputChange = (e, key) => {
    console.log(e.target)
    const value = e.target.value;
    const setObj = this.state.formData;

    setObj[key] = value

    this.setState(setObj);
    this.setState({
      formError: []
    })
  }
  handleNormalInputChange = (e, key) => {
    const value = e.target.value;
    const setObj = {};
    setObj[key] = value
    this.setState(setObj);
    this.setState({
      connectionNameError: '',
      formError: []
    })
  }
  handleBooleanChange = (e, key) => {
    const value = e.target.checked;
    const setObj = this.state.formData;

    setObj[key] = value

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
    const payload = {
      sourceForm: contexualForm,
      name: this.state.connectionName,
      connection_type: this.state.connection
    }
    if (!payload) return;


    let requestOptions = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: DEFAULT_HEADERS,
    };

    fetch(`${BASE_URL}api/connection/create`, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log("response", data);
        this.setState({ showDefault: false }, () => {
          this.fetchConnection()
        })
      }).catch(error => {
        console.log(error);
      });
  }

  createPayload = () => {
    const { formData, formError, validate, selectedConnection, connectionName, connectionNameError } = this.state;
    const setObj = formError;
    let payloadData = {};
    if (!connectionName) {
      this.setState({
        connectionNameError: "Please Enter Connection Name"
      })
      return
    }
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
      payloadData['sourceDefinitionId'] = selectedConnection
      payloadData['connectionConfiguration'] = formData
    }
    return payloadData;
  }


  handleTestConnection = () => {

    const contexualForm = this.createPayload();
    if (contexualForm) {
      // let finalData = submitData;

      let requestOptions = {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(contexualForm),
        redirect: 'follow'
        // mode: 'no-cors'
      };

      fetch(`${BASE_URL}api/connection/test`, requestOptions)
        .then(response => response.json())
        .then(data => {
          this.setState({
            testLogs: data.data.jobInfo.logs,
            testConnection: data.data.status
          })
        }).catch(error => {
          console.log(error)
        });


    }

  }
  deleteConfirmation = () => {
    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <Typography component="h4"> Are You sure want to delete?</Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="text-center">
          <Button variant="primary" onClick={this.deleteDataSource}>Yes</Button>
          <Button variant="default" onClick={() => this.handleClose("confirmation")}>cancel</Button>
        </DialogActions>
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

    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <Card className="mb-4">
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl variant="outlined" style={{ width: '100%' }}>
                      <InputLabel htmlFor="connectionName">Connection Name</InputLabel>
                      <TextField
                        error={(this.state.connectionNameError) ? (true) : (false)}
                        value={this.state.connectionName}
                        id="connectionName"
                        type="text"
                        variant="outlined"
                        onChange={(e) => this.handleNormalInputChange(e, "connectionName")}
                        helperText={this.state.connectionNameError}
                      />
                    </FormControl>
                  </Grid>
                  {((Object.keys(this.state.connectionTypes).length > 0)) ? (tab1Fields(this.state, this.handleAutoComplete, this.handleInputAutoComplete)) : ("")}
                  {(Object.keys(this.state.properties).length > 0) ? (renderInputFields(this.state, this.handleInputChange, this.handleBooleanChange)) : ("")}
                </Grid>
              </CardContent>
            </Card>
            {(this.state.testConnection === "failed" && this.state.testLogs) ? (renderlogs(this.state.testLogs)) : ("")}

          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="warning" onClick={this.handleTestConnection}>Test Connection</Button>
          <Button variant="primary" onClick={this.saveDataSource}>Submit</Button>
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
          handleCloseCallback={() => this.handleClose("showDefault")}
        />
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
