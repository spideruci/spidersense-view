import React from 'react';
import { NavLink } from 'react-router-dom';

import "./Drawer.css";

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import GroupIcon from '@material-ui/icons/Group';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';


class Drawer extends React.Component {
        /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
     constructor(props) {
        super(props);

        // Bind methods
        this.getProjectPath = this.getProjectPath.bind(this);
    } 

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */
     getProjectPath() {
        console.log("getProjectPath()");

        // Get a cookie
        const { cookies } = this.props;
        let id = cookies.get("id");

        console.log("cookies id: " + id);

        if (id == undefined) {
            return "/proj";
        }

        return `/project/${id}`;
     }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div className="drawer">
                <div className="drawerIcon">
                    <div>
                        <img src={process.env.PUBLIC_URL + "/circle_badges/spider_circle_red.svg"}/>
                    </div>
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
                    <NavLink to={this.getProjectPath()} className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <AssessmentOutlinedIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Project</p>
                    </NavLink>
                    <NavLink to="/about" className="styledNavLink cursorPointer">
                        <div className="navIcon">
                            <GroupIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">About</p>
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