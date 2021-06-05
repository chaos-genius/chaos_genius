import React from "react";
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import CustomTable from './../../components/CustomTable'

function previousSize(percentage) {
    // if (percentage > 0) {
    //     console.log("percentage", percentage)

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} xl={3} >
                <small className="fw-bold">{percentage}%</small>
            </Grid>
            <Grid item xs={12} xl={9} >
                <LinearProgress variant="determinate" value={percentage} />
            </Grid>
        </Grid>
    )
    // } else {
    //     return ("")
    // }
}

export const Housing = (props) => {
    const col = [
        { title: 'Subgroup Name', field: 'subgroup' },
        { title: 'Previous Avg', field: 'g1_agg' },
        { title: 'Previous Subgroup Size', field: 'g1_size' },
        { title: 'Current Avg', field: 'g2_agg' },
        { title: 'Current Subgroup Size', field: 'g2_size' },
        { title: 'Impact', field: 'impact' },
    ]

    const dataDump = props.tableData;

    dataDump.forEach((element) => {
        element.g1_agg = (element?.g1_agg) ? (element.g1_agg) : ("--")
        element.g1_size = (element.g1_size > 0) ? (previousSize(element.g1_size)) : ("--")
        element.g2_agg = (element?.g2_agg) ? (element.g2_agg) : ("--")
        element.g2_size = (element.g2_size > 0) ? (previousSize(element.g2_size)) : ("--")
    });


    return (
        <div className="custom-table">
            <CustomTable
                columns={col}
                data={dataDump}
                title=""
                options={{
                    paginationType: "normal",
                    showTitle: false,
                    searchFieldAlignment: 'left',
                    paging:false,
                    maxBodyHeight:500
                }}
            />
        </div>
    )

}
