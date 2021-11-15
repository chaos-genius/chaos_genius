import React, { useState } from 'react';

import Edit from '../../assets/images/disable-edit.svg';

const Textfield = ({
  element,
  type,
  handleInputChange,
  formData,
  setDsFormData,
  setEditedForm,
  path,
  child,
  textID,
  textError,
  enable,
  inputValues
}) => {
  const [enabled, setEnabled] = useState(true);
  const [editState, setEditState] = useState('');
  const [error, setError] = useState('');
  const onhandleInput = (e) => {
    if (enabled) {
      handleInputChange(child, element[0], e, path[2]);
    } else {
      setEditState(e.target.value);
    }
  };

  const onSaveInput = () => {
    if (editState !== '') {
      if (child !== '') {
        setDsFormData((prev) => {
          return {
            ...prev,
            [child]: {
              ...prev[child],
              [element[0]]: type === 'number' ? parseInt(editState) : editState
            }
          };
        });
      } else {
        setDsFormData((prev) => {
          return {
            ...prev,
            [element[0]]: type === 'number' ? parseInt(editState) : editState
          };
        });
      }
      if (path[2] === 'edit') {
        if (child !== '') {
          setEditedForm((prev) => {
            return {
              ...prev,
              [child]: {
                ...prev[child],
                [element[0]]:
                  type === 'number' ? parseInt(editState) : editState
              }
            };
          });
        } else {
          setEditedForm((prev) => {
            return {
              ...prev,
              [element[0]]: type === 'number' ? parseInt(editState) : editState
            };
          });
        }
      }
      setEnabled((prev) => !prev);
    } else {
      setError(`Please enter ${element[0]}`);
    }
  };

  const onCancel = () => {
    setError('');
    setEditState('');
    setEnabled((prev) => !prev);
  };
  const searchhref = (type) => {
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: type }}
          className="datasource-svgicon"
        />
      </>
    );
  };
  return (
    <div className="form-group">
      <label className="help-label">
        {element[1]?.title ? element[1]?.title : element[0]}{' '}
      </label>
      <div className="editable-field">
        <input
          type={element[1]?.['airbyte_secret'] ? 'password' : type}
          disabled={
            element[1]?.['airbyte_secret'] && path[2] === 'edit' && enabled
              ? true
              : false
          }
          className="form-control"
          // defaultValue={
          //   element[0] === 'replication_method'
          //     ? element[1]?.default
          //     : element[0] === 'port'
          //     ? element[1]?.default
          //     : ''
          // }
          value={
            element[1]?.['airbyte_secret'] && path[2] === 'edit'
              ? enabled
                ? inputValues
                : editState
              : inputValues
          }
          name={element[0]}
          onChange={(e) => {
            onhandleInput(e);
          }}
        />

        {element[1]?.['airbyte_secret'] &&
          path[2] === 'edit' &&
          (enabled ? (
            <button
              className="btn black-button"
              onClick={() => setEnabled((prev) => !prev)}>
              <img src={Edit} alt="Edit" />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                className="btn black-button"
                onClick={() => onSaveInput()}>
                <span>Save</span>
              </button>
              <button
                className="btn black-secondary-button"
                onClick={() => onCancel()}>
                <span>Cancel</span>
              </button>
            </>
          ))}
      </div>

      {element[1] && element[1].description && (
        <div className="channel-tip">
          <p>{searchhref(element[1].description)} </p>
        </div>
      )}
      {error && (
        <div className="connection__fail">
          <p>{error}</p>
        </div>
      )}
      {textError && (
        <div className="connection__fail">
          <p>{textError}</p>
        </div>
      )}
    </div>
  );
};

export default Textfield;
