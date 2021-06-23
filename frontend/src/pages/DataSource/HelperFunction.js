import React from "react";

import {
    DialogContent, DialogContentText, DialogActions,
    Card, CardContent, Grid, FormControl,
    TextField, InputLabel, Select
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

const renderTextField = (field) => {
    return (
        <Grid item xs={12}>
            <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor="dbURI">{(field[1]?.['title'])?(field[1]['title']):("")}</InputLabel>
                <TextField
                    error={(field[0]+"_error") ? (true) : (false)}
                    value={field[0]}
                    id={field[0]}
                    type={(field[1]?.['is_secret'])?("password"):("text")}
                    variant="outlined"
                    // onChange={(e) => handleInputChange(e, "dbURI")}
                    // helperText={(dbURIError) ? (dbURIError) : ("")}
                />
            </FormControl>
        </Grid>
    )
}
const renderInputFields = (properties) => {
    let fields = [];
    if (Object.keys(properties).length > 0) {        
        Object.entries(properties).forEach((obj) => {
            console.log("objjj", obj)
            switch (obj[1]['type']) {
                case "string":
                    fields.push(renderTextField(obj))
                    break;
                default:
                    fields.push("");
            }
        })
    }
    console.log(fields)
    return (
        <div>
            {fields}
        </div>
    )

}

export const tab1Fields = (props, handleAutoComplete, handleInputAutoComplete) => {
    const { connectionTypes, connection, connection_name,properties } = props;
    const fields = renderInputFields(properties)
    return (
        <Card className="mb-4 chart-tab-card">
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {/* {(Object.keys(connectionTypes).length > 0 && connection) ? ( */}
                        <FormControl variant="outlined" style={{ width: '100%' }}>
                            {/* <div>{`value: ${connection !== null ? `'${connection}'` : 'null'}`}</div>
                        <div>{`inputValue: '${connection_name}'`}</div> */}
                            <InputLabel htmlFor="connectionTypes">Select Connection Type</InputLabel>
                            <Autocomplete
                                id="connectionTypes"
                                style={{ width: "100%" }}
                                options={connectionTypes}
                                autoHighlight
                                value={connection}
                                onChange={(e, newValue) => { handleAutoComplete(e, newValue) }}
                                inputValue={connection_name}
                                onInputChange={(e, newInputValue) => { handleInputAutoComplete(e, newInputValue) }}
                                getOptionLabel={(option) => (option?.name) ? (option.name) : (option)}
                                renderOption={(option) => (
                                    <React.Fragment>
                                        {(option?.name) ? (option.name) : ("")}
                                    </React.Fragment>
                                )}
                                renderInput={(params) => (<TextField {...params} variant="outlined" />)}
                            />
                        </FormControl>
                        {/* ) : ("")} */}
                    </Grid>

                    {fields}
                    {/* <Grid item xs={12}>
                <FormControl variant="outlined" style={{ width: '100%' }}>
                  <InputLabel htmlFor="dataSource">Name Data Source</InputLabel>
                  <TextField
                    error={(dataSourceError) ? (true) : (false)}
                    value={dataSource}
                    id="dataSource"
                    type="text"
                    variant="outlined"
                    onChange={(e) => this.handleInputChange(e, "dataSource")}
                    helperText={(dataSourceError) ? (dataSourceError) : ("")}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl variant="outlined" style={{ width: '100%' }}>
                  <InputLabel htmlFor="dbURI">URL</InputLabel>
                  <TextField
                    error={(dbURIError) ? (true) : (false)}
                    value={dbURI}
                    id="dbURI"
                    type="text"
                    variant="outlined"
                    onChange={(e) => this.handleInputChange(e, "dbURI")}
                    helperText={(dbURIError) ? (dbURIError) : ("")}
                  />
                </FormControl>
              </Grid>*/}
                </Grid>
                {/* <Row>
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
              </Row> */}
            </CardContent>
        </Card>
    )
}