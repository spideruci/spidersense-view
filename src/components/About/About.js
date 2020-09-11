import React from 'react';

import {aboutPageDetails} from '../../vars/vars';

import "./About.scss";


class About extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Initialize state
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
                        <p>{aboutPageDetails.titleMembers}</p>

                        <div>
                            {this.state.teamMembers.map((m) => (
                                <div className="memberCard">
                                    <div className="memberPicture">
                                        <div></div>
                                    </div>
                                    <div className="memberDetails">
                                        <p>{m.name}</p>
                                        <p>{m.position}</p>
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