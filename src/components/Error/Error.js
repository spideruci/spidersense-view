import React from 'react';

import './Error.scss';

class Error extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
     constructor(props) {
        super(props);

        this.SPIDERSENSE_BADGE_PATH = process.env.PUBLIC_URL + "/circle_badges/spider_circle_blue.svg";
    } 

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div id="error">
                <div>
                    <div className="badgeContainer">
                        <img src={this.SPIDERSENSE_BADGE_PATH} alt="SpiderSense"/>
                    </div>
                    <p className="error404">404 Error</p>
                    <p className="errorDescription">The page you are looking for does not exist</p>
                </div>
            </div>
         );
     }
}

export default Error;