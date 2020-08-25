import React, { Component } from 'react';

import GitHubIcon from '@material-ui/icons/GitHub';
import HistoryIcon from '@material-ui/icons/History';

import {getUserFromGithubUrl} from '../../util/url-parsers';
import {shortenCommitId, shortenMessage, convertTimestampToDate} from '../Tarantula/TaranMenuItem';

import "./Overview.css";

class Overview extends Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        this.state = {
            project: props.project,
            commits: props.commits
        }

        this.openGithubLink = this.openGithubLink.bind(this);
    }

    componentDidMount() {
    }

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */
    openGithubLink() {
        console.log("openGithubLink()");

        window.open(this.state.project.projectLink, '_blank');
    }


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
    render() {
        return (
            <div className="fileInfoHeader">
                <div id="projectInfoView">
                    <div id="projectInfoDetailsContainer">
                        <div>
                            <p>{this.state.project.projectName}</p>
                            <div className="navIcon">
                                <GitHubIcon onClick={this.openGithubLink} />
                            </div>
                        </div>
                        <p>{getUserFromGithubUrl(this.state.project.projectLink)}</p>
                    </div>

                    <div id="projectInfoCardContainer">
                        <div className="materialCard">
                            <div>
                                <p className="materialCardNumeral">{this.state.commits.length}</p>
                                <p className="materialCardDescription">Number of Commits</p>
                            </div>
                            <div>
                                <HistoryIcon />
                            </div>
                        </div>
                    </div>
                </div>
                <div id="recentCommitsView">
                    <p id="recentCommitsTitle">Recent Commits</p>
                    {
                        this.state.commits.map((c) => (
                            <div className="recentCommitsItem">
                                <div>
                                    <p className="recentCommitsMessage">{shortenMessage(c.message)}</p>
                                    <p>
                                        <span className="recentCommitsCommitter">
                                            {c.committer || "<invalid-user>"}
                                        </span>
                                        <span className="recentCommitsDate"> committed on {convertTimestampToDate(c.timestamp)}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="recentCommitsId">{shortenCommitId(c.commitId)}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}

export default Overview;
