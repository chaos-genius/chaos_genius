
import React from "react";
import {
    Grid, Card, CardContent, CardActions,
    Button, Typography, InputLabel, MenuItem,
    FormControl, Select, CircularProgress, TextField
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
        const { handleKpiChange, kpiData, kpiID } = this.props;
        return (
            <Card className="kpi-sidebar">
                <CardContent>
                    <Typography component="h4" className="sidebar-title">List of KPI’s (08)</Typography>
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
                                <Button variation="outline" color="primary" className={(kpiID == obj.id) ? ("btn-block custom-sidebar-button active") : ("btn-block custom-sidebar-button")} id={obj.id} onClick={(e) => handleKpiChange(e)}>{obj.name} {(kpiID == obj.id) ? (<span className="right-icon"><ChevronRight /></span>) : ("")}</Button>
                            </Grid>
                        )
                    })}

                </Grid>
            </Card>
        )
    }


}
export default SideBar;
