export const textBox = (
  element,
  type,
  handleInputChange,
  formData,
  formError,
  path,
  child
) => {
  const textID = element[0];
  const textError = formError?.[textID] ? formError[textID] : '';
  return (
    <div className="form-group">
      <label>{element[1]?.title ? element[1]?.title : element[0]}</label>
      <input
        type={element[1]?.['airbyte_secret'] ? 'password' : type}
        disabled={
          element[1]?.['airbyte_secret'] && path[2] === 'edit' ? true : false
        }
        className="form-control"
        value={
          child !== ''
            ? formData?.[child]?.[textID]
            : formData?.[textID]
            ? formData[textID]
            : ''
        }
        name={element[0]}
        onChange={(e) => handleInputChange(child, element[0], e)}
      />
      {textError && (
        <div className="connection__fail">
          <p>{textError}</p>
        </div>
      )}
    </div>
  );
};

export const checkBox = (element, type, handleInputChange, formData, child) => {
  const textID = element[0];
  return (
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
    </div>
  );
};

export const renderTextFields = (
  obj,
  handleInputChange,
  handleCheckBoxChange,
  formData,
  formError,
  path
) => {
  var fields = [];
  toTextField(
    obj,
    handleInputChange,
    handleCheckBoxChange,
    formData,
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
