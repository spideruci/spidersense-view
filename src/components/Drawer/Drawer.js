import React from 'react';
import { NavLink } from 'react-router-dom';

import "./Drawer.css";

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import ViewListIcon from '@material-ui/icons/ViewList';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';


class Drawer extends React.Component {
    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div className="drawer">
                <div className="drawerIcon">
                    <div></div>
                </div>
                <div className="drawerTitle">
                    <p>SpiderSense</p>
                </div>

                <div className="drawerNavigation">
                    <NavLink to="/" className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <HomeOutlinedIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Home</p>
                    </NavLink>
                    <NavLink to="/list" className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <ViewListIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">List</p>
                    </NavLink>
                    <NavLink to="/project" className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <AssessmentOutlinedIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Project</p>
                    </NavLink>
                </div>

                <div className="fill"></div>

                <div className="drawerLogout">
                    <div className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <ExitToAppIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Logout</p>
                    </div>
                </div>
            </div>
         );
     }
}

export default Drawer;