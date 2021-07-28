
import React from "react";
import AlertList from './AlertList';

class Alerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <AlertList />
      </>
    )
  }
}

export default Alerts;
