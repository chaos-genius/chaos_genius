import React, { useState } from "react";

import {
    DialogContent, DialogContentText, DialogActions,
    Card,CardContent, FormControlLabel, Grid, FormControl,
    TextField, InputLabel, Checkbox
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

const renderTextField = (field, textType, formData, formError, handleInputChange) => {
    const textID = field[0];
    const textError = (formError?.[textID]) ? (formError[textID]) : ("")
    let inputProps = {};
    if (textType === "number") {
        inputProps['min'] = (field[1]?.['minimum']) ? (field[1]['minimum']) : ("0")
        inputProps['max'] = (field[1]?.['maximum']) ? (field[1]['maximum']) : ("")
    }
    inputProps['autoComplete'] = 'off'
    return (
        <Grid item xs={12}>
            <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor={textID} >{(field[1]?.['title']) ? (field[1]['title']) : (textID)}</InputLabel>
                <TextField
                    error={(textError) ? (true) : (false)}
                    value={(formData?.[textID]) ? (formData[textID]) : ("")}
                    id={textID}
                    type={(field[1]?.['airbyte_secret']) ? ("password") : (textType)}
                    variant="outlined"
                    onChange={(e) => handleInputChange(e, textID)}
                    helperText={textError}
                    inputProps={inputProps}
                />
            </FormControl>
        </Grid>
    )
}
const countryToFlag = (option) => {
    let textHtml = option.icon;
    return(
        <span>
            <span dangerouslySetInnerHTML={{ __html: textHtml }} className="datasource-svgicon" />
            {option.name}
        </span>
    )
}
const renderBooleanField = (field, textType, formData, formError, handleBooleanChange) => {
    const textID = field[0];
    const textError = (formError?.[textID]) ? (formError[textID]) : ("")
    return (
        <Grid item xs={12}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={(formData[textID]) ? (formData[textID]) : (false)}
                        onChange={(e) => handleBooleanChange(e, textID)}
                        name={textID}
                        color="primary"
                    />
                }
                label={(field[1]?.['title']) ? (field[1]['title']) : ("")}
                className="custom-checkbox"
            />
            {/* <FormControl variant="outlined" style={{ width: '100%' }}>
                <InputLabel htmlFor={textID} >{(field[1]?.['title']) ? (field[1]['title']) : ("")}</InputLabel>
                <TextField
                    error={(textError) ? (true) : (false)}
                    value={formData[textID]}
                    id={textID}
                    type={(field[1]?.['is_secret']) ? ("password") : (textType)}
                    variant="outlined"
                    onChange={(e) => handleInputChange(e, textID)}
                    helperText={textError}
                    inputProps={inputProps}
                />
            </FormControl> */}
        </Grid>
    )
}
export const renderInputFields = (props, handleInputChange, handleBooleanChange) => {
    const { properties, formData, formError } = props;
    let fields = [];
    if (Object.keys(properties).length > 0) {
        Object.entries(properties).forEach((obj) => {
            switch (obj[1]['type']) {
                case "string":
                    fields.push(renderTextField(obj, "text", formData, formError, handleInputChange))
                    break;
                case "integer":
                    fields.push(renderTextField(obj, "number", formData, formError, handleInputChange))
                    break;
                case "boolean":
                    fields.push(renderBooleanField(obj, "checkbox", formData, formError, handleBooleanChange))
                    break;
                default:
                    fields.push("");
            }
        })
    }
    return (
        <>
            {fields}
        </>
    )

}

export const tab1Fields = (props, handleAutoComplete, handleInputAutoComplete) => {
    const { connectionTypes, connection, connection_name } = props;
    return (
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
                    getOptionSelected={(option, value) => option.name === value}
                    renderOption={(option) => (
                        <React.Fragment>
                            <span>{countryToFlag(option)}</span>
                            {/* {(option?.name) ? (option.name) : ("")} */}
                        </React.Fragment>
                    )}
                    renderInput={(params) => (<TextField {...params} variant="outlined" inputProps={{...params.inputProps,autoComplete: 'new-password' }} />)}

                />
            </FormControl>
            {/* ) : ("")} */}
        </Grid>
    )
}
export const renderlogs = (logs) => {
    const logsfield = []

    logs.logLines.map((obj) => {
        logsfield.push(<p>{obj}</p>)
    })
    return (
        <>
            {logsfield}
        </>
    )
}