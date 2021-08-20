import React, { useEffect, useState } from 'react';

import MaterialTable from 'material-table';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';

import './hierarchical.scss';

const HierarchicalTable = (props) => {
  const [data, setData] = useState('');
  useEffect(() => {
    gethierarchicalTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ValueChange = (value) => {
    return value ? (
      <>
        <div className={value > 0 ? 'connection__success' : 'connection__fail'}>
          <p>
            <img src={value > 0 ? Up : Down} alt="High" />
            {Math.abs(value)}
          </p>
        </div>
      </>
    ) : (
      '--'
    );
  };
  const gethierarchicalTableData = () => {
    const dataRow = [];
    props.data.forEach((obj) => {
      const dataum = {};
      dataum['id'] = obj.id;
      dataum['subgroup'] = obj.subgroup;
      dataum['g1_agg'] = obj.g1_agg;
      dataum['g1_count'] = obj.g1_count;
      dataum['g1_size'] = obj.g1_size;
      dataum['g2_agg'] = obj.g2_agg;
      dataum['g2_count'] = obj.g2_count;
      dataum['g2_size'] = obj.g2_size;
      dataum['impact'] = ValueChange(obj.impact);
      dataum['parentId'] = obj.parentId;
      dataRow.push(dataum);
    });
    setData(dataRow);
  };
  return (
    <MaterialTable
      columns={props.columns}
      data={data}
      options={props.options}
      parentChildData={props.parentChildData}
      title={props.title}
    />
  );
};

export default HierarchicalTable;
