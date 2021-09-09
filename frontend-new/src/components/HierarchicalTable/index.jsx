import React, { useState } from 'react';

import Up from '../../assets/images/up.svg';
import Down from '../../assets/images/down.svg';
import Next from '../../assets/images/next.svg';
import Arrow from '../../assets/images/table/subvalue.svg';

import '../../assets/styles/table.scss';

const HierarchicalTable = ({ hierarchicalData }) => {
  const parentChildData = () => {
    var map = {},
      node,
      roots = [],
      i;

    for (i = 0; i < hierarchicalData.length; i += 1) {
      map[hierarchicalData[i].id] = i;
      hierarchicalData[i].children = [];
    }

    for (i = 0; i < hierarchicalData.length; i += 1) {
      node = hierarchicalData[i];
      if (node.parentId !== '0' && node.parentId !== null) {
        hierarchicalData[map[node.parentId]].children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  };

  return (
    <div className="common-drilldown-table table-section">
      <table className="table">
        <thead>
          <tr>
            <th></th>
            <th>Subgroup Name</th>
            <th>Prev month Avg</th>
            <th>Prev month Size</th>
            <th>prev month Count</th>
            <th>Curr month Avg</th>
            <th>Curr month Size</th>
            <th>Curr month Count</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          {hierarchicalData && hierarchicalData.length !== 0 && (
            <Tree data={parentChildData()} />
          )}
        </tbody>
      </table>
    </div>
  );
};

const Tree = ({ data, childVisible }) => {
  return (
    <>
      {data.map((item) => {
        return (
          <>
            <TreeNode node={item} child={childVisible} />
          </>
        );
      })}
    </>
  );
};

const TreeNode = ({ node, child }) => {
  const [childVisible, setChildVisiblity] = useState(false);

  const hasChild = node.children.length ? true : false;

  return (
    <>
      <tr className={child ? 'child-row' : ''}>
        <td
          onClick={() => setChildVisiblity((v) => !v)}
          className={
            childVisible && hasChild && !child
              ? 'child-rotate'
              : 'child-show'
              ? child
              : 'child-arrow'
          }>
          {child && childVisible && hasChild ? (
            <img src={Arrow}></img>
          ) : hasChild ? (
            <img src={Next} alt="arrow"></img>
          ) : (
            ''
          )}
        </td>
        <td>{node.subgroup}</td>
        <td className="date-column-formated">{node.g1_agg}</td>
        <td className="date-column-formated">{node.g1_count}</td>
        <td className="date-column-formated">{node.g2_agg}</td>
        <td className="date-column-formated">{node.g1_size}</td>
        <td className="date-column-formated">{node.g2_count}</td>
        <td className="date-column-formated">{node.g2_size}</td>
        <td className="date-column-formated">
          {node.impact > 0 ? (
            <div className="connection__success">
              <p>
                <img src={Up} alt="High" />
                {Math.abs(node.impact)}
              </p>
            </div>
          ) : (
            <div className="connection__fail">
              <p>
                <img src={Down} alt="Low" />
                {Math.abs(node.impact)}
              </p>
            </div>
          )}
        </td>
      </tr>
      {hasChild && childVisible && <Tree data={node.children} childVisible />}
    </>
  );
};

export default HierarchicalTable;
