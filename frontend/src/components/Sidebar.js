
import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import { useLocation } from "react-router-dom";
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faHome, faAlignCenter, faSignOutAlt, faTimes, faSitemap, faCoins, faCogs, faUsers, faTasks, faGlobe, faBell, faPoll} from "@fortawesome/free-solid-svg-icons";
import { Nav, Badge, Image, Button, Dropdown, Accordion, Navbar } from '@themesberg/react-bootstrap';
import { Link } from 'react-router-dom';

import { Routes } from "../routes";
import ReactHero from "../assets/img/bootstrap-5-logo.svg";
import ProfilePicture from "../assets/img/profile-photo.jpeg";




import logo from "../assets/img/logo.svg"
import homeIcon from '../assets/img/navbaricons/home.svg'
import homeIconActive from '../assets/img/navbaricons/homeactive.svg'

import dashboardIcon from '../assets/img/navbaricons/dashboard.svg'
import dashboardIconActive from '../assets/img/navbaricons/dashboardactive.svg'

import kpiexplorerIcon from '../assets/img/navbaricons/kpiexplorer.svg'
import kpiexplorerIconActive from '../assets/img/navbaricons/kpiexploreractive.svg'

import anomoliesIcon from '../assets/img/navbaricons/anomolies.svg'
import anomoliesIconActive from '../assets/img/navbaricons/anomoliesactive.svg'

import datasourceIcon from '../assets/img/navbaricons/datasource.svg'
import datasourceIconActive from '../assets/img/navbaricons/datasourceactive.svg'

import alertsIcon from '../assets/img/navbaricons/alerts.svg'
import alertsIconActive from '../assets/img/navbaricons/alertsactive.svg'

export default (props = {}) => {
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const showClass = show ? "show" : "";

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children = null } = props;
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button as={Nav.Link} className="d-flex justify-content-between align-items-center">
            <span>
              <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span>
              {/* <span className="sidebar-icon"><img src={logo} className="main-logo" /> </span> */}
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column">
              {children}
            </Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = (props) => {
    const { title, link, external, target, icon, image,imageActive, badgeText, badgeBg = "secondary", badgeColor = "primary" } = props;
    const classNames = badgeText ? "d-flex justify-content-start align-items-center justify-content-between" : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };
    const imageIcon = link === pathname ? imageActive : image;
    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? <span className="sidebar-icon"><FontAwesomeIcon icon={icon} /> </span> : null}
            {image ? <Image src={imageIcon} width={24} className="sidebar-icon svg-icon" /> : null}
            {/* <span className="sidebar-icon"><img src={logo} className="main-logo" /> </span> */}          
          </span>
          <h4 className="sidebar-title mb-0">{title}</h4>
          {badgeText ? (
            <Badge pill bg={badgeBg} text={badgeColor} className="badge-md notification-count ms-2">{badgeText}</Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      <Navbar expand={false} collapseOnSelect variant="dark" className="navbar-theme-primary px-4 d-md-none">
        <Navbar.Brand className="me-lg-5" as={Link} to={Routes.Dashboards.path}>
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle as={Button} aria-controls="main-navbar" onClick={onCollapse}>
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar className={`collapse ${showClass} contracted sidebar d-md-block bg-primary text-white`}>
          <div className="sidebar-inner">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image src={ProfilePicture} className="card-img-top rounded-circle border-white" />
                </div>
                <div className="d-block">
                  <h6>Hi, Harshit</h6>
                  <Button as={Link} variant="secondary" size="xs" to={Routes.Signin.path} className="text-dark">
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link className="collapse-close d-md-none" onClick={onCollapse}>
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>
            <Nav className="flex-column pt-3 pt-md-0">
              <NavItem title="" link={'#'} image={logo}  />
              <Dropdown.Divider className="my-3 border-indigo" />

              <NavItem title="Home" link={Routes.Home.path} image={homeIcon} imageActive={homeIconActive} />
              <NavItem title="Dashboards" link={Routes.Dashboards.path} image={dashboardIcon} imageActive={dashboardIconActive} />
              <NavItem title="KPI Explorer" link={Routes.KpiExplorer.path} image={kpiexplorerIcon} imageActive={kpiexplorerIconActive} />
              <NavItem title="Anomaly" link={"#"} image={anomoliesIcon} imageActive={anomoliesIconActive} />
              {/* <NavItem title="Actions Items" link={Routes.ActionItems.path} icon={faTasks} /> */}
              {/* <NavItem title="Actions Items" link={Routes.ActionItems.path} icon={faTasks} /> */}
              {/* <NavItem title="Alerts" link={Routes.Alerts.path} icon={faBell} /> */}

              <Dropdown.Divider className="my-3 border-indigo" />

              {/* <CollapsableNavItem eventKey="organisation/" title="Organisation" icon={faSitemap}>
                <NavItem title="Users" link={Routes.Users.path} icon={faUsers} />
                <NavItem title="Data Sources" link={Routes.DataSources.path} icon={faCoins} />
                <NavItem title="Settings" link={Routes.OrganisationSettings.path} icon={faCogs} />
              </CollapsableNavItem> */}
              <div className="bottom-nav">
                <NavItem title="Data Sources" link={Routes.DataSources.path} image={datasourceIcon} imageActive={datasourceIconActive} />
                <NavItem title="Alerts" link={Routes.Alerts.path} image={alertsIcon} imageActive={alertsIconActive} />
              </div>

            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
