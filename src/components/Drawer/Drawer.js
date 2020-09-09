import React from 'react';
import { NavLink } from 'react-router-dom';

import HomeOutlinedIcon from '@material-ui/icons/HomeOutlined';
import GroupIcon from '@material-ui/icons/Group';
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import "./Drawer.scss";


class Drawer extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
     constructor(props) {
        super(props);

        this.SPIDERSENSE_BADGE_PATH = "/circle_badges/spider_circle_red.svg";

        // Bind methods
        this.getProjectPath = this.getProjectPath.bind(this);
    } 

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */

     /**
      * Reads cookies to see if id key exists. If it doesn't, returns the
      * path to ChooseProject component. Otherwise, returns path to Project
      * component with id.
      * @return {string} "/proj" if id doesn't exist, "/project/:id" otherwise
      */
     getProjectPath() {
        // Get cookies and id
        const { cookies } = this.props;
        let id = cookies.get("id");

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
            <div id="drawer">
                <div className="drawerIcon">
                    <div>
                        <img src={process.env.PUBLIC_URL + this.SPIDERSENSE_BADGE_PATH}/>
                    </div>
                </div>
                <div className="drawerTitle">
                    <p>SpiderSense</p>
                </div>

                <div className="drawerNavigation">
                    <NavLink to="/" className="styledNavLink">
                        <div className="navIcon">
                            <HomeOutlinedIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Home</p>
                    </NavLink>
                    <NavLink to={this.getProjectPath()} className="styledNavLink">
                        <div className="navIcon">
                            <AssessmentOutlinedIcon style={{fill: "white"}}/>
                        </div>
                        <p className="navText">Project</p>
                    </NavLink>
                    <NavLink to="/about" className="styledNavLink">
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
}

export default Drawer;