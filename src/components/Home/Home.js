import React from 'react';

import * as d3 from 'd3';

import GitHubIcon from '@material-ui/icons/GitHub';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ViewListIcon from '@material-ui/icons/ViewList';

import { spidersenseWorkerUrls } from '../../util/vars';
import "./Home.css";

class Home extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Initalize state
        this.state = {
            projects: [],
            currentViewIndex: -1
        };

        // Bind methods
        this.updateCurrentViewOption = this.updateCurrentViewOption.bind(this);
        this.onProjectClicked = this.onProjectClicked.bind(this);
        this.openGithubLink = this.openGithubLink.bind(this);
    } 

    componentDidMount() {
        this.requestAllProjects();
    }

    requestAllProjects() {
        console.log("requestAllProjects");
        let url = spidersenseWorkerUrls.getAllProjects;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            // Update state to retain projects
            this.setState((state) => ({
                projects: data.projects
            }))

            this.initializeViewOptions();
        }).catch((error) => {
            console.error(error);
        });
    }

    initializeViewOptions() {
        console.log("initializeViewOptions()");

        this.viewOptions = [
            {
                viewName: "module",
                container: this.state.projects.map((p) => (
                    <div className="projectUnit projectUnitModule" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                        <div></div>
                        <div>
                            <p>{p.projectName}</p>
                            <p>{p.projectLink}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    </div>
                ))
            },
            {
                viewName: "list",
                container: this.state.projects.map((p) => (
                        <div className="projectUnit projectUnitList" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                            <p>{p.projectName}</p>
                            <p>{p.projectLink}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    ))
            }
        ];

        this.setState((state) => ({
            currentViewIndex: 0
        }));
    }

    updateCurrentViewOption(index) {
        console.log("updateCurrentViewOption() - " + index);
        this.setState((state) => ({
            currentViewIndex: index
        }));
    }

    populateHomeView() {
        console.log("populateHomeView() - " + this.state.currentViewIndex);
        if (this.viewOptions == null || this.viewOptions == undefined || this.viewOptions.length == 0) {
            return;
        }

        if (this.state.currentViewIndex === 0) {
            d3.select("#homeView")
                .classed("moduleWrapper", true);
        } else {
            d3.select("#homeView")
                .classed("moduleWrapper", false);
        }

        return this.viewOptions[this.state.currentViewIndex].container;
    }

    onProjectClicked(projectId) {
        console.log("onProjectClicked() - " + projectId);

        // Get cookie
        const { cookies } = this.props;
        // Set a cookie key id to the project id
        cookies.set('id', projectId, { path: '/' });

        this.props.history.push(`/project/${projectId}`);
    }

    openGithubLink(projectLink) {
        console.log("openGithubLink() - " + projectLink);

        window.open(projectLink, '_blank');
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div id="home">
                <div id="projectHeader">
                    <div>
                        <ViewModuleIcon onClick={(e) => this.updateCurrentViewOption(0, e)}/>
                    </div>
                    <div>
                        <ViewListIcon onClick={(e) => this.updateCurrentViewOption(1, e)}/>
                    </div>
                </div>
                <div id="homeView">
                    {this.populateHomeView()}
                </div>
            </div>
         );
     }
}

export default Home;