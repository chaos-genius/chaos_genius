
import React from "react";
import { Button, Container, Row, Col, Card, Nav, Tab, Form } from '@themesberg/react-bootstrap';
import { DialogContent, DialogContentText, DialogActions } from '@material-ui/core';


import CustomTable from './../components/CustomTable'
import CustomModal from './../components/CustomModal'
import CustomTabs from './../components/CustomTabs'


import './../assets/css/custom.css'
class DataSources extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      showDefault: false
    }
  }


  addActionButton = () => {
    return (
      <span className="m-1 btn btn-tertiary" >New DataSource</span>
    )
  }
  editActionButton = () => {
    return (
      <Button variant="warning" className="m-1" onClick={() => this.setState({ showDefault: true })}>Manage DataSources</Button>
    )
  }
  handleClose = () => {
    this.setState({
      showDefault: false
    })
  }

  tab1Fields = () => {
    return (
      <Form>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Select Data Source</Form.Label>
              <Form.Control type="dataSource" placeholder="Name Your Data Source" />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Url</Form.Label>
              <Form.Control type="url" placeholder="SQL Alchemy URL" />
            </Form.Group>
          </Col>
          <Col>
            <Button variant="primary" className="mt-4">Test Connection</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Name Your Data Source</Form.Label>
              <Form.Control type="name" placeholder="Display Name" />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    )
  }


  addModalContent = () => {
    const tabData = [{
      title: "Connect New",
      body: this.tab1Fields()
    }, {
      title: "Upload Files",
      body: "Tab2"
    }
    ];


    return (
      <>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" component="span">
            <CustomTabs tabs={tabData} />
            {/* <Tab.Container defaultActiveKey="tab1">
              <Nav fill variant="pills" className="flex-column flex-sm-row">
                <Nav.Item>
                  <Nav.Link eventKey="tab1" className="mb-sm-3 mb-md-0">
                    Connect New
                </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="tab2" className="mb-sm-3 mb-md-0">
                    Upload Files
                </Nav.Link>
                </Nav.Item>
              </Nav>
              <Tab.Content>
                <Tab.Pane eventKey="tab1" className="py-4">
                  
                </Tab.Pane>
                <Tab.Pane eventKey="tab2" className="py-4">
                  <p>Tab2</p>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container> */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="primary" onClick={this.handleClose}>Add</Button>
        </DialogActions>
      </>
    )
  }

  render() {
    return (
      <Container fluid>
        <Card>
          <Card.Body>
            <Row>
              <Col className="custom-table">
                <CustomTable
                  columns={[
                    { title: 'Name', field: 'name' },
                    { title: 'Type', field: 'type' },
                    { title: '', field: 'action' }
                  ]}
                  data={[{ name: 'MySql Demo', type: 'mysql', action: this.editActionButton() }]}
                  title=""
                  options={{
                    paginationType: "stepped",
                    showTitle: false,
                    searchFieldAlignment: 'left',
                  }}
                  actions={[
                    {
                      icon: () => this.addActionButton(),
                      tooltip: 'Add User',
                      isFreeAction: true,
                      onClick: () => this.setState({ showDefault: true })

                    }
                  ]}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
        <CustomModal
          title="Add New Data Source"
          body={this.addModalContent()}
          open={this.state.showDefault}
          handleCloseCallback={this.handleClose}
        />
      </Container>
    )
  }


}
export default DataSources;
