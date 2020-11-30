import React from 'react';
import { connect } from 'react-redux';

import GitHubIcon from '@material-ui/icons/GitHub';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ViewListIcon from '@material-ui/icons/ViewList';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import { shortenGithubUrl } from '../../util/url-parsers';
import ColorSequence from '../../util/color-sequence';
import "./../../vars/shared.scss";
import "./Home.scss";
import { actionCreator } from './store';


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

        // Bind methods
        this.onProjectClicked = this.onProjectClicked.bind(this);
        this.openGithubLink = this.openGithubLink.bind(this);
    } 

    componentDidMount() {
        const { requestAllProjects, projects } = this.props;
        requestAllProjects(projects);
    }

    /**
     * Initialize view options: module view or list view. 
     * Module view:     displays projects in a card with a background color
     * List view:       displays projects in a list
     * 
     * Set current view index to the module view.
     */
    initializeViewOptions() {
        // read data from immutable
        const projects = this.props.projects.toJS()
        // Get color sequence to set background color of module project units
        let colorSequence = new ColorSequence();
        let sequence = colorSequence.getColorSequence(projects.length);

        this.viewOptions = [
            {
                viewName: "module",
                container: 
                (<div className="moduleWrapper">
                    {projects.map((p, i) => (
                    <div key={p.projectId} className="projectUnit projectUnitModule" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                        <div style={{backgroundColor: sequence[i]}}></div>
                        <div>
                            <p>{p.projectName}</p>
                            <p>{shortenGithubUrl(p.projectLink, 40)}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    </div>))}
                </div>)
                
            },
            {
                viewName: "list",
                container: projects.map((p) => (
                        <div key={p.projectId} className="projectUnit projectUnitList" onClick={(e) => this.onProjectClicked(p.projectId, e)}>
                            <p>{p.projectName}</p>
                            <p>{shortenGithubUrl(p.projectLink, 50)}</p>
                            <div>
                                <GitHubIcon onClick={(e) => this.openGithubLink(p.projectLink, e)} />
                            </div>
                        </div>
                    ))
            }
        ];
    }

    /**
     * Return the HTML for the current view option. The HTML is contained in the
     * view option's container property.
     * @return {HTML} The DOM elements of the current view option
     */
    populateHomeView() {
        this.initializeViewOptions();

        const { currentViewIndex } = this.props;

        if (this.viewOptions == null || this.viewOptions === undefined || this.viewOptions.length === 0) {
            return;
        }

        return this.viewOptions[currentViewIndex].container;
    }

    /** =======================================================================
     * 
     * METHODS - Event Handling
     * 
     ======================================================================= */
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

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
         const { updateCurrentViewOption, currentViewIndex, backdropOpen } = this.props;
         return (
            <div id="home">
                <div className="toolbar">
                    <div className="toolbarTitle">
                        <p>Welcome</p>
                    </div>
                    <div className="toolbarActions">
                        <div>
                            <ViewModuleIcon onClick={(e) => updateCurrentViewOption(0, e)}/>
                        </div>
                        <div>
                            <ViewListIcon onClick={(e) => updateCurrentViewOption(1, e)}/>
                        </div>
                    </div>
                </div>

                <div className="homeView">
                    {currentViewIndex === -1 ? <div></div> : this.populateHomeView()}   
                </div>

                <Backdrop className="backdrop" open={backdropOpen}>
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
            if (currentProjects.size === 0) {
                dispatch(actionCreator.getProjects());
            }
        },
        updateCurrentViewOption(index) {
            dispatch(actionCreator.updateViewOptions(index));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
