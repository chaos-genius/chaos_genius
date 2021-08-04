import React from 'react';

// import { Redirect } from 'react-router-dom';
import { Route, withRouter } from 'react-router';

// import { isAuthenticated } from '../utils/user-helper';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const PrivateRouteWithSidebar = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <div className="container-wrapper">
            <Sidebar />
            <main>
              <Navbar />
              <div className="body-container">
                <Component {...props} />
              </div>
            </main>
          </div>
        </>
      )}
    />
  );
};

export default withRouter(PrivateRouteWithSidebar);
