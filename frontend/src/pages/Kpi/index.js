
import React from "react";
import { Typography } from '@material-ui/core';


// import AddKpi from './AddKpi';
import KpiList from './KpiList';

class KpiExplorer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  

  render() {
    return (
      <>
        
        {/* <AddKpi /> */}
        <KpiList />
      </>
    )
  }
}

export default KpiExplorer;