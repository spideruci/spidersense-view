import React from 'react';

import * as d3 from 'd3';

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

        // Prepare details for steps
        const numberOfSteps = 5;
        let steps = new Array(numberOfSteps);

        // Define title for steps (should match # of steps)
        const stepTitles = [
            "Select a Project on the Home page",
            "Browse Project Overview",
            "Select a commit under Tarantula",
            "Select test cases",
            "View suspicious statements"
        ];

        for (let i = 0; i < numberOfSteps; i++) {
            let stepNumber = `Step ${i + 1}:`;
            let stepTitle = stepTitles[i];
            let imagePath = `${process.env.PUBLIC_URL}/images/step_0${i + 1}.svg`;

            steps[i] = {
                number: stepNumber,
                title: stepTitle,
                imagePath: imagePath
            };
        }

        this.steps = steps;

        // Bind methods
        this.onSelectProjectClicked = this.onSelectProjectClicked.bind(this);
    }

    componentDidMount() {
        let stepsWrappers = d3.selectAll(".stepsWrapper > div").nodes();

        window.addEventListener("scroll", function(e) {
            var pageTop = window.scrollY;
            var pageBottom = pageTop + window.innerHeight;

            for (let i = 0; i < stepsWrappers.length; i++) {
                let node = stepsWrappers[i];

                if (node.offsetTop < pageBottom) {
                    node.classList.add("visible");
                } else {
                    node.classList.remove("visible");
                }
            }
        });
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
                    {this.steps.map((step) => (
                        <div>
                            <p><span className="stepsTitle">{step.number}</span> {step.title}</p>
                            <div>
                                <img src={step.imagePath} alt={`Step ${step.number}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         );
     }
}

export default ChooseProject;