import React from 'react';

import {aboutPageDetails} from '../../vars/vars';

import "./About.scss";


const About = () => {
    return (
        <div id="about">
            <div className="aboutBackground"></div>

            <div className="aboutContent">
                <p className="title">{aboutPageDetails.title}</p>

                <div className="welcome">
                    {aboutPageDetails.messages.map((m) => (
                        <div>
                            {m.messageTitle.length !== 0 &&
                                <p className="welcomeTitle">{m.messageTitle}</p>
                            }
                            <p>{m.message}</p>
                        </div>
                    ))}
                </div>

                <div className="meetTheTeam">
                    <p>{aboutPageDetails.titleMembers}</p>

                    <div>
                        {aboutPageDetails.members.map((m) => (
                            <div className="memberCard">
                                <div className="memberPicture">
                                    <div style={{
                                        backgroundImage: `url(${process.env.PUBLIC_URL}/${m.imagePath})`,
                                        backgroundColor: "#E2E2E2",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "none"
                                        }}></div>
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

export default About;