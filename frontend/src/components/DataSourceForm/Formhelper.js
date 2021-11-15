import Textfield from './Textfield';

export const textBox = (
  element,
  type,
  handleInputChange,
  formData,
  setDsFormData,
  setEditedForm,
  formError,
  path,
  child
) => {
  const textID = element[0];
  const textError = formError?.[textID] ? formError[textID] : '';
  const enabled = element[1]?.['airbyte_secret'] && path[2] === 'edit';
  const inputValues =
    child !== ''
      ? formData?.[child]?.[textID]
      : formData?.[textID]
      ? formData[textID]
      : '';
  return (
    <Textfield
      element={element}
      type={type}
      handleInputChange={handleInputChange}
      formData={formData}
      setDsFormData={setDsFormData}
      setEditedForm={setEditedForm}
      path={path}
      child={child}
      textID={textID}
      textError={textError}
      enable={enabled}
      inputValues={inputValues}
    />
  );
};

export const checkBox = (
  element,
  type,
  handleInputChange,
  formData,
  setDsFormData,
  child
) => {
  const textID = element[0];
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
    <div className="check-box-tip">
      <div className="form-check check-box check-label">
        <input
          className="form-check-input"
          type={type}
          checked={
            child === ''
              ? formData?.[child]?.[textID]
              : formData[textID]
              ? formData[textID]
              : false
          }
          id="flexCheckDefault"
          onChange={(e) => handleInputChange(element[0], e)}
        />
        <label className="form-check-label" htmlFor="flexCheckDefault">
          {element[1]?.['title'] ? element[1]['title'] : ''}
        </label>
      </div>{' '}
      {element[1] && element[1]?.description && (
        <div className="channel-tip">
          <p>{searchhref(element[1]?.description)}</p>
        </div>
      )}
    </div>
  );
};

export const renderTextFields = (
  obj,
  handleInputChange,
  handleCheckBoxChange,
  formData,
  setDsFormData,
  setEditedForm,
  formError,
  path
) => {
  var fields = [];
  toTextField(
    obj,
    handleInputChange,
    handleCheckBoxChange,
    formData,
    setDsFormData,
    setEditedForm,
    formError,
    fields,
    path
  );
  return <>{fields}</>;
};

const toTextField = (
  obj,
  handleInputChange,
  handleCheckBoxChange,
  formData,
  setDsFormData,
  setEditedForm,
  formError,
  fields,
  path,
  child = ''
) => {
  const { properties } = obj;
  if (properties && Object.keys(properties).length > 0) {
    Object.entries(properties)
      .sort((a, b) => a[1].order - b[1].order)
      .forEach((element) => {
        renderObjectFields(
          element,
          handleInputChange,
          handleCheckBoxChange,
          formData,
          setDsFormData,
          setEditedForm,
          formError,
          fields,
          path,
          child
        );
      });
  }
};

const renderObjectFields = (
  element,
  handleInputChange,
  handleCheckBoxChange,
  formData,
  setDsFormData,
  setEditedForm,
  formError,
  fields,
  path,
  child
) => {
  switch (element[1]['type']) {
    case 'string':
      fields.push(
        textBox(
          element,
          'text',
          handleInputChange,
          formData,
          setDsFormData,
          setEditedForm,
          formError,
          path,
          child
        )
      );
      break;
    case 'integer':
      fields.push(
        textBox(
          element,
          'number',
          handleInputChange,
          formData,
          setDsFormData,
          setEditedForm,
          formError,
          path,
          child
        )
      );
      break;
    case 'boolean':
      fields.push(
        checkBox(
          element,
          'checkbox',
          handleCheckBoxChange,
          formData,
          setDsFormData,
          setEditedForm,
          path,
          child
        )
      );
      break;
    case 'object':
      toTextField(
        element[1],
        handleInputChange,
        handleCheckBoxChange,
        formData,
        setDsFormData,
        setEditedForm,
        formError,
        fields,
        path,
        element[0]
      );
      break;
    default:
      fields.push('');
  }
};
