
import React from "react";
import {
    Container, DialogContentText, DialogActions, ListItemText, Divider, RadioGroup, Radio,
    Card, CardContent, CardActions, Grid, FormControl, FormControlLabel, Chip, Tooltip,
    TextField, Checkbox, InputLabel, Typography, Button, Select, MenuItem, Input
} from '@material-ui/core';
import StepTabs from "../../components/StepTabs"
import BreadCrumb from "../../components/BreadCrumb"
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { ArrowBack } from "@material-ui/icons";
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants';
import testQuery from './../../assets/img/test-query.svg'


class AddAlert extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // form variables
            alertName: '',
            defination: false,
            dataSource: '',
            kpiId: null,
            alertType: 'kpi_based',
            kpiAlertType: 'anomaly',
            query: '',
            alertMessage: '',
            metric: '',
            alertFrequency: 'daily',
            alertDestination: 'slack',
            datetimeMetric: '',
            dimensionMetric: [],
            filters: [],
            emailIds: '',

            // meta information
            dataSources: [],
            kpiList: [],
            metaInformation: {},
            showKpi: true,
            dateTimeColumns: [],
            metricColumns: [],

            // error variables
            definationError: '',
            dataSourceError: '',
            queryError: '',
            metricError: '',
        }

    }

    componentDidMount() {
        this.fetchConnection();
    }

    fetchConnection = () => {
        fetch(`${BASE_URL}/api/connection`)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    this.setState({
                        dataSources: data.data
                    })
                }
            });

        fetch(`${BASE_URL}/api/kpi`)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    this.setState({
                        kpiList: data.data
                    });
                }
            });

    }

    handleInputChange = (e, key) => {
        const setObj = {}
        const value = (key === "defination") ? (e.target.checked) : (e.target.value);

        setObj[key] = value
        this.setState(setObj);
    }

    handleDataSource = (e) => {
        const datasourceId = e.target.value;
        if (datasourceId) {
            this.setState({
                dataSource: datasourceId
            }, () => {
                if (this.state.alertType === 'kpi_based') {
                    this.fethcMetaData();
                }
            });
        }
    }

    handleAlertType = (e) => {
        const alertType = e.target.value;
        const stateInfo = {};
        if (alertType === 'kpi_based') {
            stateInfo['showKpi'] = true;
            stateInfo['query'] = '';
            stateInfo['alertType'] = alertType;
        } else if (alertType === 'event_based') {
            stateInfo['showKpi'] = false;
            stateInfo['table'] = '';
            stateInfo['alertType'] = alertType;
        }
        this.setState(stateInfo);
    }

    handleSubmit = () => {
        const { alertName, defination, definationError, dataSource, 
            dataSourceError, query, queryError, metric, metricError, alertFrequency } = this.state
        const kpiInfo = {
            name: this.state.alertName,
            is_certified: this.state.defination,
            data_source: this.state.dataSource,
            dataset_type: this.state.alertType,
            kpi_query: this.state.query,
            metric: this.state.metric,
            aggregation: this.state.alertFrequency,
            datetime_column: this.state.datetimeMetric,
            dimensions: this.state.dimensionMetric,
            filters: this.state.filters
        }
        // this.saveKpi(kpiInfo);
    }

    saveKpi = (payload) => {
        let requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: DEFAULT_HEADERS,
        };
        fetch(`${BASE_URL}api/kpi/`, requestOptions)
            .then(response => response.json())
            .then(data => {
                this.props.history.push('/kpi');
            }).catch(error => {
                console.log(error);
            });
    }


    handleTestAlert = () => {
        const alertInfo = {
            name: this.state.alertName,
            alertType: this.state.alertType,
            kpiId: this.state.kpiId,
            kpiAlertType: this.state.kpiAlertType,
            dataSource: this.state.dataSource,
            query: this.state.query,
            alertFrequency: this.state.alertFrequency,
            alertMessage: this.state.alertMessage,
            alertDestination: this.state.alertDestination
        }
        console.log(alertInfo);
        let requestOptions = {
            method: 'POST',
            body: JSON.stringify(alertInfo),
            headers: DEFAULT_HEADERS,
        };
        fetch(`${BASE_URL}api/config/test-alert`, requestOptions)
            .then(response => response.json())
            .then(data => {
                // this.props.history.push('/kpi');
                console.log('-------');
                console.log(data);
            }).catch(error => {
                console.log(error);
            });

    }


    fethcMetaData = () => {
        let payload = {
            data_source_id: this.state.dataSource,
            from_query: this.state.alertType === 'kpi_based' ? false : true,
            query: this.state.query
        }

        let requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: DEFAULT_HEADERS,
        };

        // fetch(`${BASE_URL}api/connection/metadata`, requestOptions)
        //     .then(response => response.json())
        //     .then(data => {
        //         if (data?.data) {
        //             this.setMetaInformation(data.data);
        //         }
        //     }).catch(error => {
        //         console.log(error);
        //     });
    }

    renderAppBar = () => {
        return (
            <Grid container spacing={2}>
                <Grid item xs={12} alignItems="center" className="text-center">
                    <StepTabs index={1} />
                </Grid>
            </Grid>
        )
    }

    goBacktoKpi = () => {
        this.props.history.push('/alert');
    }

    render() {
        const ITEM_HEIGHT = 48;
        const ITEM_PADDING_TOP = 8;
        const MenuProps = {
            PaperProps: {
                style: {
                    maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                    width: 250,
                },
            },
        };

        const { alertName, defination, definationError, dataSource,
            dataSourceError, query, queryError, metric, metricError, alertFrequency } = this.state;
        return (
            <>
                <div className="custom-nav-appbar">
                    <BreadCrumb />
                    <Button component="h4" href="/#/home" className="breadcrumb-nav btn btn-primary"><span className="mr-2"><ArrowBack />Add Alert</span></Button>
                </div>
                <Container maxWidth="md" >
                    <Grid container spacing={3} justify="center">
                        <Grid item xs={7}>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="alertName">Alert Name *</InputLabel>
                                                <TextField
                                                    value={alertName}
                                                    id="alertName"
                                                    type="text"
                                                    variant="outlined"
                                                    placeholder="Name of your Alert"
                                                    onChange={(e) => this.handleInputChange(e, "alertName")}
                                                />
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="alert-type">Select Alert Type *</InputLabel>
                                                <TextField
                                                    id="alert-type"
                                                    select
                                                    value={this.state.alertType}
                                                    onChange={(e) => this.handleAlertType(e)}
                                                    variant="outlined"
                                                >
                                                    <MenuItem key="kpi_based" value="kpi_based">KPI Based Alert</MenuItem>
                                                    <MenuItem key="event_based" value="event_based">Event Based Alert</MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>

                                        {this.state.showKpi && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="kpi-id">Select KPI *</InputLabel>
                                                    <TextField
                                                        id="kpi-id"
                                                        select
                                                        value={this.state.kpiId}
                                                        onChange={(e) => this.handleInputChange(e, "kpiId")}
                                                        variant="outlined"
                                                    >
                                                        {this.state.kpiList.map((option) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.name}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {this.state.showKpi && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="kpi-alert-type">Select KPI Alert Type *</InputLabel>
                                                    <TextField
                                                        id="kpi-alert-type"
                                                        select
                                                        value={this.state.kpiAlertType}
                                                        onChange={(e) => this.handleInputChange(e, "kpiAlertType")}
                                                        variant="outlined"
                                                    >
                                                        <MenuItem key="anomaly" value="anomaly">Anomaly</MenuItem>
                                                        <MenuItem key="static" value="static">Static Alert</MenuItem>
                                                    </TextField>
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {!this.state.showKpi && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="data-source">Select Data Source *</InputLabel>
                                                    <TextField
                                                        id="data-source"
                                                        select
                                                        value={this.state.dataSource}
                                                        onChange={(e) => this.handleDataSource(e)}
                                                        variant="outlined"
                                                    >
                                                        {this.state.dataSources.map((option) => (
                                                            <MenuItem key={option.id} value={option.id}>
                                                                {option.name}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {!this.state.showKpi && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="query">Query</InputLabel>
                                                    <TextField
                                                        error={(query) ? (true) : (false)}
                                                        value={this.state.query}
                                                        id="query"
                                                        type="text"
                                                        multiline
                                                        rows={4}
                                                        variant="outlined"
                                                        placeholder="Enter Query"
                                                        onChange={(e) => this.handleInputChange(e, "query")}
                                                        helperText={queryError}
                                                    />
                                                </FormControl>
                                                <Button color="seconday" onClick={this.fethcMetaData} style={{ justifyContent: 'center' }} className="btn-simple-link"><img src={testQuery} alt="test-icon" /> Test Query</Button>
                                            </Grid>
                                        )}

                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>


                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="alertFrequency">Alert Frequency *</InputLabel>
                                                <TextField
                                                    id="alertFrequency"
                                                    select
                                                    value={this.state.alertFrequency}
                                                    onChange={(e) => this.handleInputChange(e, "alertFrequency")}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    variant="outlined"
                                                >
                                                    <option key="daily" value="daily">Daily</option>
                                                    <option key="weekly" value="weekly">Weekly</option>
                                                    <option key="hourly" value="hourly">Hourly</option>
                                                </TextField>
                                            </FormControl>
                                        </Grid>


                                        {!this.state.showKpi && (
                                        <Grid item xs={12}>
                                            <FormControl component="fieldset">
                                                <InputLabel component="legend">Alert Settings</InputLabel>
                                                {/* <FormLabel component="legend">labelPlacement</FormLabel> */}
                                                <RadioGroup aria-label="position" name="position" defaultValue="top">
                                                    <Tooltip title="Always send the query result even without any change. Ideal for status updates">
                                                        <FormControlLabel
                                                        value="Always Send an Alert"
                                                        control={<Radio color="primary" />}
                                                        label="Always Send an Alert"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Alerts on all insertion/deletion/updation of the data">
                                                        <FormControlLabel
                                                        value="Send Alert on Changes"
                                                        control={<Radio color="primary" />}
                                                        label="Send Alert on Changes"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Alert only on the insertion of the new data row">
                                                        <FormControlLabel
                                                        value="Send Alert on Addition"
                                                        control={<Radio color="primary" />}
                                                        label="Send Alert on Addition"
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Send alert for all the entries if condition is true">
                                                        <FormControlLabel
                                                        value="Send Alert on Condition"
                                                        control={<Radio color="primary" />}
                                                        label="Send Alert on Condition"
                                                        />
                                                    </Tooltip>
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        )}
                                        <br/>

                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="alertMessage">Alert Message</InputLabel>
                                                <TextField
                                                    value={this.state.alertMessage}
                                                    id="alertMessage"
                                                    type="text"
                                                    multiline
                                                    rows={4}
                                                    variant="outlined"
                                                    placeholder="Enter Alert Message Body"
                                                    onChange={(e) => this.handleInputChange(e, "alertMessage")}
                                                />
                                            </FormControl>
                                        </Grid>


                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="alertDestination">Alert Destination *</InputLabel>
                                                <TextField
                                                    id="alertDestination"
                                                    select
                                                    value={this.state.alertDestination}
                                                    onChange={(e) => this.handleInputChange(e, "alertDestination")}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    variant="outlined"
                                                >
                                                    <option key="slack" value="slack">Slack</option>
                                                    <option key="email" value="email">Email</option>
                                                </TextField>
                                            </FormControl>
                                        </Grid>

                                        {this.state.alertDestination == 'email' && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="emailIds">Enter Email Addresses</InputLabel>
                                                    <TextField
                                                        value={this.state.emailIds}
                                                        id="emailIds"
                                                        type="text"
                                                        multiline
                                                        rows={2}
                                                        variant="outlined"
                                                        placeholder="Enter comma seperated email ID"
                                                        onChange={(e) => this.handleInputChange(e, "emailIds")}
                                                    />
                                                </FormControl>
                                            </Grid>
                                        )}

                                    </Grid>


                                    <Grid container spacing={3}>
                                        <Grid item xs={12} className="text-right">
                                            <Button variant="primary" onClick={this.handleTestAlert} className="btn btn-primary" style={{margin: '10px'}}>Test Alert</Button>
                                            <Button variant="primary" onClick={this.handleSubmit} className="btn btn-primary" style={{margin: '10px'}}>Add Alert</Button>
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

export default AddAlert;