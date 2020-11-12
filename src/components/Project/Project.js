import React from 'react';

import * as d3 from 'd3';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import Overview from '../Overview/Overview';
import Tarantula from '../Tarantula/Tarantula';

import {spidersenseWorkerUrls} from '../../vars/vars';
import "./../../vars/shared.scss";
import "./Project.scss";


class Project extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Variables
        this.tabs = [];

        // Initialize state
        this.state = {
            project: {
                projectId: props.match.params.id,
                projectName: "",
                projectLink: ""
            },
            currentTabIndex: -1,
            backdropOpen: true
        };

        // Bind methods
        this.initializeTabs = this.initializeTabs.bind(this);
        this.updateCurrentTab = this.updateCurrentTab.bind(this);
        this.populateProjectContainer = this.populateProjectContainer.bind(this);
    } 

    componentDidMount() {
        // console.log("Match params id: " + props.match.params.id);

        // Don't request details if no project id parameter
        if (this.props.match.params == null) {
            return;
        }

        this.requestProjectDetails(this.state.project.projectId);
    }

    /** =======================================================================
     * 
     * Methods
     * 
     ======================================================================= */

    /**
     * Request from spidersense-worker details associated with the given
     * project id. On response, update state to project object consisting
     * of:
     * 1) project id
     * 2) project name
     * 3) project link
     * @param {number} projectId The project id to request details from
     */
    requestProjectDetails(projectId) {
        let url = `${spidersenseWorkerUrls.getProject}${projectId}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            let projects = data.projects;
            let proj = projects[0];

            // Update state to retain projects
            this.setState((state) => ({
                project: {
                    projectId: state.projectId,
                    projectName: proj.projectName,
                    projectLink: proj.projectLink
                } 
            }))

            // Request commits
            this.requestCommits(projectId);
        }).catch((error) => {
            console.error(error);
            this.closeBackdrop();
        });
    }

    /**
     * Request from spidersense-worker the commits for the project. The data 
     * returned is expected to be the commit ids (shas). Pass the list of commits
     * to the tabs.
     * @param {number} projectId The project id
     */
    requestCommits(projectId) {
        let url = `${spidersenseWorkerUrls.getCommits}${projectId}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            // Initialize the tabs
            this.initializeTabs(data.builds.sort((a,b)=>Date.parse(b.timestamp) - Date.parse(a.timestamp)));
            this.closeBackdrop();
        }).catch((error) => {
            console.error(error);
            this.closeBackdrop();
        });
    }

    /**
     * Initialize tabs: Overview and Tarantula.
     * Overview:        Displays details of the project
     * Tarantula:       Visualizes fault localization of files/statements of the project
     * 
     * Set current tab to Overview.
     * @param {Array} commits The list of commit objects
     */
    initializeTabs(commits) {
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

        // Bind tabs to project tabs DOM nodes
        d3.select(".projectTabs")
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
        
        // Update state to set current tab to Overview (re-renders)
        this.updateCurrentTab(0);
    }

    /**
     * Return the HTML for the current tab index. The HTML is contained in the
     * tab's container property.
     * @return {HTML} The DOM elements of the current tab
     */
    populateProjectContainer() {
        if (this.tabs == null || this.tabs === undefined || this.tabs.length === 0) {
            return;
        }

        return this.tabs[this.state.currentTabIndex].container;
    }

    /** =======================================================================
     * 
     * METHODS - Event Handling
     * 
     ======================================================================= */

    /**
     * Update the state to set currentTabIndex to the selected index. 
     * Also update the activeTab class.
     * @param {number} index The selected tab index
     */
    updateCurrentTab(index) {
        this.setState((state) => ({
            currentTabIndex: index
        }));

        let tabsContainer = d3.select(".projectTabs")
            .selectAll("div")
            .classed("activeTab", false);
        tabsContainer.filter((d, i) => i === index)
            .classed("activeTab", true);
    }

    closeBackdrop() {
        this.setState((state) => ({
            backdropOpen: false
        }));
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
        return (
            <div id="project">
                <div className="toolbar">
                    <div className="toolbarTitle">
                        <p>{this.state.project.projectName}</p>
                    </div>
                    <div></div>
                </div>

                <div className="projectContent">
                    <div className="projectTabs"></div>

                    <div className="projectContainer">
                        {this.populateProjectContainer()}
                    </div>
                </div>

                <Backdrop className="backdrop" open={this.state.backdropOpen}>
                        <CircularProgress color="inherit" />
                </Backdrop>
            </div>
        );
     }
}

export default Project;