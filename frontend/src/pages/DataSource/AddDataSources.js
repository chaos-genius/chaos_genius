
import React from "react";
import { Button } from '@themesberg/react-bootstrap';
import {
    Card, CardContent, Grid, FormControl,
    TextField, InputLabel, Typography, Accordion, AccordionSummary, AccordionDetails,
    CircularProgress, Container
} from '@material-ui/core';

import './../../assets/css/custom.css'

import imgSuccess from './../../assets/img/imgSuccess.svg'

import { tab1Fields, renderInputFields, renderlogs } from './HelperFunction'
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import StepTabs from "../../components/StepTabs"
import BreadCrumb from "../../components/BreadCrumb"

import { ArrowBack } from "@material-ui/icons";


class AddDataSources extends React.Component {
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
            formData: {},
            validate: [],
            formError: [],
            testConnection: '',
            testLogs: '',
            testLoader: false,
            testMessage: null,
            confirmation: false,
            deleteID: '',
            successModal: false,
            submitLoader: false

        }
    }

    componentDidMount() {
        this.fetchConnectionTypes();
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
                connectionName: '',
                formData: {},
                formError: [],
                testLogs: '',
                testMessage: null
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
    renderSuccessModal = () => {
        return (
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
        this.setState({ submitLoader: true })
        fetch(`${BASE_URL}api/connection/create`, requestOptions)
            .then(response => response.json())
            .then(data => {
                this.setState({ successModal: true, showDefault: false, formData: [], formError: [], submitLoader: false });
                this.props.history.push('/datasource');
            }).catch(error => {
                this.setState({ submitLoader: false })
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
            this.setState({ testLoader: true })
            fetch(`${BASE_URL}api/connection/test`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        testLogs: data.data.jobInfo.logs,
                        testMessage: data.data.message,
                        testConnection: data.data.status,
                        testLoader: false
                    })
                }).catch(error => {
                    this.setState({ testLoader: false })
                    console.log(error)
                });


        }

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
    renderAppBar = () => {
        return (
            <Grid container spacing={2}>
                <Grid item xs={2} className="display-flex-center pl-0 pr-0">

                </Grid>
                <Grid item xs={8} className="text-center">
                    <StepTabs index={0} />
                </Grid>
            </Grid>
        )
    }

    render() {
        return (
            <>
                <div className="custom-nav-appbar">
                    <BreadCrumb />
                    <Typography component="h4" className="breadcrumb-nav"><span className="mr-2"><ArrowBack />Add DataSource</span></Typography>
                </div>
                <Container maxWidth="md">
                    {this.renderAppBar()}
                    <Grid container spacing={3} justify="center">
                        <Grid item xs={6}>
                            <Card>
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
                                        <Grid item xs={12} className="mt-4">
                                            {this.state.testMessage !== null && (<div><strong>Connection Status:</strong> {this.state.testMessage}</div>)}
                                            {(this.state.testConnection === "succeeded") ? (<div><strong>Connection Status:</strong> Succeeded</div>) : ("")}
                                        </Grid>
                                    </Grid>
                                    {(this.state.testConnection === "failed" && this.state.testLogs) ? (this.renderLogsUI()) : ("")}
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} className="text-right">
                                            <Button variant="warning" onClick={this.handleTestConnection}>{
                                                (this.state.testLoader) ?
                                                    (<CircularProgress size={24} className="button-progress" />) :
                                                    (<>Test Connection</>)
                                            }</Button>
                                            <Button variant="primary" onClick={this.saveDataSource}>
                                                {
                                                    (this.state.submitLoader) ?
                                                        (<CircularProgress size={24} className="button-progress" />) :
                                                        (<>Submit</>)
                                                }</Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </>
        )
    }
}

export default AddDataSources;