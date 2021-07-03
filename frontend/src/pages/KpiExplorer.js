
import React from "react";
import { Col, Row, ProgressBar } from '@themesberg/react-bootstrap';
import CustomTable from './../components/CustomTable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

class KpiExplorer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: []
    }
  }

  progressBar = (size) => {
    return (
      <Row className="d-flex align-items-center">
        <Col xs={12} xl={12} className="px-0">
          <small className="fw-bold">{size}%</small>
        </Col>
        <Col xs={12} xl={12} className="px-0">
          <ProgressBar variant="primary" className="progress-lg mb-0" now={size} min={0} max={100} />
        </Col>
      </Row>
    )
  }
  ValueChange = (value) => {
    const valueIcon = value < 0 ? faAngleDown : faAngleUp;
    const valueTxtColor = value < 0 ? "text-danger" : "text-success";

    return (
      (value) ?
        (<span className={valueTxtColor}>
          <FontAwesomeIcon icon={valueIcon} />
          <span className="fw-bold ms-1">
            {Math.abs(value)}
          </span>
        </span>) : ("--")
    );
  };
  renderTableData = () => {
    const data = [
      {
        "id":1,
        "g1_agg": 5.45,
        "g1_count": 0,
        "g1_size": 68.3,
        "g2_agg": 4.91,
        "g2_count": 0,
        "g2_size": 42.6,
        "impact": -1.63,
        "subgroup": "housing = yes",        
      },
      {
        "id":2,
        "g1_agg": 4.25,
        "g1_count": 0,
        "g1_size": 31.7,
        "g2_agg": 4.92,
        "g2_count": 0,
        "g2_size": 57.4,
        "impact": 1.48,
        "subgroup": "housing = no",
        "parentId":1
      },
      {
        "id":3,
        "g1_agg": 6.55,
        "g1_count": 0,
        "g1_size": 40.8,
        "g2_agg": 4.79,
        "g2_count": 0,
        "g2_size": 30.4,
        "impact": -1.22,
        "subgroup": "education = tertiary & housing = yes",
        "parentId":1
      },
      {
        "id":4,
        "g1_agg": 4.37,
        "g1_count": 0,
        "g1_size": 26.9,
        "g2_agg": 5.0,
        "g2_count": 0,
        "g2_size": 46.5,
        "impact": 1.15,
        "subgroup": "housing = no & loan = no"
      },
      {
        "id":5,
        "g1_agg": 4.28,
        "g1_count": 0,
        "g1_size": 15.1,
        "g2_agg": 5.48,
        "g2_count": 0,
        "g2_size": 30.1,
        "impact": 1.0,
        "subgroup": "marital = married & housing = no"
      },
      {
        "id":6,
        "g1_agg": 4.11,
        "g1_count": 0,
        "g1_size": 24.0,
        "g2_agg": 5.11,
        "g2_count": 0,
        "g2_size": 37.8,
        "impact": 0.95,
        "subgroup": "education = tertiary & housing = no"
      },
      {
        "id":7,
        "g1_agg": 5.78,
        "g1_count": 0,
        "g1_size": 46.2,
        "g2_agg": 5.2,
        "g2_count": 0,
        "g2_size": 33.3,
        "impact": -0.93,
        "subgroup": "housing = yes & loan = no"
      },
      {
        "id":8,
        "g1_agg": 7.12,
        "g1_count": 0,
        "g1_size": 26.1,
        "g2_agg": 5.04,
        "g2_count": 0,
        "g2_size": 22.4,
        "impact": -0.73,
        "subgroup": "education = tertiary & housing = yes & loan = no"
      },
      {
        "id":9,
        "g1_agg": 4.42,
        "g1_count": 0,
        "g1_size": 13.0,
        "g2_agg": 5.79,
        "g2_count": 0,
        "g2_size": 22.4,
        "impact": 0.72,
        "subgroup": "marital = married & housing = no & loan = no"
      },
      {
        "id":10,
        "g1_agg": 6.12,
        "g1_count": 0,
        "g1_size": 17.2,
        "g2_agg": 4.38,
        "g2_count": 0,
        "g2_size": 7.7,
        "impact": -0.71,
        "subgroup": "marital = divorced & housing = yes"
      },
    ];

    const dataDump = [];
    data.map((obj) => {
      const dataum = {};
      dataum['id'] = obj.id;
      dataum['subgroup'] = obj.subgroup;
      dataum['g1_agg'] = obj.g1_agg;
      dataum['g1_count'] = obj.g1_count;
      dataum['g1_size'] = this.progressBar(obj.g1_size);
      dataum['g2_agg'] = obj.g2_agg;
      dataum['g2_count'] = obj.g2_count;
      dataum['g2_size'] = this.progressBar(obj.g2_size);
      dataum['impact'] = this.ValueChange(obj.impact);
      dataum['parentId'] = obj.parentId;
      dataDump.push(dataum);
    })

    this.setState({
      tableData:dataDump
    })

  }
  componentDidMount() {
    this.renderTableData();
  }

  render() {
    const col = [
              { title: 'Subgroup Name', field: 'subgroup' },
              { title: 'Previous Avg', field: 'g1_agg' },
              { title: 'Previous Subgroup Size', field: 'g1_size' },
              { title: 'Current Avg', field: 'g2_agg' },
              { title: 'Current Subgroup Size', field: 'g2_size' },
              { title: 'Impact', field: 'impact' },
          ];
    return (
      <CustomTable
        columns={col}
        data={this.state.tableData}
        title=""
        parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
        options={{
          paginationType: "stepped",
          showTitle: false,
          searchFieldAlignment: 'left',
          paging: false
        }}
      />
    )
  }
}

export default KpiExplorer;