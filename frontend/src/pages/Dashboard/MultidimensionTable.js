
import React from "react";
import { Col, Row, ProgressBar } from '@themesberg/react-bootstrap';
import CustomTable from './../../components/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

class MultidimensionTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataCol: props.columnData,
            tableData: props.multiDimensionTableData,
            overlapData: props.overlapData,
            overlap:props.overlap
        }
    }


    render() {
// console.log("tableData",this.state.tableData)
const columns =[{ title: "Subgroup", field: 'string' },
    { title: "Full Impact", field: "impact_full_group" }, 
    { title: "Non Overlap Impact", field: 'impact_non_overlap' }, 
    { title: "Data points in group", field: 'indices_in_group' }, 
    { title: "Non overlapping data points", field: 'non_overlap_indices' }]

    const overLapTableCol = (this.state.overlap)?(this.state.dataCol):(columns);
    const tableData = (this.state.overlap)?(this.state.overlapData):(this.state.tableData);

console.log("overlap",this.state.overlap)
console.log("tableData",tableData)
console.log("dataCol",this.state.dataCol)
console.log("overlapData",this.state.overlapData)

        if (Object.keys(this.state.tableData).length > 0) {
            return (
                <div className="custom-table custom-multidimension-table">                    
                    <CustomTable
                        columns={overLapTableCol}
                        data={tableData}
                        title=""
                        options={{
                            paginationType: "stepped",
                            showTitle: false,
                            searchFieldAlignment: 'left',
                            search:false,
                            paging: false
                        }}
                    />
                </div>
            )
        } else {
            return null
        }
    }
}

export default MultidimensionTable;

