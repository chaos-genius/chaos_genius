
import React from "react";
import {
  Redirect
} from 'react-router-dom';
import { Button, Container, Row, Col, Alert } from '@themesberg/react-bootstrap';
import {  
  Card, CardContent
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import CustomTable from '../../components/CustomTable'

import postgresql from './../../assets/img/postgresql.png'
import mysql from './../../assets/img/mysql.png'


import { BASE_URL, DEFAULT_HEADERS } from '../../config/Constants'

class KpiList extends React.Component {

  constructor(props) {
    super(props)

    this.state = {      
      tableData: [
        {
          'name':'My SQL Demo',
          'data-source':'Google Analytics',
          'last-modified':'12/03/2020',
          'certified':'Yes',
          'owner':'Austin'
        }
      ], 
      isRedirect:false     
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New Data Source</span>
    )
  } 

  render() {
    if(this.state.isRedirect){
      return(
        <Redirect to={{
          pathname: '/kpi/new',
        }} />
      )
    }

    return (
      <Container fluid>
        <Card>
          <CardContent>
            <Row>
              <Col className="custom-table">
                <CustomTable
                  columns={[
                    { title: 'KPI Name', field: 'name' },
                    { title: 'Data Source', field: 'data-source' },
                    { title: 'Last Modified', field: 'last-modified' },
                    { title: 'Certified', field: 'certified' },
                    { title: 'Owner', field: 'owner' }
                  ]}
                  data={this.state.tableData}
                  title=""
                  options={{
                    paginationType: "stepped",
                    showTitle: false,
                    searchFieldAlignment: 'left',
                    paging: false
                  }}
                  actions={[
                    {
                      icon: () => this.addActionButton(),
                      tooltip: 'Add New Data Source',
                      isFreeAction: true,
                      onClick: () => this.setState({isRedirect:true})
                    }
                  ]}
                />
              </Col>
            </Row>
          </CardContent>
        </Card>
        
      </Container>
    )
  }


}
export default KpiList;
