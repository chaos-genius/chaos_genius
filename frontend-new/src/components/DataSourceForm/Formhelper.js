import { v4 as uuidv4 } from 'uuid';

export const textBox = (
  element,
  type,
  handleInputChange,
  formData,
  formError
) => {
  const textID = element[0];
  const textError = formError?.[textID] ? formError[textID] : '';
  return (
    <div className="form-group" key={uuidv4()}>
      <label>{element[1]?.title ? element[1]?.title : element[0]}</label>
      <input
        type={element[1]?.['airbyte_secret'] ? 'password' : type}
        className="form-control"
        value={formData?.[textID] ? formData[textID] : ''}
        name={element[0]}
        onChange={(e) => handleInputChange(element[0], e)}
      />
      {textError && (
        <div className="connection__fail">
          <p>{textError}</p>
        </div>
      )}
    </div>
  );
};

export const checkBox = (element, type, handleInputChange, formData) => {
  const textID = element[0];
  return (
    <div className="form-check check-box" key={uuidv4()}>
      <input
        className="form-check-input"
        type={type}
        checked={formData[textID] ? formData[textID] : false}
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
  formError
) => {
  const { connectionSpecification } = obj;
  const { properties } = connectionSpecification;
  let fields = [];
  if (Object.keys(properties).length > 0) {
    Object.entries(properties).forEach((element) => {
      switch (element[1]['type']) {
        case 'string':
          fields.push(
            textBox(element, 'text', handleInputChange, formData, formError)
          );
          break;
        case 'integer':
          fields.push(
            textBox(element, 'number', handleInputChange, formData, formError)
          );
          break;
        case 'boolean':
          fields.push(
            checkBox(element, 'checkbox', handleCheckBoxChange, formData)
          );
          break;
        default:
          fields.push('');
      }
    });
  }
  return <>{fields}</>;
};
