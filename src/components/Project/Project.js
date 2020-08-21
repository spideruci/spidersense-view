import React from 'react';

import * as d3 from 'd3';

import Overview from '../Overview/Overview';
import Tarantula from '../Tarantula/Tarantula';

import { spidersenseWorkerUrls } from '../../util/vars';
import "./Project.css";


class Project extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        console.log("Match params id: " + props.match.params.id);

        // Initialize state
        this.state = {
            project: {
                projectId: props.match.params.id,
                projectName: "",
                projectLink: ""
            },
            currentTabIndex: -1
        };

        // Bind methods
        this.initializeTabs = this.initializeTabs.bind(this);
        this.updateCurrentTab = this.updateCurrentTab.bind(this);
        this.populateProjectContainer = this.populateProjectContainer.bind(this);
    } 

    componentDidMount() {
        if (this.props.match.params == null) {
            return;
        }

        this.requestCommits(this.state.project.projectId);
    }

    /** =======================================================================
     * 
     * Methods
     * 
     ======================================================================= */

    /**
     * Request commits from SpiderSense-worker. The data returned is expected to 
     * be the commit ids (shas). Update the state to retain those commits.
     * @param   {number}    projectId   The project id
     */
    requestCommits(projectId) {
        console.log("requestCommits()");
        let url = `${spidersenseWorkerUrls.getCommits}/${projectId}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            // Request project information again
            this.requestProjectDetails(projectId, data.builds);
        }).catch((error) => {
            console.error(error);
        });
    }

    // TODO: update to query project based on id
    requestProjectDetails(projectId, builds) {
        console.log("requestProjectDetails()");
        let url = spidersenseWorkerUrls.getAllProjects;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            let proj = data.projects.filter((d, i) => {
                return d.projectId === projectId;
            });

            if (proj.length === 0) {
                console.error("Unable to find project id");
                return;
            }

            let projName = proj[0].projectName;
            let projLink = proj[0].projectLink;

            // Update state to retain projects
            this.setState((state) => ({
                project: {
                    projectId: state.projectId,
                    projectName: projName,
                    projectLink: projLink
                } 
            }))

            // Initialize the tabs
            this.initializeTabs(builds);
        }).catch((error) => {
            console.error(error);
        });
    }

    initializeTabs(commits) {
        console.log("initializeTabs()");

        // Initialize tabs
        this.tabs = [
            {
                tabName: "Overview",
                container: <Overview commits={commits} project={this.state.project}/>
            },
            {
                tabName: "Tarantula",
                container: <Tarantula commits={commits} />
            }
        ];

        let tabs = d3.select("#projectTabs")
            .selectAll("div")
            .data(this.tabs)
            .enter()
            .append("div")
            .on('click', (e, index) => {
                this.updateCurrentTab(index);
            })
            .append("p")
            .text(function(t) {
                return t.tabName;
            });
        
        // Set state so that current tab is the Overview (forces re-render)
        this.setState((state) => ({
            currentTabIndex: 0
        }));
    }

    updateCurrentTab(index) {
        console.log("updateCurrentTab(): " + index);
        this.setState((state) => ({
            currentTabIndex: index
        }));
    }

    populateProjectContainer() {
        console.log("populateProjectContainer(): " + this.state.currentTabIndex);
        if (this.tabs == null || this.tabs == undefined || this.tabs.length == 0) {
            return;
        }

        return this.tabs[this.state.currentTabIndex].container;
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
        return (
            <div id="project">
                <div id="projectHeader">
                    <div>
                        <p>{this.state.project.projectName}</p>
                    </div>
                </div>

                <div id="projectContent">
                    <div id="projectTabs"></div>

                    <div id="projectContainer">
                        {this.populateProjectContainer()}
                    </div>
                </div>
            </div>
        );
     }
}

export default Project;