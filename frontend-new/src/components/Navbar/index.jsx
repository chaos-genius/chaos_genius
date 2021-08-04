import React from "react";
import "./navbar.scss";
import { Link } from "react-router-dom";
import Profiledown from "../../assets/images/profile-down.svg";

const Navbar = () => {
  return (
    <div className="header-section">
      <div className="dropdown">
        <div
          id="userdetails"
          className="userdetails"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div className="user-avatar">m</div>
          <div className="user-profile">
            <div className="profile-dropdown">
              <p>mathew.thomas@gmail.com</p>
              <img src={Profiledown} alt="profile" />
            </div>
            <label>Admin</label>
          </div>
        </div>
        <ul className="dropdown-menu" aria-labelledby="userdetails">
          <li className="active">
            <Link to="" className="dropdown-item">
              My Account
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="">
              Sign Out
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
