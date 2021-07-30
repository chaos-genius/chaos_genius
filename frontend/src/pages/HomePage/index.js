
import React from "react";

import { Grid, Card, CardContent, Typography, Container, LinearProgress, Button } from '@material-ui/core'



import dataSource from './../../assets/img/homepage/datasources.svg'
import kpiActive from './../../assets/img/homepage/kpiActive.svg'
import dashboard from './../../assets/img/homepage/dashboard.svg'
import analytics from './../../assets/img/homepage/analytics.svg'

import successTick from './../../assets/img/homepage/success-tick.svg'

class Home extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Container className="home-page mt-4">
                <Grid container spacing={4}>
                    <Grid item xs={9} >
                        <Typography component="h2" className="main-title">Get Started with Chaos Genius setup</Typography>
                    </Grid>
                    <Grid item xs={3}  className="custom-progress-bar" >
                        <LinearProgress variant="determinate" value={0} />
                        <span>0% Completed</span>
                    </Grid>
                </Grid>
                <Grid container spacing={4} className="mt-4">
                    <Grid item xs={3} >
                        <Card className="setup-cards completed">
                            <CardContent className="text-left">
                                <img src={dataSource} alt="data-source" />
                                <Typography component="h4" className="title">Add Data Sources <img src={successTick} alt="tick-icon" /></Typography>
                                <Typography component="h4" className="sub-title mt-2">Select the Data Sources you want to add </Typography>
                                <Button variant="contained" color="primary" fullWidth={true} className="button-success mt-3">Add Data Source</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3} >
                        <Card className="setup-cards active">
                            <CardContent>
                                {/* <img src={kpi} alt="data-source" /> */}
                                <img src={kpiActive} alt="data-source" />
                                <Typography component="h4" className="title">Add KPI</Typography>
                                <Typography component="h4" className="sub-title mt-2">Define the KPIs you want to monitor and analyse</Typography>
                                <Button variant="contained" color="primary" fullWidth={true} className="button-active mt-3" >Add KPI</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3} >
                        <Card className="setup-cards">
                            <CardContent>
                                <img src={analytics} alt="data-source" />
                                <Typography component="h4" className="title">Activate Analytics</Typography>
                                <Typography component="h4" className="sub-title mt-2">Setup Anomaly Detection & AutoRCA for your KPIs</Typography>
                                <Button variant="contained" color="primary" fullWidth={true} disabled className="button-disabled mt-3">Activate Analytics</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={3} >
                        <Card className="setup-cards">
                            <CardContent>
                                <img src={dashboard} alt="data-source" />
                                <Typography component="h4" className="title">Setup Smart Alerts</Typography>
                                <Typography component="h4" className="sub-title mt-2">Setup Alerts to get notified on changes in events & KPIs</Typography>
                                <Button variant="contained" color="primary" fullWidth={true} disabled className="button-disabled mt-3">Setup Smart Alerts</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                    

                </Grid>
            </Container>
        )
    }


}
export default Home;
