
import React from "react";
import {
    Grid, Card, CardContent, CardActions,
    Button, Typography, InputLabel, MenuItem,
    FormControl, Select, CircularProgress, TextField
} from '@material-ui/core';
import { ChevronRight, LensTwoTone } from '@material-ui/icons';




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
        let { handleKpiChange, kpiData, kpiID, sidebarName } = this.props;
        if (!sidebarName) {
            sidebarName = "KPI";
        }
        return (
            <Card className="kpi-sidebar">
                <CardContent>
                    <Typography component="h4" className="sidebar-title">List of {sidebarName} ({kpiData.length})</Typography>
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
                <Grid container>
                    {kpiData.map((obj) => {
                        return (
                            <Grid item xs={12}>
                                <Button variation="outline" color="primary" className="btn-block custom-sidebar-button" id={obj.id} onClick={(e) => handleKpiChange(e, obj)}>
                                    {obj.name} {(kpiID == obj.id) ? (<span className="right-icon"><ChevronRight /></span>) : ("")}
                                </Button>
                            </Grid>
                        )
                    })}

                </Grid>
            </Card>
        )
    }


}
export default SideBar;
