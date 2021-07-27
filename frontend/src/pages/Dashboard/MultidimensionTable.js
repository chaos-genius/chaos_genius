
import React from "react";
import { Col, Row, ProgressBar } from '@themesberg/react-bootstrap';
import CustomTable from './../../components/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

class MultidimensionTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tableData: [],            
        }
    }
    ValueChange = (value) => {
        const valueIcon = value < 0 ? faAngleDown : faAngleUp;
        const valueTxtColor = value < 0 ? "text-danger" : "text-success";
        return (
            (value) ? (
                <span className={valueTxtColor}>
                    <FontAwesomeIcon icon={valueIcon} />
                    <span className="fw-bold ms-1">
                        {Math.abs(value)}
                    </span>
                </span>
            ) : ("--")
        );
    };

    render() {
        if (Object.keys(this.props.tableData).length > 0) {
            this.props.tableData.map((obj) => {
                if (obj?.impact_full_group) {
                    if(typeof obj.impact_full_group === "number"){
                        obj.impact_full_group = this.ValueChange(obj.impact_full_group)
                    }
                }
                if(obj?.impact_non_overlap){
                    if(typeof obj.impact_non_overlap === "number"){
                        obj.impact_non_overlap = this.ValueChange(obj.impact_non_overlap)
                    }
                }
                if(obj?.impact){
                    if(typeof obj.impact === "number"){
                        obj.impact = this.ValueChange(obj.impact)
                    }
                }
            })
        }

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
                            search: false,
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

