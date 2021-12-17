import React from 'react';
import './navbar.scss';
import { Link } from 'react-router-dom';
import Setting from '../../assets/images/setting.svg';
import TaskManager from '../../assets/images/task-1.svg';
import Profiledown from '../../assets/images/profile-down.svg';

const Navbar = () => {
  const dropDownItems = [
    {
      text: 'Settings',
      link: '/organisation-settings',
      img: Setting,
      alt_img: 'Setting'
    },
    {
      text: 'Task Manager',
      link: '/task-manager',
      img: TaskManager,
      alt_img: 'Task Manager'
    }
  ];

  const dropDownLinks = dropDownItems.map((item, index) => {
    return (
      <li className="" key={index}>
        <Link to={item.link} className="dropdown-item">
          <img src={item.img} alt={item.alt_img} />
          <span>{item.text}</span>
        </Link>
      </li>
    );
  });
  return (
    <div className="header-section">
      <div className="dropdown">
        <div
          id="userdetails"
          className="userdetails"
          data-bs-toggle="dropdown"
          aria-expanded="false">
          <div className="user-avatar">A</div>
          <div className="user-profile">
            <div className="profile-dropdown">
              <p>Admin</p>
              <img src={Profiledown} alt="profile" />
            </div>
          </div>
        </div>
        <ul
          className="dropdown-menu navbar-dropdown-menu"
          aria-labelledby="userdetails">
          {dropDownLinks}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
