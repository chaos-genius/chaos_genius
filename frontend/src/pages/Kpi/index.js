
import React from "react";
import { Typography } from '@material-ui/core';

import { ArrowBack } from "@material-ui/icons";

import AddKpi from './AddKpi';

class KpiExplorer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  renderAppBar = () =>{
    return(
      <Typography component="h4"><span className="mr-2"><ArrowBack />Add Kpi</span></Typography>
    )
  }

  render() {
    return (
      <>
        {this.renderAppBar()}
        <AddKpi />
      </>
    )
  }
}

export default KpiExplorer;