import React from 'react';

import Button from '@material-ui/core/Button';

import "./ChooseProject.scss";

class ChooseProject extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.onSelectProjectClicked = this.onSelectProjectClicked.bind(this);
    } 

    /** =======================================================================
     * 
     * Methods
     * 
     ======================================================================= */
    onSelectProjectClicked() {
        this.props.history.push(`/`);
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div id="chooseProject">
                <div className="introWrapper">
                    <div className="title">
                        <p>Choose a project</p>
                    </div>
                    <div className="intro">
                        <p>Please visit the home page to view and select a project. After selecting one, project analytics will be available, including:</p>
                    </div>
                    <div className="introList">
                        <ul>
                            <li>Project details</li>
                            <li>Recent commits</li>
                            <li>List of tests</li>
                            <li>Fault localization via visual mapping</li>
                            <li>Computed suspiciousness scores of covered statements</li>
                        </ul>
                    </div>

                    <div className="actionButton">
                        <Button className="" variant="outlined" color="secondary" onClick={this.onSelectProjectClicked}>Select Project</Button>
                    </div>
                </div>

                <div className="stepsWrapper">
                    <div>
                        <p><span className="stepsTitle">Step 1:</span> Select a project on the Home page</p>
                    </div>

                    <div>
                        <p><span className="stepsTitle">Step 2:</span> Browse project overview</p>
                    </div>

                    <div>
                        <p><span className="stepsTitle">Step 3:</span> Select a commit</p>
                    </div>

                    <div>
                        <p><span className="stepsTitle">Step 4:</span> Select test cases</p>
                    </div>

                    <div>
                        <p><span className="stepsTitle">Step 5:</span> View suspicious statements</p>
                    </div>
                </div>
            </div>
         );
     }
}

export default ChooseProject;