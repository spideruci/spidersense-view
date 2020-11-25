import React from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';

import GitHubIcon from '@material-ui/icons/GitHub';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ViewListIcon from '@material-ui/icons/ViewList';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { spidersenseWorkerUrls } from '../../vars/vars';
import { shortenGithubUrl } from '../../util/url-parsers';
import ColorSequence from '../../util/color-sequence';
import "./../../vars/shared.scss";
import "./Home.scss";
import * as constants from './store/constants'
import { actionCreator } from './store';
import { logDOM } from '@testing-library/react';


class Home extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Variables
        this.viewOptions = [];

        // Initalize state
        // this.state = {
        //     projects: [],
        //     currentViewIndex: -1,
        //     backdropOpen: true
        // };

        // Bind methods
        // this.updateCurrentViewOption = this.updateCurrentViewOption.bind(this);
        this.onProjectClicked = this.onProjectClicked.bind(this);
        this.openGithubLink = this.openGithubLink.bind(this);
    } 

    componentDidMount() {
        console.log("component did mount: 123123123");
        const { requestAllProjects, projects } = this.props;
        // console.log(projects);
        requestAllProjects(projects);
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
    // requestAllProjects() {
    //     let url = spidersenseWorkerUrls.getAllProjects;

    //     fetch(url, {
    //         method: 'GET'
    //     }).then((response) => {
    //         return response.json();
    //     }).then((data) => {
    //         console.log("Callback:\n" + JSON.stringify(data));

    //         // Update state to retain projects
    //         this.setState((state) => ({
    //             projects: data.projects
    //         }))

    //         this.initializeViewOptions();
    //         this.closeBackdrop();
    //     }).catch((error) => {
    //         console.error(error);
    //         this.closeBackdrop();
    //     });
    // }

    /**
     * Initialize view options: module view or list view. 
     * Module view:     displays projects in a card with a background color
     * List view:       displays projects in a list
     * 
     * Set current view index to the module view.
     */
    initializeViewOptions() {
        // Get color sequence to set background color of module project units
        let colorSequence = new ColorSequence();
        let sequence = colorSequence.getColorSequence(this.props.projects.length);
        console.log(this.props.projects);
        const projects = this.props.projects.toJS()

        this.viewOptions = [
            {
                viewName: "module",
                container: projects.map((p, i) => (
                    <div className="projectUnit projectUnitModule" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                        <div style={{backgroundColor: sequence[i]}}></div>
                        <div>
                            <p>{p.projectName}</p>
                            <p>{shortenGithubUrl(p.projectLink, 40)}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    </div>
                ))
            },
            {
                viewName: "list",
                container: projects.map((p) => (
                        <div className="projectUnit projectUnitList" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                            <p>{p.projectName}</p>
                            <p>{shortenGithubUrl(p.projectLink, 50)}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    ))
            }
        ];

        console.log(this.viewOptions);

        // Update state to set currentViewIndex to module
        // this.setState((state) => ({
        //     currentViewIndex: 0
        // }));
    }

    /**
     * Return the HTML for the current view option. The HTML is contained in the
     * view option's container property.
     * @return {HTML} The DOM elements of the current view option
     */
    populateHomeView() {
        this.initializeViewOptions();

        if (this.viewOptions == null || this.viewOptions === undefined || this.viewOptions.length === 0) {
            console.log("null view option");
            return;
        }

        // If current view index is module, add moduleWrapper class
        if (this.props.currentViewIndex === 0) {
            d3.select(".homeView")
                .classed("moduleWrapper", true);
        } else {
            d3.select(".homeView")
                .classed("moduleWrapper", false);
        }

        console.log(this.props.currentViewIndex);

        return this.viewOptions[this.props.currentViewIndex].container;
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
    // updateCurrentViewOption(index) {
    //     this.setState((state) => ({
    //         currentViewIndex: index
    //     }));
    // }

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
     * @param {Object} event The event object
     */
    openGithubLink(projectLink, event) {
        event.stopPropagation();
        window.open(projectLink, '_blank');
    }

    // closeBackdrop() {
    //     this.setState((state) => ({
    //         backdropOpen: false
    //     }));
    // }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         return (
            <div id="home">
                <div className="toolbar">
                    <div className="toolbarTitle">
                        <p>Welcome</p>
                    </div>
                    <div className="toolbarActions">
                        <div>
                            <ViewModuleIcon onClick={(e) => this.props.updateCurrentViewOption(0, e)}/>
                        </div>
                        <div>
                            <ViewListIcon onClick={(e) => this.props.updateCurrentViewOption(1, e)}/>
                        </div>
                    </div>
                </div>

                <div className="homeView">
                    {this.props.currentViewIndex === -1 ? <div></div> : this.populateHomeView()}
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
        projects: state.getIn(['home', 'projects']),
        currentViewIndex: state.getIn(['home', 'currentViewIndex']),
        backdropOpen: state.getIn(['home', 'backdropOpen'])
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        requestAllProjects(currentProjects) {
            console.log(currentProjects);
            if (currentProjects.size === 0) {
                console.log("inside if");
                dispatch(actionCreator.getProjects());
            }
            // currentProjects.length === 0 && dispatch(actionCreator.getProjects());
        },
        updateCurrentViewOption(index) {
            dispatch(actionCreator.updateViewOptions(index));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
