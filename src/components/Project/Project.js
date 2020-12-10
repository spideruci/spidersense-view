import React from 'react';
import { actionCreator } from './store'

import * as d3 from 'd3';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import Overview from '../Overview/Overview';
import Tarantula from '../Tarantula/Tarantula';

import {spidersenseWorkerUrls} from '../../vars/vars';
import "./../../vars/shared.scss";
import "./Project.scss";
import { connect } from 'react-redux';


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

        // Bind methods
        this.initializeTabs = this.initializeTabs.bind(this);
        this.updateCurrentTab = this.updateCurrentTab.bind(this);
        this.populateProjectContainer = this.populateProjectContainer.bind(this);
        this.closeBackdrop = this.closeBackdrop.bind(this);
    } 

    componentDidMount() {
        // Don't request details if no project id parameter
        if (this.props.match.params == null) {
            return;
        }

        this.requestProjectDetails(this.props.match.params.id);
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
        console.log("requesting project details");
        const { setProject } = this.props;

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
            setProject({
                projectId: projectId,
                projectName: proj.projectName,
                projectLink: proj.projectLink
            })

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
        const { setCommits } = this.props;
        let url = `${spidersenseWorkerUrls.getCommits}${projectId}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {
            console.log("Callback:\n" + JSON.stringify(data));

            // Initialize the tabs
            this.initializeTabs(data.builds.sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)));
            setCommits(data.builds.sort((a,b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)));
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
        console.log("initializing");
        // const project = this.props.project;

        this.tabs = [
            {
                tabName: "Overview",
                container: <Overview commits={commits} project={this.props.project}/>
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
        const { currentTabIndex, project } = this.props;
        const commits = this.props.commits.toJS();

        if (commits.length === 0 || currentTabIndex === -1) {
            return;
        }

        return currentTabIndex === 0 ? <Overview commits={commits} project={project}/> : <Tarantula commits={commits} />;
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
        const { setCurrentTabIndex } = this.props;

        setCurrentTabIndex(index);

        let tabsContainer = d3.select(".projectTabs")
            .selectAll("div")
            .classed("activeTab", false);
        tabsContainer.filter((d, i) => i === index)
            .classed("activeTab", true);
    }

    closeBackdrop() {
        const { setBackDropOpen } = this.props

        setBackDropOpen(false);
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
                        <p>{this.props.project.projectName}</p>
                    </div>
                    <div></div>
                </div>

                <div className="projectContent">
                    <div className="projectTabs"></div>

                    <div className="projectContainer">
                        {this.populateProjectContainer()}
                    </div>
                </div>

                <Backdrop className="backdrop" open={this.props.backdropOpen}>
                        <CircularProgress color="inherit" />
                </Backdrop>
            </div>
        );
     }
}

const mapStateToProps = (state) => {
    return {
        commits: state.getIn(['project', 'project', 'commits']),
        project: state.getIn(['project', 'project', 'project']),
        currentTabIndex: state.getIn(['project', 'project', 'currentTabIndex']),
        backdropOpen: state.getIn(['project', 'project', 'backdropOpen'])
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setBackDropOpen(isOpen) {
            dispatch(actionCreator.updateBackdropOpen(isOpen))
        },
        setCurrentTabIndex(index) {
            dispatch(actionCreator.updateCurrentTabIndex(index))
        },
        setProject(project) {
            dispatch(actionCreator.updateProject(project))
        },
        setCommits(commits) {
            dispatch(actionCreator.updateCommits(commits))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Project);