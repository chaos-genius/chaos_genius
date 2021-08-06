import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import Select from 'react-select';

import Play from '../../assets/images/play-green.png';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';
import GoogleSheet from '../../assets/images/googlesheets.svg';
import Postgre from '../../assets/images/postgre.svg';
import GoogleAnalytics from '../../assets/images/googleanalytics.svg';
import Amplitude from '../../assets/images/amplitude.svg';
import MySQL from '../../assets/images/mysql.svg';
import Cancel from '../../assets/images/cancel.svg';

import '../../assets/styles/addform.scss';

import {
  getAllKpiExplorerForm,
  getAllKpiExplorerField,
  getAllKpiExplorerSubmit,
  getTestQuery
} from '../../redux/actions';

const datasettype = [
  {
    value: 'Query',
    label: 'Query'
  },
  {
    value: 'Table',
    label: 'Table'
  }
];

const aggregate = [
  { value: 'mean', label: 'Mean' },
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' }
];

const customSingleValue = ({ data }) => (
  <div className="input-select">
    <div className="input-select__single-value">
      {data.icon && <span className="input-select__icon">{data.icon}</span>}
      <span>{data.label}</span>
    </div>
  </div>
);

const KpiExplorerForm = () => {
  const dispatch = useDispatch();

  const history = useHistory();
  const data = history.location.pathname.split('/');

  const [option, setOption] = useState({
    datasource: '',
    tableoption: '',
    metricOption: ''
  });

  const [formdata, setFormdata] = useState({
    kpiname: '',
    datasource: '',
    selectDatasource: '',
    dataset: 'Table',
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

  // const [queryAdditional, setQueryAdditional] = useState({
  //   queryfilter: false,
  //   querydimension: false
  // });

  const [datasourceid, setDataSourceId] = useState('');

  const {
    kpiFormLoading,
    kpiFormData,
    kpiFieldLoading,
    kpiField,
    testQueryData,
    kpiSubmitLoading
  } = useSelector((state) => state.kpiExplorer);

  useEffect(() => {
    dispatchGetAllKpiExplorerForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    fieldData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFormData]);

  const dispatchGetAllKpiExplorerForm = () => {
    dispatch(getAllKpiExplorerForm());
  };

  const fieldData = () => {
    if (!kpiFormLoading) {
      var optionArr = [];
      kpiFormData &&
        kpiFormData.forEach((data) => {
          optionArr.push({
            value: data.connection_type,
            id: data.id,
            label: (
              <div className="optionlabel">
                <img
                  src={
                    data.connection_type === 'Google Analytics'
                      ? GoogleAnalytics
                      : data.connection_type === 'Postgres'
                      ? Postgre
                      : data.connection_type === 'Google Sheets'
                      ? GoogleSheet
                      : data.connection_type === 'MySQL'
                      ? MySQL
                      : data.connection_type === 'Amplitude'
                      ? Amplitude
                      : ''
                  }
                  alt={data.connection_type}
                />
                {data.connection_type}
              </div>
            )
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
    tableOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiField]);

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

  const tableName = (e) => {
    setErrorMsg({ tablename: false });
    var optionValueArr = [];
    for (const [key, value] of Object.entries(kpiField.tables)) {
      const valueData = e.value.toLowerCase();
      if (key === valueData) {
        value.table_columns.forEach((data) => {
          optionValueArr.push({
            value: data.name,
            label: data.name
          });
        });
        setOption({ ...option, metricOption: optionValueArr });
      }
    }
    setFormdata({ ...formdata, tablename: e.value });
  };

  const handleDataset = (e) => {
    setDataset(e);
    setOption({ ...option, dataset: e.value });
    setFormdata({ ...formdata, dataset: e.value });
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
  const [inputList, setInputList] = useState([]);
  const handleAddClick = () => {
    setInputList([...inputList, { country: '', operator: '', value: '' }]);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  //  const handleInputChange = (e, index) => {
  //   const { name, value } = e.target;
  //   const list = [...inputList];
  //   list[index][name] = value;
  //   setInputList(list);
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
        {dataset.value === 'Query' ? (
          // for of for query
          <div>
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
                <div className="connection__fail">
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
          </div> // end of for query
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
              options={option.metricOption}
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
              options={option.metricOption}
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
                options={option.metricOption}
                classNamePrefix="selectcategory"
                closeMenuOnSelect="true"
                placeholder="Select Dimensions"
                // menuPlacement="top"
                onChange={(e) => setFormdata({ ...formdata, e })}
              />
            </div>
          ) : null}

          {inputList && inputList.length !== 0 && (
            <div className="form-group">
              <label>Filters</label>
              {inputList.map((item, index) => {
                return (
                  <div className="multi-filter-selection">
                    <Select
                      classNamePrefix="selectcategory"
                      isSearchable={false}
                      closeMenuOnSelect="true"
                      placeholder="Country"
                    />
                    <Select
                      classNamePrefix="selectcategory"
                      isSearchable={false}
                      closeMenuOnSelect="true"
                      placeholder="="
                    />
                    <Select
                      classNamePrefix="selectcategory"
                      isSearchable={false}
                      closeMenuOnSelect="true"
                      placeholder="France"
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
          )}

          {/* add option form */}
          <div className="add-options-wrapper">
            <div
              className="add-options"
              onClick={() =>
                // setTableAdditional({
                //   ...tableAdditional,
                //   tablefilter: true
                // })
                handleAddClick()
              }>
              <label>+ Add Filters</label>
            </div>

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
            <button className="btn black-button" onClick={() => handleSubmit()}>
              {kpiSubmitLoading ? (
                <>
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  {data[2] === 'edit' ? (
                    <span>Save Changes</span>
                  ) : (
                    <span>Add KPI</span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default KpiExplorerForm;
