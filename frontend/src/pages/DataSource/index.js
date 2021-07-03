
import React from "react";
import { Button, Container, Row, Col, Alert } from '@themesberg/react-bootstrap';
import {
  DialogContent, DialogContentText, DialogActions,
  Card, CardContent, Grid, FormControl,
  TextField, InputLabel, Typography, Accordion, AccordionSummary, AccordionDetails
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'
import CustomModal from '../../components/CustomModal'
import CustomTabs from '../../components/CustomTabs'

import Api from '../../Service/Api'
import './../../assets/css/custom.css'

import imgSuccess from './../../assets/img/imgSuccess.svg'
import postgresql from './../../assets/img/postgresql.png'
import mysql from './../../assets/img/mysql.png'

import { tab1Fields, renderInputFields, renderlogs } from './HelperFunction'
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
      testMessage: null,
      confirmation: false,
      deleteID: '',
      successModal:false
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
          confirmation: false,
          deleteID: ''
        }, () => {
          this.fetchConnection()
        })
      }).catch(error => {
        console.log(error);
      });
  }
  handleInputChange = (e, key) => {
    // console.log(e.target)
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
        formError: [],
        testLogs:'',
        testMessage:null
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
  renderSuccessModal = () =>{
    return(
      <div className="row">
        <div className="col-md-12 text-center">
          <img src={imgSuccess} alt="info" />
          <Typography component="h4" className="alert-modal-title mt-3">You have successfully Added a Data Source</Typography>
          <Typography component="h5" className="alert-modal-subtitle mt-1">Next step is to set up KPI definitions.</Typography>
          <div className="mb-4 mt-4">
            <a href="/kpi" ><span className="custom-primary-button custom-width mt-2 mb-3">Add KPI</span></a>
          </div>
        </div>
      </div>
    )
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
        // console.log("response", data);
        this.setState({ successModal:true,showDefault: false,formData:[],formError:[] }, () => {
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
            testMessage: data.data.message,
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
  renderLogsUI = () => {
    return (
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Logs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {renderlogs(this.state.testLogs)}
        </AccordionDetails>
      </Accordion>
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
                <Grid item xs={12} className="mt-4">
                  {this.state.testMessage !== null && (<div><strong>Connection Status:</strong> {this.state.testMessage}</div>)}
                </Grid>
              </CardContent>
            </Card>
            

            {(this.state.testConnection === "failed" && this.state.testLogs) ? (this.renderLogsUI()) : ("")}

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
                      tooltip: 'Add New Data Source',
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
        <CustomModal
          title=""
          body={this.renderSuccessModal()}
          open={this.state.successModal}
          handleCloseCallback={() => this.handleClose("successModal")}
        />
      </Container>
    )
  }


}
export default DataSources;
