import React from 'react';

import "./List.css";

class List extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.projectList = [
            {
                projectName: "method-history-slicer",
                projectOwner: "kajdreef",
                branch: "master",
                passed: true,
                lastBuidNumber: 74,
                lastBuildPassed: true,
                commit: "3bd66fd",
                finished: "10 days ago"
            },
            {
                projectName: "tacoco",
                projectOwner: "spideruci",
                branch: "master",
                passed: true,
                lastBuidNumber: 131,
                lastBuildPassed: true,
                commit: "eda9f6b",
                finished: "about a month ago"
            },
            {
                projectName: "tacoco",
                projectOwner: "kajdreef",
                branch: "master",
                passed: false,
                lastBuidNumber: 37,
                lastBuildPassed: false,
                commit: "8716bda",
                finished: "about a month ago"
            }
        ];

        this.buildProjectView = this.buildProjectView.bind(this);
        this.evaluatePassed = this.evaluatePassed.bind(this);
        this.onProjectUnitClicked = this.onProjectUnitClicked.bind(this);
    } 

    componentDidMount() {
        document.addEventListener('click', this.onProjectUnitClicked, false);
    }

    onProjectUnitClicked(event) {
        if (!event.target.closest('.projectUnit')) {
            return;
        }

        console.log("onProjectUnitClicked()");

        // Identify which project unit was clicked
        let selector = ".projectUnit";
        let index = -1;
        var list = document.querySelectorAll(selector);
        for (let i = 0; i < selector.length; ++i) {
            if (list[i] === event.target.closest('.projectUnit')) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            console.error("Couldn't find clicked unit");
            return;
        }

        console.log("Clicked Project Unit #" + index);
        console.log(this.projectList[index]);
    }

    // Builds the project list view
    /**
     * project = {
     *     projectName: string
     *     projectOwner: string
     *     branch: string
     *     passed: boolean
     *     lastBuildNumber: number
     *     lastBuildPassed: boolean
     *     commit: string
     *     finished: string
     * }
     */
    buildProjectView(listOfProjects) {
        let viewArr = [];

        for (let project of listOfProjects) {
            viewArr.push( 
                <div className="projectUnit">
                    <div className="nameUser">
                        <p>{project.projectOwner}</p>
                        <p>{project.projectName}</p>
                    </div>
                    <div className="branch">
                        <p>Default Branch</p>
                        <p className={(project.passed) ? 'passed' : 'failed'}>{project.branch} {this.evaluatePassed(project.passed)}</p>
                    </div>
                    <div className="build">
                        <p>Last Build</p>
                        <p className={(project.lastBuildPassed) ? 'passed' : 'failed'}>{project.lastBuidNumber} {this.evaluatePassed(project.lastBuildPassed)}</p>
                    </div>
                    <div className="commit">
                        <p>Commit</p>
                        <p>{project.commit}</p>
                    </div>
                    <div className="finished">
                        <p>Finished</p>
                        <p>{project.finished}</p>
                    </div>
                </div>);
        }

        console.log(viewArr);

        return viewArr;
    }

    evaluatePassed(passed) {
        return (passed) ? "passed" : "failed";
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div className="list">
                {/* <p>This is the List page</p> */}
                <div id="listView">
                    {this.buildProjectView(this.projectList)}
                </div>
            </div>
         );
     }
}

export default List;