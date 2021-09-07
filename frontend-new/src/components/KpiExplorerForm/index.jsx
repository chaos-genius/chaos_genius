import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';

import Play from '../../assets/images/play-green.png';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';
//import Cancel from '../../assets/images/cancel.svg';

import '../../assets/styles/addform.scss';

import {
  getAllKpiExplorerForm,
  getAllKpiExplorerField,
  getAllKpiExplorerSubmit,
  getTestQuery
} from '../../redux/actions';

const datasettype = [
  {
    value: 'query',
    label: 'Query'
  },
  {
    value: 'table',
    label: 'Table'
  }
];

const aggregate = [
  { value: 'mean', label: 'Mean' },
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' }
];

// const operator = [
//   { value: '=', label: '=' },
//   { value: '+', label: '+' },
//   { value: '-', label: '-' },
//   { value: '/', label: '/' },
//   { value: '>', label: '>' },
//   { value: '<', label: '<' }
// ];
const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const KpiExplorerForm = ({ onboarding, setModal, setText }) => {
  const dispatch = useDispatch();

  const history = useHistory();
  const data = history.location.pathname.split('/');
  const connectionType = JSON.parse(localStorage.getItem('connectionType'));

  const [option, setOption] = useState({
    datasource: '',
    tableoption: '',
    metricOption: ''
  });

  //const [inputList, setInputList] = useState([]);
  const [formdata, setFormdata] = useState({
    kpiname: '',
    datasource: '',
    selectDatasource: '',
    dataset: 'table',
    tablename: '',
    query: '',
    metriccolumns: '',
    aggregate: '',
    datetimecolumns: '',
    addfilter: [],
    adddimentsions: []
  });

  const [errorMsg, setErrorMsg] = useState({
    kpiname: false,
    datasource: false,
    selectDatasource: false,
    dataset: false,
    tablename: false,
    query: false,
    metriccolumns: false,
    aggregate: false,
    datetimecolumns: false
  });

  const [dataset, setDataset] = useState({ value: 'Table', label: 'Table' });

  const [tableAdditional, setTableAdditional] = useState({
    tablefilter: false,
    tabledimension: false
  });

  const [datasourceid, setDataSourceId] = useState('');

  const {
    kpiFormLoading,
    kpiFormData,
    kpiFieldLoading,
    kpiField,
    testQueryData,
    kpiSubmitLoading,
    kpiSubmit
  } = useSelector((state) => state.kpiExplorer);

  useEffect(() => {
    dispatchGetAllKpiExplorerForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (kpiFormData) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFormData]);

  const dispatchGetAllKpiExplorerForm = () => {
    dispatch(getAllKpiExplorerForm());
  };
  useEffect(() => {
    if (testQueryData) {
      queryFieldList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testQueryData]);

  const queryFieldList = () => {
    var arr = [];
    if (testQueryData) {
      testQueryData &&
        testQueryData.data &&
        testQueryData.data.tables &&
        testQueryData.data.tables.query &&
        testQueryData.data.tables.query.table_columns.forEach((item) => {
          arr.push({
            label: item.name,
            value: item.name
          });
        });
    } else {
      arr = [];
    }
    setOption({ ...option, metricOption: arr });
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
    connectionType &&
      connectionType.find((item) => {
        if (item.name === type.connection_type) {
          textHtml = item.icon;
        }
        return '';
      });
    return (
      <>
        <span
          dangerouslySetInnerHTML={{ __html: textHtml }}
          className="datasource-svgicon"
        />
        {type.name}
      </>
    );
  };
  useEffect(() => {
    if (kpiSubmit && kpiSubmit.status === 'success' && onboarding !== true) {
      history.push('/kpiexplorer');
    } else if (
      kpiSubmit &&
      kpiSubmit.status === 'success' &&
      onboarding === true
    ) {
      setModal(true);
      setText('kpi');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSubmit]);

  const fieldData = () => {
    if (kpiFormData && kpiFormLoading === false) {
      var optionArr = [];
      kpiFormData &&
        kpiFormData.data.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
            label: <div className="optionlabel">{datasourceIcon(data)}</div>
          });
          setOption({ datasource: optionArr });
        });
    }
  };

  const formOption = (e) => {
    setDataSourceId(e.id);
    setFormdata({ ...formdata, datasource: e.id });
    setErrorMsg((prev) => {
      return {
        ...prev,
        datasource: false
      };
    });
  };

  useEffect(() => {
    const fetchData = () => {
      const data = {
        data_source_id: datasourceid,
        from_query: false,
        query: ''
      };
      dispatchGetAllExplorerFiled(data);
    };
    if (datasourceid !== '') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceid]);

  const dispatchGetAllExplorerFiled = (data) => {
    dispatch(getAllKpiExplorerField(data));
  };

  useEffect(() => {
    if (kpiField) {
      tableOption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiField, formdata.tablename]);

  const tableOption = () => {
    if (kpiField && kpiFieldLoading === false) {
      var optionArr = [];
      for (const [key] of Object.entries(kpiField.tables)) {
        optionArr.push({
          value: key,
          label: key
        });
      }
      setOption({
        ...option,
        tableoption: optionArr
      });
    }
  };

  // useEffect(() => {
  //   if (kpiField) {
  //     tableName();
  //   }
  //   if (option.tableoption) {
  //     console.log('Option :', option.tableoption.value);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [option.tableoption]);
  const tableName = (e) => {
    if (kpiField) {
      setErrorMsg({ tablename: false });
      var optionValueArr = [];
      for (const [key, value] of Object.entries(kpiField.tables)) {
        const valueData = key;
        if (key === valueData) {
          value.table_columns.forEach((data) => {
            optionValueArr.push({
              value: data.name,
              label: data.name
            });
          });

          setOption({ ...option, metricOption: optionValueArr });
        }
        setFormdata({ ...formdata, tablename: valueData });
      }

      // setFormdata({ ...formdata, tablename: e.value });
    }
  };

  const handleDataset = (e) => {
    setDataset(e);
    setOption({
      ...option,
      dataset: e.value,
      metricOption: []
    });
    setFormdata({
      ...formdata,
      dataset: e.value,
      metriccolumns: '',
      aggregate: '',
      datetimecolumns: ''
    });
  };
  const handleSubmit = () => {
    if (formdata.kpiname === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          kpiname: true
        };
      });
    }
    if (formdata.datasource === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          datasource: true
        };
      });
    }
    if (formdata.dataset === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          dataset: true
        };
      });
    }
    if (formdata.tablename === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          tablename: true
        };
      });
    }
    if (formdata.metriccolumns === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          metriccolumns: true
        };
      });
    }
    if (formdata.aggregate === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          aggregate: true
        };
      });
    }
    if (formdata.datetimecolumns === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          datetimecolumns: true
        };
      });
    }
    if (formdata.query === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          query: true
        };
      });
    }

    if (
      (formdata.kpiname &&
        formdata.datasource &&
        formdata.dataset &&
        formdata.tablename &&
        formdata.metriccolumns &&
        formdata.aggregate &&
        formdata.datetimecolumns) !== ''
    ) {
      const kpiInfo = {
        name: formdata.kpiname,
        is_certified: false,
        data_source: formdata.datasource,
        dataset_type: formdata.dataset,
        table_name: formdata.tablename,
        kpi_query: formdata.query,
        metric: formdata.metriccolumns,
        aggregation: formdata.aggregate,
        datetime_column: formdata.datetimecolumns,
        dimensions: formdata.adddimentsions,
        filters: formdata.addfilter
      };
      dispatchgetAllKpiExplorerSubmit(kpiInfo);
    }
  };

  const dispatchgetAllKpiExplorerSubmit = (kpiInfo) => {
    dispatch(getAllKpiExplorerSubmit(kpiInfo));
  };

  const onTestQuery = () => {
    const data = {
      data_source_id: datasourceid,
      from_query: true,
      query: formdata.query
    };
    dispatch(getTestQuery(data));
  };
  // const handleAddClick = () => {
  //   setInputList([...inputList, { country: '', operator: '', value: '' }]);
  // };

  // const handleRemoveClick = (index) => {
  //   const list = [...inputList];
  //   list.splice(index, 1);
  //   setInputList(list);
  // };

  // const handleInputChange = (e, index, name) => {
  //   if (name === 'value') {
  //     const { value } = e.target;
  //     const list = [...inputList];
  //     list[index][name] = value;
  //     setInputList(list);
  //   } else {
  //     const list = [...inputList];
  //     list[index][name] = e.value;
  //     setInputList(list);
  //   }
  // };
  if (kpiFormLoading) {
    return (
      <div className="loader">
        <div className="loading-text">
          <p>loading</p>
          <span></span>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className="form-group">
          <label>KPI Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name of your KPI"
            required
            onChange={(e) => {
              setFormdata({ ...formdata, kpiname: e.target.value });
              setErrorMsg((prev) => {
                return {
                  ...prev,
                  kpiname: false
                };
              });
            }}
          />
          {errorMsg.kpiname === true ? (
            <div className="connection__fail">
              <p>Enter KPI Name</p>
            </div>
          ) : null}
        </div>
        <div className="form-group">
          <label>Select Data Source*</label>
          <Select
            options={option.datasource}
            classNamePrefix="selectcategory"
            placeholder="Select Data Source"
            components={{ SingleValue: customSingleValue }}
            onChange={(e) => formOption(e)}
          />
          {errorMsg.datasource === true ? (
            <div className="connection__fail">
              <p>Select Data Source</p>
            </div>
          ) : null}
        </div>
        <div className="form-group">
          <label>Select Dataset Type*</label>
          <Select
            value={dataset}
            onChange={(e) => handleDataset(e)}
            options={datasettype}
            classNamePrefix="selectcategory"
            placeholder="Select Dataset Type"
            isOptionSelected
          />
          {errorMsg.dataset === true ? (
            <div className="connection__fail">
              <p>Select Dataset Type</p>
            </div>
          ) : null}
        </div>
        {dataset.value === 'query' ? (
          // for of for query
          <>
            <div className="form-group query-form">
              <label>Query *</label>
              <textarea
                placeholder="Enter Query"
                onChange={(e) => {
                  setFormdata({ ...formdata, query: e.target.value });
                  setErrorMsg((prev) => {
                    return {
                      ...prev,
                      query: false
                    };
                  });
                }}></textarea>
              {errorMsg.query === true ? (
                <div className="connection__fail query_fail">
                  <p>Enter Query</p>
                </div>
              ) : null}
              <div className="test-query-connection">
                <div className="test-query" onClick={() => onTestQuery()}>
                  <span>
                    <img src={Play} alt="Play" />
                    Test Query
                  </span>
                </div>
                <div>
                  {testQueryData && testQueryData?.msg === 'success' && (
                    <div className="connection__success">
                      <p>
                        <img src={Success} alt="Success" />
                        Test Connection Success
                      </p>
                    </div>
                  )}
                  {testQueryData && testQueryData?.msg === 'failed' && (
                    <div className="connection__fail">
                      <p>
                        <img src={Fail} alt="Failed" />
                        Test Connection Failed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </> // end of for query
        ) : (
          <div className="form-group">
            <label>Table Name *</label>
            <Select
              options={option.tableoption}
              classNamePrefix="selectcategory"
              placeholder="Select Table"
              onChange={(e) => tableName(e)}
            />

            {errorMsg.tablename === true ? (
              <div className="connection__fail">
                <p>Select Table Name</p>
              </div>
            ) : null}
          </div>
        )}
        <div>
          <div className="form-group">
            <label>Metric Columns *</label>
            <Select
              options={option.metricOption !== '' && option.metricOption}
              value={
                formdata.metriccolumns !== '' && {
                  label: formdata.metriccolumns,
                  value: formdata.metriccolumns
                }
              }
              classNamePrefix="selectcategory"
              placeholder="Select Metric Columns"
              onChange={(e) => {
                setFormdata({ ...formdata, metriccolumns: e.value });

                setErrorMsg((prev) => {
                  return {
                    ...prev,
                    metriccolumns: false
                  };
                });
              }}
            />
            {errorMsg.metriccolumns === true ? (
              <div className="connection__fail">
                <p>Select Metric Columns</p>
              </div>
            ) : null}
          </div>
          <div className="form-group">
            <label>Aggregate by *</label>

            <Select
              options={aggregate}
              value={
                formdata.aggregate !== ''
                  ? {
                      label: formdata.aggregate,
                      value: formdata.aggregate
                    }
                  : null
              }
              classNamePrefix="selectcategory"
              placeholder="Select Aggregate by"
              onChange={(e) => {
                setFormdata({ ...formdata, aggregate: e.value });
                setErrorMsg((prev) => {
                  return {
                    ...prev,
                    aggregate: false
                  };
                });
              }}
            />
            {errorMsg.aggregate === true ? (
              <div className="connection__fail">
                <p>Select Aggregate</p>
              </div>
            ) : null}
          </div>
          <div className="form-group">
            <label>Datetime Columns *</label>
            <Select
              options={option.metricOption !== '' && option.metricOption}
              value={
                formdata.datetimecolumns !== '' && {
                  label: formdata.datetimecolumns,
                  value: formdata.datetimecolumns
                }
              }
              classNamePrefix="selectcategory"
              placeholder="Select Datetime Columns"
              onChange={(e) => {
                setFormdata({ ...formdata, datetimecolumns: e.value });
                setErrorMsg((prev) => {
                  return {
                    ...prev,
                    datetimecolumns: false
                  };
                });
              }}
            />
            {errorMsg.datetimecolumns === true ? (
              <div className="connection__fail">
                <p>Select Date Time Columns</p>
              </div>
            ) : null}
          </div>
          {tableAdditional.tabledimension === true ? (
            <div className="form-group">
              <label>Dimensions</label>
              <Select
                isMulti
                options={option.metricOption !== '' && option.metricOption}
                classNamePrefix="selectcategory"
                closeMenuOnSelect="true"
                placeholder="Select Dimensions"
                // menuPlacement="top"
                onChange={(e) => {
                  setFormdata({
                    ...formdata,
                    adddimentsions: e.map((el) => el.value)
                  });
                }}
              />
            </div>
          ) : null}

          {/* {inputList && inputList.length !== 0 && (
            <div className="form-group">
              <label>Filters</label>
              {inputList.map((item, index) => {
                return (
                  <div className="multi-filter-selection">
                    <Select
                      options={option.metricOption}
                      classNamePrefix="selectcategory"
                      isSearchable={false}
                      closeMenuOnSelect="true"
                      placeholder="Country"
                      onChange={(e) => handleInputChange(e, index, 'country')}
                    />
                    <Select
                      options={operator}
                      classNamePrefix="selectcategory"
                      isSearchable={false}
                      closeMenuOnSelect="true"
                      placeholder="="
                      name="operator"
                      onChange={(e) => handleInputChange(e, index, 'operator')}
                    />
                    <input
                      className="form-control"
                      placeholder="France"
                      name="value"
                      onChange={(e) => handleInputChange(e, index, 'value')}
                    />
                    <img
                      src={Cancel}
                      alt="Cancel"
                      onClick={() => handleRemoveClick(index)}
                    />
                  </div>
                );
              })}
            </div>
          )} */}

          {/* add option form */}
          <div className="add-options-wrapper">
            {/* <div
              className="add-options"
              onClick={() =>
                // setTableAdditional({
                // ...tableAdditional,
                // tablefilter: true
                // })
                handleAddClick()
              }>
              <label>+ Add Filters</label>
            </div> */}

            {tableAdditional.tabledimension === false ? (
              <div
                className="add-options"
                onClick={() =>
                  setTableAdditional({
                    ...tableAdditional,
                    tabledimension: true
                  })
                }>
                <label> + Add Dimensions</label>
              </div>
            ) : null}
          </div>

          <div className="form-action">
            <button
              className={
                kpiSubmitLoading
                  ? 'btn black-button btn-loading'
                  : 'btn black-button'
              }
              onClick={() => {
                handleSubmit();
              }}>
              <div className="btn-spinner">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Loading...</span>
              </div>
              <div className="btn-content">
                {data[2] === 'edit' ? (
                  <span>Save Changes</span>
                ) : (
                  <span>Add KPI</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default KpiExplorerForm;
