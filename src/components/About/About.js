import React from 'react';

import {aboutPageDetails} from '../../util/vars';

import "./About.scss";

class About extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.state = {
            teamMembers: aboutPageDetails.members
        };
    } 

    componentDidMount() {

    }


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div id="about">
                <div className="aboutBackground"></div>

                <div className="aboutContent">
                    <p className="title">{aboutPageDetails.title}</p>

                    <div className="welcome">
                        <p>{aboutPageDetails.message}</p>
                    </div>

                    <div className="meetTheTeam">
                        <p>Meet the Team</p>

                        <div>
                            {this.state.teamMembers.map((m) => (
                                <div className="memberCard">
                                    <div className="memberPicture">
                                        <div></div>
                                    </div>
                                    <div className="memberDetails">
                                        <p>{m.name}</p>
                                        <p>{m.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
         );
     }
}

export default About;