
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp, faArrowDown, faArrowUp, faEdit, faEllipsisH, faExternalLinkAlt, faEye, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Col, Row, Nav, Card, Image, Button, Table, Dropdown, ProgressBar, Pagination, ButtonGroup } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes";


const ValueChange = ({ value, suffix }) => {
  const valueIcon = value < 0 ? faAngleDown : faAngleUp;
  const valueTxtColor = value < 0 ? "text-danger" : "text-success";

  return (
    value ? <span className={valueTxtColor}>
      <FontAwesomeIcon icon={valueIcon} />
      <span className="fw-bold ms-1">
        {Math.abs(value)}{suffix}
      </span>
    </span> : "--"
  );
};


export const RcaAnalysisTable = (props) => {
  const TableRow = (props) => {
    const { subgroup, g1_size, g1_agg, g1_count, g2_size, g2_agg, g2_count, impact } = props;

    return (
      <tr>
        {/* <td>
          <Card.Link href="#" className="text-primary fw-bold">{id}</Card.Link>
        </td> */}
        <td className="fw-bold">
          {/* <FontAwesomeIcon icon={sourceIcon} className={`icon icon-xs text-${sourceIconColor} w-30`} /> */}
          {subgroup}
        </td>
        <td>{g1_agg ? g1_agg : "--"}</td>
        <td>{g1_size ? g1_size : "--"}</td>
        <td>{g1_count ? g1_count : "--"}</td>
        <td>{g2_agg ? g2_agg : "--"}</td>
        <td>{g2_size ? g2_size : "--"}</td>
        <td>{g2_count ? g2_count : "--"}</td>
        {/* <td>
          <Row className="d-flex align-items-center">
            <Col xs={12} xl={3} className="px-0">
              <small className="fw-bold">{g2_size}%</small>
            </Col>
          </Row>
        </td> */}
        <td>
          <ValueChange value={impact} />
        </td>
      </tr>
    );
  };

  const headerRows = props.columns.map((header) => {
    return (
      <th key={header} className="border-0">{header}</th>
    )
  })

  return (
    <Card border="light" className="shadow-sm mb-4">
      <Card.Body className="pb-0">
        <div className="table-responsive" style={{'max-height': '500px', 'overflow-y': 'auto'}}>
        <Table responsive className="table-centered table-nowrap rounded mb-0">
          <thead className="thead-light">
            <tr>
              {headerRows}
            </tr>
          </thead>
          <tbody>
            {props.data.map(pt => <TableRow {...pt} />)}
          </tbody>
        </Table>
        </div>
      </Card.Body>
    </Card>
  );
};
