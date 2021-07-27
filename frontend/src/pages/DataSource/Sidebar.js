
import React from "react";
import {
    Grid, Card, CardContent, CardActions,
    Button, Typography, InputLabel, FormControl,
    FormControlLabel, Checkbox, CircularProgress, TextField
} from '@material-ui/core';
import { ChevronRight } from '@material-ui/icons';




class SideBar extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            // kpiData: [],
            // loading: false
        }
    }


    // componentDidMount() {
    //     this.fetchKPIData();

    // }

    render() {
        // const {kpiData}=this.state;
        const { connectionTypes } = this.props;
        return (
            <Card className="kpi-sidebar">
                <CardContent>
                    <Typography component="h4" className="sidebar-title">Data Connection Name</Typography>
                    <FormControl variant="outlined" style={{ width: '100%' }}>
                        <TextField
                            // error={(kpiNameError) ? (true) : (false)}
                            // value={kpiName}
                            id="search"
                            type="text"
                            variant="outlined"
                            placeholder="Search"
                        // onChange={(e) => this.handleInputChange(e, "kpiName")}
                        // helperText={kpiNameError}
                        />
                    </FormControl>
                </CardContent>
                <Grid container className="pl-3 data-source-checkbox">
                    <Grid item xs={12}>
                        <Typography component="h4" className="sidebar-title">Data Source Type</Typography>
                    </Grid>
                    {connectionTypes.map((obj) => {
                        return (
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={false}
                                            // onChange={(e) => this.handleInputChange(e, "defination")}
                                            name="defination"
                                            color="primary"
                                        />
                                    }
                                    label={obj.name}
                                    className="custom-checkbox"
                                />
                                {/* <Button variation="outline" color="primary" className={(connectionTypesID == obj.id) ? ("btn-block custom-sidebar-button active") : ("btn-block custom-sidebar-button")} id={obj.id} onClick={(e) => handleKpiChange(e)}>{obj.name} {(connectionTypesID == obj.id) ? (<span className="right-icon"><ChevronRight /></span>) : ("")}</Button> */}
                            </Grid>
                        )
                    })}

                </Grid>
            </Card>
        )
    }


}
export default SideBar;
