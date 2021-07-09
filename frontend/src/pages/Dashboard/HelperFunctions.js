import React from "react";
import CustomTable from '../../components/CustomTable'
import {
    Card, CardContent, Typography, Grid, CircularProgress, FormControl, InputLabel, Select,
} from '@material-ui/core';

// import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faArrowDown, faArrowUp, faEdit, faEllipsisH, faExternalLinkAlt, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Table, ProgressBar } from '@themesberg/react-bootstrap';

// Am4charts
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_sunburst from "@amcharts/amcharts4/plugins/sunburst";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);
// function previousSize(percentage) {
//     // if (percentage > 0) {
//     //     console.log("percentage", percentage)

//     return (
//         <Grid container spacing={2}>
//             <Grid item xs={12} xl={3} >
//                 <small className="fw-bold">{percentage}%</small>
//             </Grid>
//             <Grid item xs={12} xl={9} >
//                 <LinearProgress variant="determinate" value={percentage} />
//             </Grid>
//         </Grid>
//     )
//     // } else {
//     //     return ("")
//     // }
// }

// export const Housing = (props) => {
//     const col = [
//         { title: 'Subgroup Name', field: 'subgroup' },
//         { title: 'Previous Avg', field: 'g1_agg' },
//         { title: 'Previous Subgroup Size', field: 'g1_size' },
//         { title: 'Current Avg', field: 'g2_agg' },
//         { title: 'Current Subgroup Size', field: 'g2_size' },
//         { title: 'Impact', field: 'impact' },
//     ]

//     const dataDump = props.tableData;

//     dataDump.forEach((element) => {
//         element.g1_agg = (element?.g1_agg) ? (element.g1_agg) : ("--")
//         element.g1_size = (element.g1_size > 0) ? (previousSize(element.g1_size)) : ("--")
//         element.g2_agg = (element?.g2_agg) ? (element.g2_agg) : ("--")
//         element.g2_size = (element.g2_size > 0) ? (previousSize(element.g2_size)) : ("--")
//     });


//     return (
//         <div className="custom-table">
//             <CustomTable
//                 columns={col}
//                 data={dataDump}
//                 title=""
//                 options={{
//                     paginationType: "normal",
//                     showTitle: false,
//                     searchFieldAlignment: 'left',
//                     paging:false,
//                     maxBodyHeight:500
//                 }}
//             />
//         </div>
//     )

// }


// function plotChart(chartData, amChart, yAxis, setamChart) {
//     console.log("yAxis", yAxis)

//     let chart = am4core.create("chartdivWaterfall", am4charts.XYChart);
//     if (amChart) {

//         amChart.data = chartData;
//         let valueAxis = amChart.yAxes.getIndex(0);
//         valueAxis.min = yAxis[0];
//         valueAxis.max = yAxis[1];
//     } else {
//         chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

//         // using math in the data instead of final values just to illustrate the idea of Waterfall chart
//         // a separate data field for step series is added because we don't need last step (notice, the last data item doesn't have stepValue)
//         chart.data = chartData;

//         let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
//         categoryAxis.dataFields.category = "category";
//         categoryAxis.renderer.minGridDistance = 40;

//         let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
//         if (yAxis.length > 0) {
//             valueAxis.min = yAxis[0];
//             valueAxis.max = yAxis[1];
//         }

//         let columnSeries = chart.series.push(new am4charts.ColumnSeries());
//         columnSeries.dataFields.categoryX = "category";
//         columnSeries.dataFields.valueY = "value";
//         columnSeries.dataFields.openValueY = "open";
//         columnSeries.fillOpacity = 0.8;
//         columnSeries.sequencedInterpolation = true;
//         columnSeries.interpolationDuration = 1500;

//         let columnTemplate = columnSeries.columns.template;
//         columnTemplate.strokeOpacity = 0;
//         columnTemplate.propertyFields.fill = "color";

//         let label = columnTemplate.createChild(am4core.Label);
//         label.text = "{displayValue.formatNumber('#,## a')}";
//         label.align = "center";
//         label.valign = "middle";
//         label.wrap = true;
//         label.maxWidth = 120;

//         let stepSeries = chart.series.push(new am4charts.StepLineSeries());
//         stepSeries.dataFields.categoryX = "category";
//         stepSeries.dataFields.valueY = "stepValue";
//         stepSeries.noRisers = true;
//         stepSeries.stroke = new am4core.InterfaceColorSet().getFor("alternativeBackground");
//         stepSeries.strokeDasharray = "3,3";
//         stepSeries.interpolationDuration = 2000;
//         stepSeries.sequencedInterpolation = true;

//         // because column width is 80%, we modify start/end locations so that step would start with column and end with next column
//         stepSeries.startLocation = 0.1;
//         stepSeries.endLocation = 1.1;

//         chart.cursor = new am4charts.XYCursor();
//         chart.cursor.behavior = "none";
//         setamChart(chart)
//     }
// }



// export const Housing = (props) => {
//     const { chartData, amChart, yAxis, setamChart } = props

//     return (
//         <Card className="mt-4">
//             <CardContent>
//                 <div id="chartdivWaterfall" style={{ width: "100%", height: "500px" }}></div>
//                 {plotChart(chartData, amChart, yAxis, setamChart)}
//             </CardContent>
//         </Card>
//     )
// }

function renderImpact(value, fixedNumber) {
    const valueIcon = value < 0 ? faAngleDown : faAngleUp;
    const valueTxtColor = value < 0 ? "text-danger" : "text-success";
    return (
        <span className={valueTxtColor}>
            <FontAwesomeIcon icon={valueIcon} />
            <span className="fw-bold ms-1">
                {(fixedNumber) ? (parseFloat(value).toFixed(2)) : (value)}
            </span>
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
            <Card className="custom-cardData">
                <div className="cardData-titles">
                    <Typography component="h4" className="title">Mean</Typography>
                    <Typography component="h4" className="title">Median</Typography>
                    <Typography component="h4" className="title">Max</Typography>
                    <Typography component="h4" className="title">Min</Typography>
                </div>
                <CardContent>                    
                    <Grid container spacing={2} className="mt-2 mb-2 graph-info-cards">
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">Last Month</Typography>
                                <Typography component="h6" variant="h6" className="small" >(Mar 1 to Mar 31)</Typography>
                            </div>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={1} className="text-center">
                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(grp1_metrics?.sum) ? (grp1_metrics.sum) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp1_metrics?.mean) ? (parseFloat(grp1_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp1_metrics?.median) ? (parseFloat(grp1_metrics.median).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp1_metrics?.max) ? (parseFloat(grp1_metrics.max).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp1_metrics?.min) ? (parseFloat(grp1_metrics.min).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>
                                    {/* <Typography component="h6" variant="h6" className="small"> Since last month <span className="danger-text"><ArrowDownwardIcon />28.4%</span></Typography> */}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">This Month</Typography>
                                <Typography component="h6" variant="h6" className="small" >(Mar 1 to Mar 31)</Typography>
                            </div>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={1} className="text-center">
                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(grp2_metrics?.sum) ? (grp2_metrics.sum) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp2_metrics?.mean) ? (parseFloat(grp2_metrics.mean).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp2_metrics?.median) ? (parseFloat(grp2_metrics.median).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp2_metrics?.max) ? (parseFloat(grp2_metrics.max).toFixed(2)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(grp2_metrics?.min) ? (parseFloat(grp2_metrics.min).toFixed(2)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>

                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4} className="text-center">
                            <div className="min-height">
                                <Typography variant="h4" component="h4">Difference</Typography>
                                <Typography component="h6" variant="h6" className="small" ></Typography>
                            </div>
                            <Card>
                                <CardContent>

                                    <Grid container spacing={1} className="text-center">

                                        <Grid item xs={12}>
                                            <Typography component="h3" variant="h3" >{(impact?.sum) ? (renderImpact(impact.sum)) : ('--')}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(impact?.mean) ? (renderImpact(impact.mean, false)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(impact?.median) ? (renderImpact(impact.median, true)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(impact?.max) ? (renderImpact(impact.max, true)) : ('--')}</Typography>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography component="h6" variant="h6" className="small fw-bold" >{(impact?.min) ? (renderImpact(impact.min, true)) : ('--')}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        )
    }
}
