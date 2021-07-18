
import React from "react";
import {
    Container, DialogContentText, DialogActions, ListItemText,
    Card, CardContent, CardActions, Grid, FormControl, FormControlLabel, Chip,
    TextField, Checkbox, InputLabel, Typography, Button, Select, MenuItem, Input
} from '@material-ui/core';
import StepTabs from "./../../components/StepTabs"
import BreadCrumb from "./../../components/BreadCrumb"
import { makeStyles, useTheme } from '@material-ui/core/styles';

import { ArrowBack } from "@material-ui/icons";
import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants';
import testQuery from './../../assets/img/test-query.svg'


class AddKpi extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // form variables
            kpiName: '',
            defination: false,
            dataSource: '',
            datasetType: 'table',
            tableName: '',
            query: '',
            metric: '',
            aggregate: 'mean',
            datetimeMetric: '',
            dimensionMetric: [],
            filters: [],

            // meta information
            dataSources: [],
            metaInformation: {},
            showTable: true,
            showQuery: false,
            tableNames: [],
            dateTimeColumns: [],
            metricColumns: [],

            // error variables
            kpiNameError: '',
            definationError: '',
            dataSourceError: '',
            queryError: '',
            metricError: '',
            aggregateError: '',
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
                if (this.state.datasetType === 'table') {
                    this.fethcMetaData();
                }
            });
        }
    }

    handleTablename = (e) => {
        const tableName = e.target.value;
        this.setState({
            tableName: tableName
        }, () => {
            this.extractColumns();
        });
    }

    handleDatasetType = (e) => {
        const datasetType = e.target.value;
        const stateInfo = this.resetState();
        if (datasetType === 'table') {
            stateInfo['showTable'] = true;
            stateInfo['showQuery'] = false;
            stateInfo['query'] = '';
            stateInfo['datasetType'] = datasetType;
        } else if (datasetType === 'query') {
            stateInfo['showTable'] = false;
            stateInfo['showQuery'] = true;
            stateInfo['table'] = '';
            stateInfo['datasetType'] = datasetType;
            this.setState(stateInfo);
        }
    }

    handleSubmit = () => {
        const { kpiName, kpiNameError, defination, definationError, dataSource,
            dataSourceError, query, queryError, metric, metricError, aggregate, aggregateError } = this.state
        // if (!kpiName) {
        //     this.setState({
        //         kpiNameError: "Please Enter KPI Name"
        //     })
        //     kpiNameError.focus()
        //     return
        // } else if (!defination) {
        //     this.setState({
        //         definationError: "Please Select Kpi Defination"
        //     })
        //     definationError.focus()
        //     return
        // } else if (!query) {
        //     this.setState({
        //         queryError: "Please Enter Table Name Or Query"
        //     })
        //     queryError.focus()
        //     return
        // }
        const kpiInfo = {
            name: this.state.kpiName,
            is_certified: this.state.defination,
            data_source: this.state.dataSource,
            dataset_type: this.state.datasetType,
            table_name: this.state.tableName,
            kpi_query: this.state.query,
            metric: this.state.metric,
            aggregation: this.state.aggregate,
            datetime_column: this.state.datetimeMetric,
            dimensions: this.state.dimensionMetric,
            filters: this.state.filters
        }
        this.saveKpi(kpiInfo);
    }

    saveKpi = (payload) => {
        console.log('--payload--', payload);
        let requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: DEFAULT_HEADERS,
        };
        fetch(`${BASE_URL}api/kpi/`, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.props.history.push('/kpi');
            }).catch(error => {
                console.log(error);
            });
    }

    fethcMetaData = () => {
        let payload = {
            data_source_id: this.state.dataSource,
            from_query: this.state.datasetType === 'table' ? false : true,
            query: this.state.query
        }

        let requestOptions = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: DEFAULT_HEADERS,
        };

        fetch(`${BASE_URL}api/connection/metadata`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data?.data) {
                    this.setMetaInformation(data.data);
                }
            }).catch(error => {
                console.log(error);
            });
    }

    setMetaInformation = (resultData) => {
        const fromTable = this.state.datasetType === 'table' ? true : false
        const stateInfo = this.resetState(fromTable);
        if (fromTable) {
            const tables = this.extractTables(resultData);
            stateInfo['metaInformation'] = resultData;
            stateInfo['tableNames'] = tables;
            this.setState(stateInfo);
        } else {
            const defaultTableName = 'query';
            stateInfo['metaInformation'] = resultData;
            stateInfo['tableNames'] = [defaultTableName];
            stateInfo['tableName'] = defaultTableName;
            this.setState(stateInfo, () => {
                this.extractColumns();
            });
        }
    }

    resetState = (resetQuery = true) => {
        const stateObj = {
            tableName: '',
            metric: '',
            datetimeMetric: '',
            dimensionMetric: [],
            filters: []
        };
        if (resetQuery) {
            stateObj['query'] = '';
        }
        return stateObj
    }

    extractTables = (metadata) => {
        let tables = [];
        for (let table in metadata.tables) {
            tables.push(table);
        }
        return tables;
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
        this.props.history.push('/kpi');
    }

    extractColumns = () => {
        const datetimeType = ['TIMESTAMP', 'DATE', 'TIME', 'DATETIME'];
        let metricColumns = [];
        let datetimeColumns = [];
        const columns = this.state.metaInformation.tables[this.state.tableName]['table_columns'];
        for (let column of columns) {
            metricColumns.push(column.name);
            // if (datetimeType.includes(column.type)) {
            //     datetimeColumns.push(column.name);
            // } else {
            //     metricColumns.push(column.name);
            // }
        }
        // show all options for metric in the datetime column too
        this.setState({
            dateTimeColumns: metricColumns,
            metricColumns: metricColumns
        });
        return;
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

        const { kpiName, kpiNameError, defination, definationError, dataSource,
            dataSourceError, query, queryError, metric, metricError, aggregate, aggregateError } = this.state;
        return (
            <>
                <div className="custom-nav-appbar">
                    <BreadCrumb />
                    <Button component="h4" href="/#/home" className="breadcrumb-nav btn btn-primary"><span className="mr-2"><ArrowBack />Add KPI</span></Button>
                </div>
                <Container maxWidth="md" >
                    {this.renderAppBar()}
                    <Grid container spacing={3} justify="center">
                        <Grid item xs={7}>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="kpiName">KPI Name *</InputLabel>
                                                <TextField
                                                    error={(kpiNameError) ? (true) : (false)}
                                                    value={kpiName}
                                                    id="kpiName"
                                                    type="text"
                                                    variant="outlined"
                                                    placeholder="Name of your KPI"
                                                    onChange={(e) => this.handleInputChange(e, "kpiName")}
                                                    helperText={kpiNameError}
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={defination}
                                                        onChange={(e) => this.handleInputChange(e, "defination")}
                                                        name="defination"
                                                        color="primary"
                                                    />
                                                }
                                                label="Is the KPI definition certified *"
                                                className="custom-checkbox"
                                            />
                                        </Grid>
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
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="dataset-type">Select Dataset Type *</InputLabel>
                                                <TextField
                                                    id="dataset-type"
                                                    select
                                                    value={this.state.datasetType}
                                                    onChange={(e) => this.handleDatasetType(e)}
                                                    variant="outlined"
                                                >
                                                    <MenuItem key="table" value="table">Table</MenuItem>
                                                    <MenuItem key="query" value="query">Query</MenuItem>
                                                </TextField>
                                            </FormControl>
                                        </Grid>

                                        {this.state.showTable && (
                                            <Grid item xs={12}>
                                                <FormControl variant="outlined" style={{ width: '100%' }}>
                                                    <InputLabel htmlFor="tableName">Table name</InputLabel>
                                                    <TextField
                                                        value={this.state.tableName}
                                                        id="tableName"
                                                        select
                                                        variant="outlined"
                                                        placeholder="Enter Table name"
                                                        onChange={(e) => this.handleTablename(e)}
                                                        helperText={queryError}
                                                    >
                                                        {this.state.tableNames.map((option) => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </FormControl>
                                            </Grid>
                                        )}

                                        {this.state.showQuery && (
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

                                        {/* { this.state.showQuery && (
                                    <Grid item xs={12}>
                                    </Grid>
                                    )} */}


                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="metric">Metric Column *</InputLabel>
                                                <TextField
                                                    value={this.state.metric}
                                                    id="metric"
                                                    select
                                                    variant="outlined"
                                                    placeholder="Enter Metric Column"
                                                    onChange={(e) => this.handleInputChange(e, "metric")}
                                                >
                                                    {this.state.metricColumns.map((option) => (
                                                        <MenuItem key={option} value={option}>
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="aggregate">Aggregate by *</InputLabel>
                                                <TextField
                                                    id="aggregate"
                                                    select
                                                    value={this.state.aggregate}
                                                    onChange={(e) => this.handleInputChange(e, "aggregate")}
                                                    SelectProps={{
                                                        native: true,
                                                    }}
                                                    error={(aggregateError) ? (true) : (false)}
                                                    helperText={aggregateError}
                                                    variant="outlined"
                                                >
                                                    <option key="mean" value="mean">Mean</option>
                                                    <option key="count" value="count">Count</option>
                                                    <option key="sum" value="sum">Sum</option>
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="datetimeMetric">Datetime Columns *</InputLabel>
                                                <TextField
                                                    value={this.state.datetimeMetric}
                                                    id="datetimeMetric"
                                                    select
                                                    variant="outlined"
                                                    placeholder="Enter Datetime Column"
                                                    onChange={(e) => this.handleInputChange(e, "datetimeMetric")}
                                                >
                                                    {this.state.dateTimeColumns.map((option) => (
                                                        <MenuItem key={option} value={option}>
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl variant="outlined" style={{ width: '100%' }}>
                                                <InputLabel htmlFor="dimensionMetric">Dimension Columns *</InputLabel>

                                                <Select
                                                    value={this.state.dimensionMetric}
                                                    id="dimensionMetric"
                                                    labelId="dimensionMetric"
                                                    variant="outlined"
                                                    multiple
                                                    value={this.state.dimensionMetric}
                                                    onChange={(e) => this.handleInputChange(e, "dimensionMetric")}
                                                    input={<Input id="select-multiple-chip" />}
                                                    renderValue={(selected) => (
                                                        <div style={{ display: 'flex', flexwrap: 'wrap' }}>
                                                            {selected.map((value) => (
                                                                <Chip key={value} label={value} style={{ margin: 2 }} />
                                                            ))}
                                                        </div>
                                                    )}
                                                // MenuProps={MenuProps}
                                                >
                                                    {this.state.metricColumns.map((option) => (

                                                        <MenuItem key={option} value={option}>
                                                            <Checkbox checked={this.state.dimensionMetric.indexOf(option) > -1} />
                                                            <ListItemText primary={option} />
                                                        </MenuItem>

                                                    ))}

                                                </Select>

                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Button className="pr-3 btn-simple-link">+ Add Filters</Button>
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} className="text-right">
                                            <Button variant="primary" onClick={this.handleSubmit} className="btn btn-primary">Add KPI</Button>
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

export default AddKpi;