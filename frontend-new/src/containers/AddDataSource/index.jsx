import React from "react";
import { Link } from "react-router-dom";
import rightarrow from "../../assets/images/rightarrow.svg";
import DataSourceForm from "../../components/DataSourceForm";

const AddDataSource = () => {
  return (
    <div>
      {/* Page Navigation */}
      <div className="page-navigation">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/datasource">Data Source </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Add Data Source
            </li>
          </ol>
        </nav>
        {/* Back */}
        <div className="backnavigation">
          <Link to="/datasource">
            <img src={rightarrow} alt="Back" />
            <span>Add Data Sources</span>{" "}
          </Link>
        </div>
      </div>
      {/* add DataSource form */}
      <div className="add-form-container">
        <DataSourceForm/>
      </div>
    </div>
  );
};

export default AddDataSource;
