
import React from "react";
import { Col, Row, ProgressBar } from '@themesberg/react-bootstrap';
import CustomTable from './../../components/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

class MultidimensionTable extends React.Component {
    constructor(props) {
        super(props)
        // this.state = {
        //     dataCol: props.columnData,
        //     tableData: props.multiDimensionTableData,
        //     overlapData: props.overlapData,
        //     overlap:props.overlap
        // }
    }


    render() {
// console.log("tableData",this.state.tableData)
        if (Object.keys(this.props.tableData).length > 0) {
            return (
                <div className="custom-table custom-multidimension-table">                    
                    <CustomTable
                        columns={this.props.dataCol}
                        data={this.props.tableData}
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

