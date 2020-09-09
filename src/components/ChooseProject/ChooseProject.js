import React from 'react';

import Button from '@material-ui/core/Button';

import {chooseProjectPageDetails} from '../../vars/vars';
import "./ChooseProject.scss";


class ChooseProject extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Bind methods
        this.onSelectProjectClicked = this.onSelectProjectClicked.bind(this);
    } 

    /** =======================================================================
     * 
     * Methods
     * 
     ======================================================================= */

     /**
      * On click of the select project action button, navigate to the
      * Home component.
      */
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
                        <p>{chooseProjectPageDetails.title}</p>
                    </div>
                    <div className="intro">
                        <p>{chooseProjectPageDetails.intro}</p>
                    </div>
                    <div className="introList">
                        <ul>
                        {chooseProjectPageDetails.introList.map((entry) => (
                                <li>{entry}</li>
                            ))}
                        </ul>

                    </div>

                    <div className="actionButton">
                        <Button className="" variant="outlined" color="secondary" onClick={this.onSelectProjectClicked}>{chooseProjectPageDetails.actionButtonText}</Button>
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