
import React from "react";
import {
    Grid, Card, CardContent, CardActions,
    Button, Typography, InputLabel, MenuItem,
    FormControl, Select, CircularProgress, TextField
} from '@material-ui/core';



class SideBar extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            kpiData: [],
            loading: false
        }
    }

    fetchKPIData = () => {
        this.setState({ loading: true })
        fetch('/api/kpi/')
            .then(response => response.json())
            .then(data => {
                this.setState({
                    kpiData: data.data,
                    loading: false
                })
            });
    }
    componentDidMount() {
        this.fetchKPIData();
    }

    render() {
        const {kpiData}=this.state;
        const {handleKpiChange} = this.props;
        return (
            <Card>
                <CardContent>
                    <Typography component="h4">List of KPI’s (08)</Typography>
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
                    {kpiData.map((kpi) => {
                        return (
                            //   <option key={kpi.id} value={kpi.id}>{kpi.name}</option>
                            <Grid item xs={12}>
                                <Button variation="outline" color="primary" className="btn-block" id={kpi.id} onClick={(e) => handleKpiChange(e)}>{kpi.name}</Button>
                            </Grid>
                        )
                    })}

                </Grid>
            </Card>
        )
    }


}
export default SideBar;
