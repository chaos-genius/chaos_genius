import React from "react";
import CustomTable from '../../components/CustomTable'
import {
    Card, CardContent, Typography, Grid, CircularProgress, FormControl, InputLabel, Select,
} from '@material-ui/core';

import {ArrowDropUp,ArrowDropDown} from '@material-ui/icons';

// Am4charts
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);


function renderImpact(value, fixedNumber) {
    const valueIcon = value < 0 ? <ArrowDropDown /> : <ArrowDropUp /> ;
    const valueTxtColor = value < 0 ? "text-danger" : "text-success";
    return (
        <span className={valueTxtColor}>            
            <span className="fw-bold ms-1">
                {(fixedNumber) ? (parseFloat(value).toFixed(2)) : (value)}
            </span>
            {valueIcon}
        </span>
    )
}
export const tab1Fields = (cardData, kpi, loader) => {

    const { grp1_metrics, grp2_metrics, impact } = cardData;


    if (loader) {
        return (
            <div className="loader">
                <CircularProgress color="secondary" />
            </div>
        )
    } else {
        return (
            <div className="custom-cardData">
                <div className="cardData-titles">
                    <Typography component="h4" className="title">Mean</Typography>
                    <Typography component="h4" className="title">Median</Typography>
                    <Typography component="h4" className="title">Max</Typography>
                    <Typography component="h4" className="title">Min</Typography>
                </div>
                {/* <CardContent>                     */}
                    <Grid container spacing={2} className="mb-2 graph-info-cards">
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">Last Month</Typography>
                                {/* <Typography component="h6" variant="h6" className="small" >(Mar 1 to Mar 31)</Typography> */}
                            </div>
                            <Card className="metrics-card card-grey">
                                <CardContent>
                                    <Grid container spacing={1} className="text-center">
                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(grp1_metrics?.sum) ? (grp1_metrics.sum) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp1_metrics?.mean) ? (parseFloat(grp1_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp1_metrics?.median) ? (parseFloat(grp1_metrics.median).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp1_metrics?.max) ? (parseFloat(grp1_metrics.max).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp1_metrics?.min) ? (parseFloat(grp1_metrics.min).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>
                                    {/* <Typography component="h6" variant="h6" className="small"> Since last month <span className="danger-text"><ArrowDownwardIcon />28.4%</span></Typography> */}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">This Month</Typography>
                                {/* <Typography component="h6" variant="h6" className="small" >(Mar 1 to Mar 31)</Typography> */}
                            </div>
                            <Card className="metrics-card ">
                                <CardContent>
                                    <Grid container spacing={1} className="text-center">
                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(grp2_metrics?.sum) ? (grp2_metrics.sum) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp2_metrics?.mean) ? (parseFloat(grp2_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp2_metrics?.median) ? (parseFloat(grp2_metrics.median).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp2_metrics?.max) ? (parseFloat(grp2_metrics.max).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(grp2_metrics?.min) ? (parseFloat(grp2_metrics.min).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">Difference</Typography>
                                {/* <Typography component="h6" variant="h6" className="small" ></Typography> */}
                            </div>
                            <Card className="metrics-card ">
                                <CardContent>
                                    <Grid container spacing={1} className="text-center">
                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(impact?.sum) ? (renderImpact(impact.sum)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(impact?.mean) ? (renderImpact(impact.mean, false)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(impact?.median) ? (renderImpact(impact.median, true)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(impact?.max) ? (renderImpact(impact.max, true)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold mt-2" >{(impact?.min) ? (renderImpact(impact.min, true)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                {/* </CardContent> */}
            </div>
        )
    }
}
