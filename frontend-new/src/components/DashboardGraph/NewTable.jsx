import React from 'react';
import { useTable, useExpanded } from 'react-table';

const range = (len) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

function makeData(...lens) {
  const makeDataLevel = (depth = 0) => {
    const len = lens[depth];
    return range(len).map((index, d) => {
      return {
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      };
    });
  };

  return makeDataLevel();
}

function Table({ columns: userColumns, data }) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { expanded }
  } = useTable(
    {
      columns: userColumns,
      data
    },
    useExpanded // Use the useExpanded plugin hook
  );

  return (
    <>
      <table {...getTableProps()}>
        <thead>
          <tr {...headerGroups[1].getHeaderGroupProps()}>
            {headerGroups[1].headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <br />
      <div>Showing the first 20 results of {rows.length} rows</div>
      <pre>
        <code>{JSON.stringify({ expanded: expanded }, null, 2)}</code>
      </pre>
    </>
  );
}

const NewTable = ({ hierarchicalData }) => {
  const columns = [
    {
      // Build our expander column
      id: 'expander', // Make sure it has an ID

      Cell: ({ row }) =>
        // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
        // to build the toggle for expanding a row
        row.canExpand ? (
          <span
            {...row.getToggleRowExpandedProps({
              style: {
                // We can even use the row.depth property
                // and paddingLeft to indicate the depth
                // of the row
                paddingLeft: `${row.depth * 2}rem`
              }
            })}>
            {row.isExpanded ? '👇' : '👉'}
          </span>
        ) : null
    },
    {
      Header: 'Name',
      columns: [
        {
          Header: 'Subgroup',
          accessor: 'subgroup'
        },
        {
          Header: 'Last Name',
          accessor: 'lastName'
        },
        {
          Header: 'Age',
          accessor: 'age'
        },
        {
          Header: 'Visits',
          accessor: 'visits'
        },
        {
          Header: 'Status',
          accessor: 'status'
        },
        {
          Header: ' Profile Progress',
          accessor: 'progress'
        }
      ]
    }
  ];

  const data = React.useMemo(() => makeData(5, 5, 5), []);

  // const grouping = () => {
  //   var arr = [];
  //   hierarchicalData.data_table.map((data) => {
  //     arr.push(hierarchicalData.data_table.find(data.id === data.parentId));
  //   });
  //   console.log(arr);
  // };

  //grouping();

  return (
    <>
      <Table columns={columns} data={data}></Table>
    </>
  );
};

export default NewTable;
