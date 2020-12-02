import React from 'react';
import { NavLink } from 'react-router-dom';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import GroupIcon from '@material-ui/icons/Group';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
// import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import "./Drawer.scss";

const Drawer = (props) => {
    const SPIDERSENSE_BADGE_PATH = process.env.PUBLIC_URL + "/circle_badges/spider_circle_red.svg";

    return (
        <div id="drawer">
            <div className="drawerIcon">
                <div>
                    <img src={SPIDERSENSE_BADGE_PATH} alt="SpiderSense"/>
                </div>
            </div>
            <div className="drawerTitle">
                <p>SpiderSense</p>
            </div>

            <div className="drawerNavigation">
                <NavLink exact to="/" className="styledNavLink" activeClassName="activeNavLink">
                    <div className="navIcon">
                        <HomeOutlinedIcon style={{fill: "white"}}/>
                    </div>
                    <p className="navText">Home</p>
                </NavLink>
                <NavLink to={getProjectPath(props.cookies.get('id'))} className="styledNavLink" activeClassName="activeNavLink">
                    <div className="navIcon">
                        <AssessmentOutlinedIcon style={{fill: "white"}}/>
                    </div>
                    <p className="navText">Project</p>
                </NavLink>
                <NavLink to="/about" className="styledNavLink" activeClassName="activeNavLink">
                    <div className="navIcon">
                        <GroupIcon style={{fill: "white"}}/>
                    </div>
                    <p className="navText">About</p>
                </NavLink>
            </div>

            <div className="fill"></div>

            {/* TODO: Uncomment for logout button */}
            {/* <div className="drawerLogout">
                <div className="styledNavLink">
                    <div className="navIcon">
                        <ExitToAppIcon style={{fill: "white"}}/>
                    </div>
                    <p className="navText">Logout</p>
                </div>
            </div> */}
        </div>
    );
}

/**
 * Reads cookies to see if id key exists. If it doesn't, returns the
 * path to ChooseProject component. Otherwise, returns path to Project
 * component with id.
 * @return {string} "/proj" if id doesn't exist, "/project/:id" otherwise
 */
function getProjectPath(id) {
    if (id === undefined) {
        return "/proj";
    }

    return `/project/${id}`;
    }

export default Drawer;