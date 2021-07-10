
import React from "react";
import { Col, Row, ProgressBar } from '@themesberg/react-bootstrap';
import CustomTable from './../../components/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

class MultidimensionTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tableData: props.multiDimensionTableData,
        }
    }


    render() {
        const col = [{ title: "Subgroup", field: 'string' },
                    { title: "Full Impact", field: "impact_full_group" }, 
                    { title: "Non Overlap Impact", field: 'impact_non_overlap' }, 
                    { title: "Data points in group", field: 'indices_in_group' }, 
                    { title: "Non overlapping data points", field: 'non_overlap_indices' }]; 
// console.log("tableData",this.state.tableData)
        if (Object.keys(this.state.tableData).length > 0) {
            return (
                <div className="custom-table">
                    <CustomTable
                        columns={col}
                        data={this.state.tableData}
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

