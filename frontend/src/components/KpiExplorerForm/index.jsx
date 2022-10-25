import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useToast } from 'react-toast-wnm';
import { useDispatch, useSelector } from 'react-redux';
import Select, { components } from 'react-select';
import Modal from 'react-modal';

import Play from '../../assets/images/play-green.png';
import Success from '../../assets/images/success.svg';
import Fail from '../../assets/images/fail.svg';
import Close from '../../assets/images/close.svg';
import Add from '../../assets/images/add.svg';

import '../../assets/styles/addform.scss';
import { CustomContent, CustomActions } from '../../utils/toast-helper';
import {
  getAllKpiExplorerForm,
  getAllKpiExplorerSubmit,
  getSchemaAvailability,
  getTableListOnSchema,
  getTableinfoData,
  getTestQuery,
  getEditMetaInfo,
  getKpibyId,
  getUpdatekpi,
  getDashboard,
  getCreateDashboard
} from '../../redux/actions';
import { connectionContext } from '../context';
import './kpiexplorerform.scss';
import { getLocalStorage } from '../../utils/storage-helper';

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
  const limited = getLocalStorage('GlobalSetting');
  const toast = useToast();

  const history = useHistory();
  const data = history.location.pathname.split('/');

  const kpiId = useParams().id;

  const connectionType = useContext(connectionContext);
  const [option, setOption] = useState({
    datasource: '',
    tableoption: '',
    metricOption: '',
    schemaOption: '',
    datetime_column: '',
    dashboard: ''
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aggregate, setAggregate] = useState([]);

  const [formdata, setFormdata] = useState({
    kpiname: '',
    datasource: '',
    selectDatasource: '',
    dataset: 'table',
    tablename: '',
    schemaName: '',
    query: '',
    metriccolumns: '',
    aggregate: '',
    datetimecolumns: '',
    addfilter: [],
    dimensions: [],
    dashboardNameList: [],
    dashboardName: '',
    count_column: ''
  });

  const [editedFormData, setEditedFormData] = useState({});
  const [needForCleanup, setNeedForCleanUp] = useState({});

  const [errorMsg, setErrorMsg] = useState({
    kpiname: false,
    datasource: false,
    selectDatasource: false,
    dataset: false,
    tablename: false,
    schemaName: false,
    query: false,
    metriccolumns: false,
    aggregate: false,
    datetimecolumns: false,
    dimension: false,
    dashboardName: false,
    dashboardNameList: false,
    count_column: false
  });

  const [dataset, setDataset] = useState({ value: 'Table', label: 'Table' });

  const [tableAdditional, setTableAdditional] = useState({
    tablefilter: false,
    tabledimension: false
  });

  const [hasDruidDropDown, setHasDruidDropDown] = useState(false);
  const [datasourceid, setDataSourceId] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const {
    kpiFormLoading,
    kpiFormData,
    kpiFieldLoading,
    dataSourceHasSchema,
    schemaAvailabilityLoading,
    tableListOnSchemaLoading,
    tableListOnSchema,
    schemaNamesList,
    schemaListLoading,
    tableInfoLoading,
    kpiField,
    testQueryData,
    tableInfoData,
    kpiSubmitLoading,
    kpiSubmit,
    kpiMetaInfoData,
    kpiEditData,
    kpiUpdateLoading,
    kpiUpdateData,
    supportedAgg
  } = useSelector((state) => state.kpiExplorer);

  const { dashboardList } = useSelector((state) => state.DashboardHome);

  const { createDashboardLoading, createDashboard } = useSelector(
    (state) => state.DashboardHome
  );

  useEffect(() => {
    dispatchGetAllKpiExplorerForm();
    dispatchGetAllDashboard();
    dispatch(getEditMetaInfo());
    if (data[2] === 'edit') {
      dispatch(getKpibyId(kpiId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatchGetAllDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createDashboard]);

  const dispatchGetAllDashboard = () => {
    dispatch(getDashboard());
  };
  const CustomOption = (props) => {
    const { data, innerRef, innerProps } = props;
    if (data.value === 'Data Sync in Progress...') {
      return (
        <div ref={innerRef} {...innerProps} className="data-sync-cls">
          <span>{data.label}</span>
        </div>
      );
    }

    return <components.Option {...props} />;
  };

  useEffect(() => {
    if (kpiFormData && connectionType) {
      fieldData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiFormData, connectionType]);

  useEffect(() => {
    if (kpiEditData && data[2] === 'edit') {
      const obj = { ...formdata };
      obj['kpiname'] = kpiEditData?.name || '';
      obj['datasource'] = kpiEditData?.data_source;
      obj['dataset'] = kpiEditData?.kpi_type || '';
      obj['tablename'] = kpiEditData?.table_name || '';
      obj['schemaName'] = kpiEditData?.schema_name || '';
      obj['query'] = kpiEditData?.kpi_query || '';
      obj['metriccolumns'] = kpiEditData?.metric || '';
      obj['aggregate'] = kpiEditData?.aggregation || '';
      obj['datetimecolumns'] = kpiEditData?.datetime_column || '';
      obj['addfilter'] = kpiEditData?.filters || [];
      obj['dimensions'] = kpiEditData?.dimensions || [];
      obj['count_column'] = kpiEditData?.count_column || '';
      let arr = [];
      kpiEditData?.dashboards &&
        kpiEditData?.dashboards.map((data) =>
          arr.push({
            label: data.name,
            value: data.id
          })
        );
      obj['dashboardNameList'] = arr;
      setDataset({
        label: kpiEditData?.kpi_type,
        value: kpiEditData?.kpi_type
      });

      if (
        kpiEditData?.data_source !== null &&
        kpiEditData?.data_source !== undefined
      ) {
        if (option && option.datasource) {
          const foundIndex = option.datasource.find((item) => {
            return +kpiEditData.data_source === +item.id;
          });
          if (foundIndex && foundIndex.connection_type === 'Druid') {
            setHasDruidDropDown(true);
          }
        }
        setDataSourceId(kpiEditData?.data_source);
        if (kpiEditData?.schema_name) {
          dispatchGetTableListOnSchema({
            datasource_id: kpiEditData?.data_source,
            schema: kpiEditData?.schema_name
          });
        }
        if (kpiEditData?.table_name) {
          const obj = {
            datasource_id: kpiEditData?.data_source,
            schema: kpiEditData?.schema_name ? kpiEditData?.schema_name : null,
            table_name: kpiEditData?.table_name
          };
          dispatch(getTableinfoData(obj));
        }
        if (kpiEditData?.kpi_query) {
          const data = {
            data_source_id: kpiEditData?.data_source,
            from_query: true,
            query: kpiEditData?.kpi_query
          };
          dispatch(getTestQuery(data, true));
        }
      }

      setFormdata(obj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiEditData]);

  const dispatchGetAllKpiExplorerForm = () => {
    dispatch(getAllKpiExplorerForm({ paginate: false }));
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
        testQueryData.data.data &&
        testQueryData.data.data.tables &&
        testQueryData.data.data.tables.query &&
        testQueryData.data.data.tables.query.table_columns.forEach((item) => {
          arr.push({
            label: item.name,
            value: item.name
          });
          if (
            hasDruidDropDown &&
            item.name === 'count' &&
            formdata.count_column === ''
          ) {
            setFormdata({
              ...formdata,
              count_column: item.name
            });
          }
        });
    } else {
      arr = [];
    }
    setOption({ ...option, metricOption: arr });
  };

  useEffect(() => {
    if (dashboardList) {
      dashboardOptionList();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardList]);

  const dashboardOptionList = () => {
    let arr = [];
    if (limited?.is_ee) {
      arr.push({
        value: 'newdashboard',
        label: (
          <span className="add-dashboard">
            <img src={Add} alt="Add" />
            New Dashboard
          </span>
        )
      });
    }
    if (dashboardList) {
      dashboardList &&
        dashboardList.forEach((item) => {
          arr.push({
            label: item.name,
            value: item.id
          });
        });
    }
    setOption({ ...option, dashboard: arr });
  };

  const datasourceIcon = (type) => {
    let textHtml = '';
    connectionType &&
      connectionType.length !== 0 &&
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

  const customToast = (data) => {
    const { type, header, description } = data;
    toast({
      autoDismiss: true,
      enableAnimation: true,
      delay: type === 'success' ? '5000' : '30000',
      backgroundColor: type === 'success' ? '#effaf5' : '#FEF6F5',
      borderRadius: '6px',
      color: '#222222',
      position: 'bottom-right',
      minWidth: '240px',
      width: 'auto',
      boxShadow: '4px 6px 32px -2px rgba(226, 226, 234, 0.24)',
      padding: '17px 14px',
      height: 'auto',
      border: type === 'success' ? '1px solid #60ca9a' : '1px solid #FEF6F5',
      type: type,
      actions: <CustomActions />,
      content: (
        <CustomContent
          header={header}
          description={description}
          failed={type === 'success' ? false : true}
        />
      )
    });
  };

  useEffect(() => {
    if (kpiSubmit && kpiSubmit.status === 'success' && onboarding === true) {
      setModal(true);
      setText('kpi');
    } else if (
      kpiSubmit &&
      kpiSubmit.status === 'failure' &&
      onboarding === true
    ) {
      customToast({
        type: 'error',
        header: 'Failed to Add',
        description: kpiSubmit.error
      });
    }
    if (
      kpiUpdateData &&
      kpiUpdateData.status === 'success' &&
      onboarding !== true
    ) {
      customToast({
        type: 'success',
        header: 'Successfully updated',
        description: kpiUpdateData.message
      });
    } else if (
      kpiUpdateData &&
      kpiUpdateData.status === 'failure' &&
      onboarding !== true
    ) {
      customToast({
        type: 'error',
        header: 'Failed to update',
        description: kpiUpdateData.error
      });
    }
    if (kpiSubmit && kpiSubmit.status === 'success' && data[2] === 'add') {
      history.push('/kpiexplorer');
      customToast({
        type: 'success',
        header: 'Successfully Added'
      });
    } else if (
      kpiSubmit &&
      kpiSubmit.status === 'failure' &&
      data[2] === 'add'
    ) {
      customToast({
        type: 'error',
        header: 'Failed to Add',
        description: kpiSubmit.error
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiSubmit, kpiUpdateData]);

  useEffect(() => {
    if (
      testQueryData &&
      !testQueryData.isEditing &&
      testQueryData.data &&
      testQueryData.data?.status === 'success'
    ) {
      customToast({
        type: 'success',
        header: 'Test Connection Successful',
        description: testQueryData.data.msg
      });
    }
    if (
      testQueryData &&
      !testQueryData.isEditing &&
      testQueryData.data &&
      testQueryData.data?.status === 'failure'
    ) {
      customToast({
        type: 'error',
        header: 'Test Connection Failed',
        description: testQueryData.data.msg
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testQueryData]);

  const fieldData = () => {
    if (kpiFormData && kpiFormLoading === false) {
      var optionArr = [];
      kpiFormData &&
        kpiFormData.data.forEach((data) => {
          optionArr.push({
            value: data.name,
            id: data.id,
            connection_type: data.connection_type,
            label: <div className="optionlabel">{datasourceIcon(data)}</div>
          });
          setOption({ ...option, datasource: optionArr });
        });
    }
  };

  const formOption = (e) => {
    //Add extra dropDown column for Druid
    if (e.connection_type === 'Druid') {
      setHasDruidDropDown(true);
    } else {
      setHasDruidDropDown(false);
    }
    setDataSourceId(e.id);
    setFormdata({
      ...formdata,
      datasource: e.id,
      tablename: '',
      schemaName: '',
      query: '',
      metriccolumns: '',
      aggregate: '',
      datetimecolumns: '',
      dimensions: [],
      dashboardNameList: [],
      count_column: ''
    });
    setTableAdditional({
      ...tableAdditional,
      tabledimension: false
    });
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
      dispatchGetAvailability(data);
    };
    if (datasourceid !== '') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasourceid]);

  useEffect(() => {
    if (
      datasourceid &&
      tableListOnSchemaLoading === false &&
      tableListOnSchema &&
      tableListOnSchema.table_names
    ) {
      var optionArr = [];
      if (kpiFormData && kpiFormData.data && kpiFormData.data.length) {
        const datasourceIndex = kpiFormData.data.findIndex((datasource) => {
          return datasource.id === datasourceid;
        });
        if (datasourceIndex > -1) {
          if (
            kpiFormData.data[datasourceIndex]?.sync_status === 'In Progress'
          ) {
            optionArr.push({
              index: -1,
              value: 'Data Sync in Progress...',
              label: 'Data Sync in Progress...',
              isDisabled: true
            });
          }
        }
      }
      for (const [key, value] of Object.entries(
        tableListOnSchema.table_names
      )) {
        optionArr.push({
          index: key,
          value: value,
          label: value
        });
      }
      setOption({
        ...option,
        tableoption: optionArr
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableListOnSchema]);

  useEffect(() => {
    if (dataSourceHasSchema && schemaNamesList && schemaListLoading === false) {
      schemaNameOption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaNamesList]);

  const dispatchGetAvailability = (data) => {
    dispatch(getSchemaAvailability(data));
  };
  const dispatchGetTableListOnSchema = (data) => {
    dispatch(getTableListOnSchema(data));
  };

  useEffect(() => {
    if (kpiFieldLoading === true) {
      setOption({
        ...option,
        tableoption: [],
        metricOption: []
      });
    }
    if (kpiField) {
      tableOption();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiField]);

  const tableOption = () => {
    if (kpiField && kpiFieldLoading === false && kpiField?.tables) {
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

  const schemaNameOption = () => {
    if (schemaNamesList && schemaNamesList.data) {
      var optionArr = [];
      if (kpiFormData && kpiFormData.data && kpiFormData.data.length) {
        const datasourceIndex = kpiFormData.data.findIndex((datasource) => {
          return datasource.id === datasourceid;
        });
        if (datasourceIndex > -1) {
          if (
            kpiFormData.data[datasourceIndex]?.sync_status === 'In Progress'
          ) {
            optionArr.push({
              index: -1,
              value: 'Data Sync in Progress...',
              label: 'Data Sync in Progress...',
              isDisabled: true
            });
          }
        }
      }
      for (const [key, value] of Object.entries(schemaNamesList.data)) {
        optionArr.push({
          index: key,
          label: value,
          value: value
        });
      }
      setOption({
        ...option,
        tableoption:
          kpiEditData && data[2] === 'edit' ? option.tableoption : [],
        schemaOption: optionArr
      });
    }
  };

  useEffect(() => {
    setOption({
      ...option,
      schemaOption: [],
      tableoption: kpiEditData && data[2] === 'edit' ? option.tableoption : [],
      metricOption: kpiEditData && data[2] === 'edit' ? option.metricOption : []
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSourceHasSchema]);

  const schemaName = (e) => {
    setErrorMsg({ schemaName: false });
    if (e.value && datasourceid !== '') {
      dispatchGetTableListOnSchema({
        datasource_id: datasourceid,
        schema: e.value
      });
      setFormdata({
        ...formdata,
        schemaName: e.value,
        tablename: '',
        metriccolumns: '',
        aggregate: '',
        datetimecolumns: '',
        dimensions: [],
        count_column: ''
      });
      setEditedFormData({
        ...editedFormData,
        schema_name: e.value
      });
      if (kpiEditData?.schema_name !== e.value) {
        setNeedForCleanUp({ ...needForCleanup, schema_name: true });
      } else {
        const { schema_name, ...newItems } = needForCleanup;
        setNeedForCleanUp(newItems);
      }
    }
  };

  const tableName = (e) => {
    setErrorMsg({ tablename: false });
    const valueData = e.value;
    setFormdata({
      ...formdata,
      tablename: valueData,
      metriccolumns: '',
      aggregate: '',
      datetimecolumns: '',
      dimensions: [],
      count_column: ''
    });
    setEditedFormData({
      ...editedFormData,
      table_name: valueData
    });
    if (kpiEditData?.table_name !== e.value) {
      setNeedForCleanUp({ ...needForCleanup, table_name: true });
    } else {
      const { table_name, ...newItems } = needForCleanup;
      setNeedForCleanUp(newItems);
    }
    dispatchGetTableInfoData(valueData);
  };

  useEffect(() => {
    if (
      tableInfoLoading === false &&
      tableInfoData &&
      tableInfoData.table_info &&
      tableInfoData.table_info.columns
    ) {
      let optionArr = [];
      for (const [key, value] of Object.entries(
        tableInfoData.table_info.columns
      )) {
        optionArr.push({
          index: key,
          label: value.name,
          value: value.name
        });
        if (
          hasDruidDropDown &&
          value.name === 'count' &&
          formdata.count_column === ''
        ) {
          setFormdata({
            ...formdata,
            count_column: value.name
          });
        }
      }
      setOption({ ...option, metricOption: optionArr });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableInfoData]);

  const dispatchGetTableInfoData = (table) => {
    const obj = {
      datasource_id: datasourceid,
      schema: dataSourceHasSchema ? formdata.schemaName : null,
      table_name: table
    };
    dispatch(getTableinfoData(obj));
  };

  const handleDataset = (e) => {
    setDataset(e);
    setOption({
      ...option,
      dataset: e.value,
      metricOption: [],
      tableoption: dataSourceHasSchema ? [] : option.tableoption
    });
    setFormdata({
      ...formdata,
      dataset: e.value,
      metriccolumns: '',
      aggregate: '',
      datetimecolumns: '',
      dimensions: [],
      tablename: '',
      schemaName: '',
      dashboardNameList: [],
      count_column: ''
    });
    setEditedFormData({
      ...editedFormData,
      kpi_type: e.value
    });
    if (kpiEditData?.kpi_type !== e.value) {
      setNeedForCleanUp({ ...needForCleanup, kpi_type: true });
    } else {
      const { kpi_type, ...newItems } = needForCleanup;
      setNeedForCleanUp(newItems);
    }
    setTableAdditional({
      ...tableAdditional,
      tabledimension: false
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
    if (dataSourceHasSchema) {
      if (formdata.schemaName === '') {
        setErrorMsg((prev) => {
          return {
            ...prev,
            schemaName: true
          };
        });
      }
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
    if (hasDruidDropDown && formdata.count_column === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          count_column: true
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

    if (formdata.dashboardNameList.length === 0) {
      setErrorMsg((prev) => {
        return {
          ...prev,
          dashboardNameList: true
        };
      });
    }

    let present = formdata.dashboardNameList.some((val) => val.value === 0);

    if (!present && data[2] === 'edit') {
      customToast({
        type: 'error',
        header: 'KPI cannot be deleted from "All" dashboard'
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
        formdata.metriccolumns &&
        formdata.aggregate &&
        formdata.datetimecolumns) !== '' &&
      formdata.dashboardNameList.length !== 0 &&
      (hasDruidDropDown ? formdata.count_column : true)
    ) {
      const kpiInfo = {
        name: formdata.kpiname,
        is_certified: false,
        data_source: formdata.datasource,
        dataset_type: formdata.dataset,
        table_name: formdata.tablename,
        schema_name: formdata.schemaName,
        kpi_query: formdata.query,
        metric: formdata.metriccolumns,
        aggregation: formdata.aggregate,
        datetime_column: formdata.datetimecolumns,
        dimensions: formdata.dimensions,
        filters: formdata.addfilter,
        dashboards: formdata.dashboardNameList.map((el) => el.value)
      };

      if (hasDruidDropDown) {
        kpiInfo['count_column'] = formdata.count_column;
      }

      if (data[2] === 'edit' && present) {
        if (Object.keys(needForCleanup)?.length) {
          setEditModalOpen(true);
        } else {
          dispatch(getUpdatekpi(kpiId, editedFormData, customToast));
        }
      } else if (data[2] !== 'edit') {
        dispatchgetAllKpiExplorerSubmit(kpiInfo);
      }
    }
  };

  const dispatchgetAllKpiExplorerSubmit = (kpiInfo) => {
    dispatch(getAllKpiExplorerSubmit(kpiInfo, customToast));
  };

  const onTestQuery = () => {
    const data = {
      data_source_id: datasourceid,
      from_query: true,
      query: formdata.query
    };
    dispatch(getTestQuery(data));
    setFormdata({
      ...formdata,
      metriccolumns: '',
      aggregate: '',
      datetimecolumns: '',
      dimensions: [],
      count_column: ''
    });
    setEditedFormData({ ...editedFormData, dimensions: [] });
  };
  const closeModal = () => {
    setIsOpen(false);
  };

  const dashboardSubmit = () => {
    if (formdata.dashboardName === '') {
      setErrorMsg((prev) => {
        return {
          ...prev,
          dashboardName: true
        };
      });
    }
    if (formdata.dashboardName) {
      const dashboardData = {
        dashboard_name: formdata.dashboardName,
        kpi_list: []
      };
      dispatch(getCreateDashboard(dashboardData));
    }
  };

  useEffect(() => {
    if (createDashboard && createDashboard.status === 'success') {
      setIsOpen(false);
    }
  }, [createDashboard]);

  useEffect(() => {
    let filterList = [];
    if (kpiMetaInfoData && kpiMetaInfoData.fields) {
      const options = kpiMetaInfoData?.fields.find((field) => {
        return field.name === 'aggregation';
      })?.options;

      for (let i = 0; i < options.length; i++) {
        for (let j = 0; j < supportedAgg.length; j++) {
          if (options[i].value === supportedAgg[j]) {
            filterList.push(options[i]);
          }
        }
      }
      setAggregate(filterList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportedAgg]);

  useEffect(() => {
    if (kpiMetaInfoData && kpiMetaInfoData.fields) {
      const options = kpiMetaInfoData?.fields.find((field) => {
        return field.name === 'aggregation';
      })?.options;
      setAggregate(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpiMetaInfoData]);

  const editableStatus = (type) => {
    var status = false;
    kpiMetaInfoData &&
      kpiMetaInfoData?.fields?.find((field) => {
        if (field.name === type) {
          status = field.is_editable ? false : true;
        }
        return '';
      });
    return status;
  };

  const onEditData = (e, name) => {
    setEditedFormData({
      ...editedFormData,
      [name]: e
    });
    setFormdata({ ...formdata, dashboardNameList: e });
  };

  if (kpiFormLoading) {
    return (
      <div className="load">
        <div className="preload"></div>
      </div>
    );
  } else {
    return (
      <>
        <>
          <div className="form-group">
            <label>KPI Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Name of your KPI"
              required
              name="name"
              value={formdata.kpiname}
              disabled={data[2] === 'edit' ? editableStatus('name') : false}
              onChange={(e) => {
                setFormdata({ ...formdata, kpiname: e.target.value });
                setEditedFormData({
                  ...editedFormData,
                  [e.target.name]: e.target.value
                });
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
              value={
                option.datasource &&
                option.datasource.find((opt) => {
                  if (opt.id === formdata.datasource) {
                    return opt;
                  }
                  return null;
                })
              }
              isDisabled={
                data[2] === 'edit' ? editableStatus('data_source') : false
              }
              components={{
                SingleValue: customSingleValue
              }}
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
              options={datasettype}
              classNamePrefix="selectcategory"
              placeholder="Select Dataset Type"
              onChange={(e) => handleDataset(e)}
              isDisabled={
                data[2] === 'edit' ? editableStatus('kpi_type') : false
              }
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
                  value={formdata.query !== '' ? formdata.query : ''}
                  disabled={
                    data[2] === 'edit' ? editableStatus('kpi_query') : false
                  }
                  placeholder="Enter Query"
                  onChange={(e) => {
                    setFormdata({ ...formdata, query: e.target.value });
                    setEditedFormData({
                      ...editedFormData,
                      kpi_query: e.target.value
                    });
                    if (kpiEditData?.kpi_query !== e.value) {
                      setNeedForCleanUp({
                        ...needForCleanup,
                        kpi_query: true
                      });
                    } else {
                      const { kpi_query, ...newItems } = needForCleanup;
                      setNeedForCleanUp(newItems);
                    }
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
                    {testQueryData &&
                      testQueryData.data &&
                      testQueryData.data?.msg === 'success' && (
                        <div className="connection__success">
                          <p>
                            <img src={Success} alt="Success" />
                            Test Connection Success
                          </p>
                        </div>
                      )}
                    {testQueryData &&
                      testQueryData.data &&
                      testQueryData.data?.msg === 'failed' && (
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
            <>
              {dataSourceHasSchema && (
                <div className="form-group">
                  <label>Schema Name *</label>
                  <Select
                    options={option.schemaOption}
                    value={
                      formdata.schemaName !== '' && {
                        label: formdata.schemaName,
                        value: formdata.schemaName
                      }
                    }
                    isDisabled={
                      data[2] === 'edit' ? editableStatus('schema_name') : false
                    }
                    noOptionsMessage={() => {
                      return schemaListLoading ||
                        schemaAvailabilityLoading ||
                        tableListOnSchemaLoading ||
                        tableInfoLoading
                        ? 'Loading...'
                        : 'No Options';
                    }}
                    components={{
                      Option: CustomOption
                    }}
                    classNamePrefix="selectcategory"
                    placeholder="Select Schema Name"
                    onChange={(e) => schemaName(e)}
                  />

                  {errorMsg.tablename === true ? (
                    <div className="connection__fail">
                      <p>Select Schema Name</p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="form-group">
                <label>Table Name *</label>
                <Select
                  options={option.tableoption}
                  value={
                    formdata.tablename !== '' && {
                      label: formdata.tablename,
                      value: formdata.tablename
                    }
                  }
                  components={{
                    Option: CustomOption
                  }}
                  noOptionsMessage={() => {
                    return tableListOnSchemaLoading ||
                      tableInfoLoading ||
                      kpiFieldLoading
                      ? 'Loading...'
                      : 'No Options';
                  }}
                  isDisabled={
                    data[2] === 'edit' ? editableStatus('table_name') : false
                  }
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
            </>
          )}
          <>
            <div className="form-group">
              <label>Metric Columns *</label>
              <Select
                options={
                  option.metricOption && option.metricOption.length !== 0
                    ? option.metricOption
                    : []
                }
                value={
                  formdata.metriccolumns !== '' && {
                    label: formdata.metriccolumns,
                    value: formdata.metriccolumns
                  }
                }
                isDisabled={
                  data[2] === 'edit' ? editableStatus('metric') : false
                }
                classNamePrefix="selectcategory"
                placeholder="Select Metric Columns"
                noOptionsMessage={() => {
                  return tableInfoLoading || kpiFieldLoading
                    ? 'Loading...'
                    : 'No Options';
                }}
                onChange={(e) => {
                  setFormdata({ ...formdata, metriccolumns: e.value });
                  setEditedFormData({
                    ...editedFormData,
                    metric: e.value
                  });
                  if (kpiEditData?.metric !== e.value) {
                    setNeedForCleanUp({ ...needForCleanup, metric: true });
                  } else {
                    const { metric, ...newItems } = needForCleanup;
                    setNeedForCleanUp(newItems);
                  }
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

            {hasDruidDropDown && (
              <div className="form-group">
                <label>Count Column *</label>
                <Select
                  options={
                    option.metricOption && option.metricOption.length !== 0
                      ? option.metricOption
                      : []
                  }
                  value={
                    formdata.count_column !== '' && {
                      label: formdata.count_column,
                      value: formdata.count_column
                    }
                  }
                  isDisabled={
                    data[2] === 'edit' ? editableStatus('count_column') : false
                  }
                  classNamePrefix="selectcategory"
                  placeholder="Select Count Column"
                  noOptionsMessage={() => {
                    return tableInfoLoading || kpiFieldLoading
                      ? 'Loading...'
                      : 'No Options';
                  }}
                  onChange={(e) => {
                    setFormdata({ ...formdata, count_column: e.value });
                    setEditedFormData({
                      ...editedFormData,
                      count_column: e.value
                    });
                    if (kpiEditData?.count_column !== e.value) {
                      setNeedForCleanUp({
                        ...needForCleanup,
                        count_column: true
                      });
                    } else {
                      const { count_column, ...newItems } = needForCleanup;
                      setNeedForCleanUp(newItems);
                    }
                    setErrorMsg((prev) => {
                      return {
                        ...prev,
                        count_column: false
                      };
                    });
                  }}
                />
                {errorMsg.count_column === true ? (
                  <div className="connection__fail">
                    <p>Select Count Column</p>
                  </div>
                ) : null}
                <div className="channel-tip">
                  <p>This column can be a proxy for frequency</p>
                </div>
              </div>
            )}

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
                noOptionsMessage={() => {
                  return tableInfoLoading || kpiFieldLoading
                    ? 'Loading...'
                    : 'No Options';
                }}
                isDisabled={
                  data[2] === 'edit' ? editableStatus('aggregation') : false
                }
                classNamePrefix="selectcategory"
                placeholder="Select Aggregate by"
                onChange={(e) => {
                  setFormdata({ ...formdata, aggregate: e.value });
                  setEditedFormData({
                    ...editedFormData,
                    aggregation: e.value
                  });
                  if (kpiEditData?.aggregation !== e.value) {
                    setNeedForCleanUp({
                      ...needForCleanup,
                      aggregation: true
                    });
                  } else {
                    const { aggregation, ...newItems } = needForCleanup;
                    setNeedForCleanUp(newItems);
                  }
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
                options={
                  option.metricOption && option.metricOption.length !== 0
                    ? option.metricOption
                    : []
                }
                value={
                  formdata.datetimecolumns !== '' && {
                    label: formdata.datetimecolumns,
                    value: formdata.datetimecolumns
                  }
                }
                noOptionsMessage={() => {
                  return tableInfoLoading || kpiFieldLoading
                    ? 'Loading...'
                    : 'No Options';
                }}
                isDisabled={
                  data[2] === 'edit' ? editableStatus('datetime_column') : false
                }
                classNamePrefix="selectcategory"
                placeholder="Select Datetime Columns"
                onChange={(e) => {
                  setFormdata({ ...formdata, datetimecolumns: e.value });
                  setEditedFormData({
                    ...editedFormData,
                    datetime_column: e.value
                  });
                  if (kpiEditData?.datetime_column !== e.value) {
                    setNeedForCleanUp({
                      ...needForCleanup,
                      datetime_column: true
                    });
                  } else {
                    const { datetime_column, ...newItems } = needForCleanup;
                    setNeedForCleanUp(newItems);
                  }
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

            <div className="form-group">
              <label>Dimensions </label>
              <Select
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                value={
                  formdata.dimensions.length !== 0
                    ? formdata.dimensions.map((el) => {
                        return {
                          label: el,
                          value: el
                        };
                      })
                    : []
                }
                noOptionsMessage={() => {
                  return tableInfoLoading || kpiFieldLoading
                    ? 'Loading...'
                    : 'No Options';
                }}
                isMulti
                options={
                  option.metricOption && option.metricOption.length !== 0
                    ? option.metricOption
                    : []
                }
                isDisabled={
                  data[2] === 'edit' ? editableStatus('dimensions') : false
                }
                classNamePrefix="selectcategory"
                placeholder={
                  formdata.dimensions.length === 0 && data[2] === 'edit'
                    ? ''
                    : 'Select Dimensions'
                }
                menuPlacement="top"
                onChange={(e) => {
                  setFormdata({
                    ...formdata,
                    dimensions: e.map((el) => el.value)
                  });
                  setEditedFormData({
                    ...editedFormData,
                    dimensions: e.map((el) => el.value)
                  });
                  if (
                    (Array.isArray(e) &&
                      Array.isArray(kpiEditData?.dimensions) &&
                      e.length !== kpiEditData?.dimensions?.length) ||
                    e.every(
                      (val, index) =>
                        val.value !== kpiEditData?.dimensions[index]
                    )
                  ) {
                    setNeedForCleanUp({
                      ...needForCleanup,
                      dimensions: true
                    });
                  } else {
                    const { dimensions, ...newItems } = needForCleanup;
                    setNeedForCleanUp(newItems);
                  }
                  setOption({ ...option, datetime_column: e.value });
                  setErrorMsg((prev) => {
                    return {
                      ...prev,
                      dimension: false
                    };
                  });
                }}
              />
              <div className="channel-tip">
                <p>
                  Select dimensions for enabling sub-dimensional analysis &
                  drill downs
                </p>
              </div>
            </div>

            <div className="form-group">
              <label>Dashboard *</label>
              <Select
                closeMenuOnSelect={false}
                blurInputOnSelect={false}
                isMulti
                options={option.dashboard}
                classNamePrefix="selectcategory"
                placeholder={
                  formdata.dashboardNameList.length === 0 && data[2] === 'edit'
                    ? ''
                    : 'Select'
                }
                menuPlacement="top"
                value={
                  formdata.dashboardNameList.length !== 0
                    ? formdata.dashboardNameList
                    : []
                }
                isDisabled={
                  data[2] === 'edit' ? editableStatus('dashboards') : false
                }
                onChange={(e) => {
                  var arr = [];
                  e.length !== 0
                    ? e.forEach((data) => {
                        if (data.value === 'newdashboard') {
                          setIsOpen(true);
                        } else if (data.value !== 'newdashboard') {
                          arr.push(data);
                          setEditedFormData({
                            ...editedFormData,
                            dashboards: arr.map((el) => el.value)
                          });
                          setFormdata({
                            ...formdata,
                            dashboardNameList: arr
                          });
                        }
                      })
                    : onEditData(e, 'dashboards');

                  setErrorMsg((prev) => {
                    return {
                      ...prev,
                      dashboardNameList: false
                    };
                  });
                }}
              />
              {errorMsg.dashboardNameList === true ? (
                <div className="connection__fail">
                  <p>Select Dashboard</p>
                </div>
              ) : null}
            </div>
            <div className="form-action">
              <button
                className={
                  kpiSubmitLoading || kpiUpdateLoading
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
          </>
          <Modal
            isOpen={isOpen}
            shouldCloseOnOverlayClick={false}
            portalClassName="dashboardmodal">
            <div className="modal-close">
              <img src={Close} alt="Close" onClick={closeModal} />
            </div>
            <div className="modal-head">
              <h3>Create New Dashboard</h3>
            </div>
            <div className="modal-body">
              <div className="modal-contents">
                <div className="form-group">
                  <label>Dashboard Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Dashboard Name"
                    onChange={(e) => {
                      setErrorMsg({ ...errorMsg, dashboardName: false });
                      setFormdata({
                        ...formdata,
                        dashboardName: e.target.value
                      });
                    }}
                  />
                  {errorMsg.dashboardName === true ? (
                    <div className="connection__fail">
                      <p>Enter Dashboard Name</p>
                    </div>
                  ) : null}
                </div>
                <div className="next-step-navigate">
                  <button className="btn white-button" onClick={closeModal}>
                    <span>Cancel</span>
                  </button>
                  <button
                    className={
                      createDashboardLoading
                        ? 'btn black-button btn-loading'
                        : 'btn black-button'
                    }
                    onClick={dashboardSubmit}>
                    <div className="btn-spinner">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <span>Loading...</span>
                    </div>
                    <div className="btn-content">
                      <span>Create</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Modal>
          <Modal
            portalClassName="dashboardmodal"
            isOpen={editModalOpen}
            shouldCloseOnOverlayClick={false}>
            <div className="modal-close">
              <img
                src={Close}
                alt="Close"
                onClick={() => setEditModalOpen(false)}
              />
            </div>
            <div className="modal-body">
              <div className="modal-contents">
                <h3>All your previous data will be deleted</h3>
                <p>Are you sure you want to proceed? </p>
                <div className="next-step-navigate-edit-modal">
                  <button
                    className="btn white-button"
                    onClick={() => setEditModalOpen(false)}>
                    <span>Cancel</span>
                  </button>
                  <button
                    className="btn black-button"
                    onClick={() => {
                      dispatch(
                        getUpdatekpi(kpiId, editedFormData, customToast)
                      );
                      setNeedForCleanUp({});
                      setEditModalOpen(false);
                    }}>
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </>
      </>
    );
  }
};

export default KpiExplorerForm;
