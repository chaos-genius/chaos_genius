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
export const overallMetricStatsCard = (cardData, kpidetails, loader, timeline) => {

    const aggregation = kpidetails.aggregation;
    const { grp1_metrics, grp2_metrics, impact } = cardData;

    const getClass = (agg) => {
        return agg === aggregation ? 'h3' : 'h4';
    }

    const grp1_metricsSumLength = (grp1_metrics?.sum)?(Math.floor(grp1_metrics.sum).toString().length):(0);
    const grp2_metricsSumLength = (grp2_metrics?.sum)?(Math.floor(grp2_metrics.sum).toString().length):(0);
    const impactSumLength = (impact?.sum)?(Math.floor(impact.sum).toString().length):(0);
    const sumLengthClass = (grp1_metricsSumLength > 5 || grp2_metricsSumLength > 5 || impactSumLength > 5)?("font-sm"):("");
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
                    <Typography component={getClass('sum')} variant={getClass('sum')} className="title">Sum</Typography>
                    <Typography component={getClass('mean')} variant={getClass('mean')} className="title">Mean</Typography>
                    <Typography component={getClass('count')} variant={getClass('count')} className="title">Count</Typography>
                    <Typography component={getClass('median')} variant={getClass('median')} className="title">Median</Typography>
                    <Typography component={getClass('max')} variant={getClass('max')} className="title">Max</Typography>
                    <Typography component={getClass('min')} variant={getClass('min')} className="title">Min</Typography>
                </div>
                <Grid container spacing={2} className="mb-2 graph-info-cards">
                    <Grid item xs={12} md={4} className="text-center">
                        <div className="min-height">
                            <Typography variant="h4" component="h4">Last {timeline}</Typography>
                        </div>
                        <Card className="metrics-card card-grey">
                            <CardContent>
                                <Grid container spacing={1} className="text-center">
                                    <Grid item xs={12}>
                                        <Typography component={getClass('sum')} variant={getClass('sum')} >{(grp1_metrics?.sum) ? (grp1_metrics.sum) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('mean')} variant={getClass('mean')} className="small fw-bold mt-2" >{(grp1_metrics?.mean) ? (parseFloat(grp1_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('count')} variant={getClass('count')} className="small fw-bold mt-2" >{(grp1_metrics?.count) ? (parseFloat(grp1_metrics.count).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('median')} variant={getClass('median')} className="small fw-bold mt-2" >{(grp1_metrics?.median) ? (parseFloat(grp1_metrics.median).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('max')} variant={getClass('max')} className="small fw-bold mt-2" >{(grp1_metrics?.max) ? (parseFloat(grp1_metrics.max).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('min')} variant={getClass('min')} className="small fw-bold mt-2" >{(grp1_metrics?.min) ? (parseFloat(grp1_metrics.min).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} className="text-center">
                        <div className="min-height">
                            <Typography variant="h4" component="h4">This {timeline}</Typography>
                        </div>
                        <Card className="metrics-card ">
                            <CardContent>
                                <Grid container spacing={1} className="text-center">
                                    <Grid item xs={12}>
                                        <Typography component={getClass('sum')} variant={getClass('sum')} >{(grp2_metrics?.sum) ? (grp2_metrics.sum) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('mean')} variant={getClass('mean')} className="small fw-bold mt-2" >{(grp2_metrics?.mean) ? (parseFloat(grp2_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('count')} variant={getClass('count')} className="small fw-bold mt-2" >{(grp2_metrics?.count) ? (parseFloat(grp2_metrics.count).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('median')} variant={getClass('median')} className="small fw-bold mt-2" >{(grp2_metrics?.median) ? (parseFloat(grp2_metrics.median).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('max')} variant={getClass('max')} className="small fw-bold mt-2" >{(grp2_metrics?.max) ? (parseFloat(grp2_metrics.max).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('min')} variant={getClass('min')} className="small fw-bold mt-2" >{(grp2_metrics?.min) ? (parseFloat(grp2_metrics.min).toFixed(2)) : ('--')}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4} className="text-center">
                        <div className="min-height">
                            <Typography variant="h4" component="h4">Difference</Typography>
                        </div>
                        <Card className="metrics-card ">
                            <CardContent>
                                <Grid container spacing={1} className="text-center">
                                    <Grid item xs={12}>
                                        <Typography component={getClass('sum')} variant={getClass('sum')} >
                                            {(impact?.sum) ? (renderImpact(impact.sum, true)) : ('--')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('mean')} variant={getClass('mean')} className="small fw-bold mt-2" >
                                            {(impact?.mean) ? (renderImpact(impact.mean, false)) : ('--')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('count')} variant={getClass('count')} className="small fw-bold mt-2" >
                                            {(impact?.count) ? (renderImpact(impact.count, false)) : ('--')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('median')} variant={getClass('median')} className="small fw-bold mt-2" >
                                            {(impact?.median) ? (renderImpact(impact.median, false)) : ('--')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('max')} variant={getClass('max')} className="small fw-bold mt-2" >
                                            {(impact?.max) ? (renderImpact(impact.max, false)) : ('--')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography component={getClass('min')} variant={getClass('min')} className="small fw-bold mt-2" >
                                            {(impact?.min) ? (renderImpact(impact.min, false)) : ('--')}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        )
    }
}
