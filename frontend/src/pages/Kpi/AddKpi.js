
import React from "react";
import {
    DialogContent, DialogContentText, DialogActions,
    Card, CardContent, CardActions, Grid, FormControl, FormControlLabel,
    TextField, Checkbox, InputLabel, Typography, Button
} from '@material-ui/core';
import StepTabs from "./../../components/StepTabs"
import BreadCrumb from "./../../components/BreadCrumb"

import { ArrowBack } from "@material-ui/icons";


class AddKpi extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            kpiName: '',
            kpiNameError: '',
            defination: false,
            definationError: '',
            dataSource: '',
            dataSourceError: '',
            query: '',
            queryError: '',
            metric: '',
            metricError: '',
            aggregate: '',
            aggregateError: ''

        }
    }

    handleInputChange = (e, key) => {
        const setObj = {}
        const value = (key === "defination") ? (e.target.checked) : (e.target.value);

        setObj[key] = value
        this.setState(setObj)
    }

    handleSubmit = () => {
        const { kpiName, kpiNameError, defination, definationError, dataSource,
            dataSourceError, query, queryError, metric, metricError, aggregate, aggregateError } = this.state
        if (!kpiName) {
            this.setState({
                kpiNameError: "Please Enter KPI Name"
            })
            kpiNameError.focus()
            return
        } else if (!defination) {
            this.setState({
                definationError: "Please Select Kpi Defination"
            })
            definationError.focus()
            return
        } else if (!query) {
            this.setState({
                queryError: "Please Enter Table Name Or Query"
            })
            queryError.focus()
            return
        }

    }
    renderAppBar = () => {
        return (
            <Grid container spacing={2}>
                <Grid item xs={2} className="display-flex-center pl-0 pr-0"> 
                    <Typography component="h4"><span className="mr-2"><ArrowBack />Add Kpi</span></Typography>
                </Grid>
                <Grid item xs={8} className="text-center">
                    <StepTabs index={1}/>
                </Grid>
            </Grid>
        )
    }
    render() {
        const { kpiName, kpiNameError, defination, definationError, dataSource,
            dataSourceError, query, queryError, metric, metricError, aggregate, aggregateError } = this.state;
        return (
            <>
                <BreadCrumb />

                {this.renderAppBar()}
                <Grid container spacing={3} justify="center">
                    <Grid item xs={6}>
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
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" style={{ width: '100%' }}>
                                            <InputLabel htmlFor="data-source">Select Data Source *</InputLabel>
                                            <TextField
                                                id="data-source"
                                                select
                                                value={dataSource}
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                error={(dataSourceError) ? (true) : (false)}
                                                onChange={(e) => this.handleInputChange(e, "dataSource")}
                                                helperText={dataSourceError}
                                                variant="outlined"
                                            >
                                                <option key="test" value="test">Test</option>
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" style={{ width: '100%' }}>
                                            <InputLabel htmlFor="query">Table name or Query *</InputLabel>
                                            <TextField
                                                error={(query) ? (true) : (false)}
                                                value={query}
                                                id="query"
                                                type="text"
                                                variant="outlined"
                                                placeholder="Enter Table name or Query"
                                                onChange={(e) => this.handleInputChange(e, "query")}
                                                helperText={queryError}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" style={{ width: '100%' }}>
                                            <InputLabel htmlFor="metric">Metric Column *</InputLabel>
                                            <TextField
                                                error={(metricError) ? (true) : (false)}
                                                value={metric}
                                                id="metric"
                                                type="text"
                                                variant="outlined"
                                                placeholder="Enter Metric Column"
                                                onChange={(e) => this.handleInputChange(e, "metric")}
                                                helperText={metricError}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl variant="outlined" style={{ width: '100%' }}>
                                            <InputLabel htmlFor="aggregate">Aggregate by *</InputLabel>
                                            <TextField
                                                id="aggregate"
                                                select
                                                value={aggregate}
                                                onChange={(e) => this.handleInputChange(e, "aggregate")}
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                error={(aggregateError) ? (true) : (false)}
                                                helperText={aggregateError}
                                                variant="outlined"
                                            >
                                                <option key="test" value="test">Test</option>
                                            </TextField>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Button color="default" className="pr-3">+ Add Filters</Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button color="default" className="pr-3"> + Add Dimensions</Button>
                                    </Grid>

                                </Grid>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} className="text-right">
                                        <Button variant="outlined" color="default" className="mr-3">Cancel</Button>
                                        <Button variant="contained" color="primary" onClick={this.handleSubmit}>Add KPI</Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </>
        )
    }
}

export default AddKpi;