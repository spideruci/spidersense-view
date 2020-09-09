import React from 'react';
import * as d3 from 'd3';

import GitHubIcon from '@material-ui/icons/GitHub';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ViewListIcon from '@material-ui/icons/ViewList';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { spidersenseWorkerUrls } from '../../vars/vars';
import "./Home.scss";


class Home extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.viewOptions = [];

        // Initalize state
        this.state = {
            projects: [],
            currentViewIndex: -1,
            backdropOpen: true
        };

        // Bind methods
        this.updateCurrentViewOption = this.updateCurrentViewOption.bind(this);
        this.onProjectClicked = this.onProjectClicked.bind(this);
        this.openGithubLink = this.openGithubLink.bind(this);
    } 

    componentDidMount() {
        this.requestAllProjects();
    }

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */

    /**
     * Request from spidersense-worker all available projects. On response, 
     * update state to retain projects and initialize view options.
     */
    requestAllProjects() {
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
            this.closeBackdrop();
        }).catch((error) => {
            console.error(error);
            this.closeBackdrop();
        });
    }

    /**
     * Initialize view options: module view or list view. 
     * Module view:     displays projects in a card with a background color
     * List view:       displays projects in a list
     * 
     * Set current view index to the module view.
     */
    initializeViewOptions() {
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

        // Update state to set currentViewIndex to module
        this.setState((state) => ({
            currentViewIndex: 0
        }));
    }

    /**
     * Return the HTML for the current view option. The HTML is contained in the
     * view option's container property.
     * @return {HTML} The DOM elements of the current view option
     */
    populateHomeView() {
        if (this.viewOptions == null || this.viewOptions == undefined || this.viewOptions.length == 0) {
            return;
        }

        // If current view index is module, add moduleWrapper class
        if (this.state.currentViewIndex === 0) {
            d3.select(".homeView")
                .classed("moduleWrapper", true);
        } else {
            d3.select(".homeView")
                .classed("moduleWrapper", false);
        }

        return this.viewOptions[this.state.currentViewIndex].container;
    }

    /** =======================================================================
     * 
     * METHODS - Event Handling
     * 
     ======================================================================= */

    /**
     * Update the state to set currentViewIndex to the selected index
     * @param {number} index The selected view index
     */
    updateCurrentViewOption(index) {
        this.setState((state) => ({
            currentViewIndex: index
        }));
    }

    /**
     * On click of a project, update cookie's id to the selected project id
     * and navigate to Project component with parameter projectId.
     * @param {number} projectId The id of the selected project
     */
    onProjectClicked(projectId) {
        const { cookies } = this.props;
        cookies.set('id', projectId, { path: '/' });

        this.props.history.push(`/project/${projectId}`);
    }

    /**
     * On click of the Github icon, open a new tab to that Github link
     * @param {string} projectLink The url to the Github repo
     */
    openGithubLink(projectLink) {
        window.open(projectLink, '_blank');
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
            <div id="home">
                <div className="projectHeader">
                    <div>
                        <ViewModuleIcon onClick={(e) => this.updateCurrentViewOption(0, e)}/>
                    </div>
                    <div>
                        <ViewListIcon onClick={(e) => this.updateCurrentViewOption(1, e)}/>
                    </div>
                </div>
                <div className="homeView">
                    {this.populateHomeView()}
                </div>

                <Backdrop className="backdrop" open={this.state.backdropOpen}>
                        <CircularProgress color="inherit" />
                </Backdrop>
            </div>
         );
     }
}

export default Home;