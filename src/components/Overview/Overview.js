import React from 'react';

import GitHubIcon from '@material-ui/icons/GitHub';
import HistoryIcon from '@material-ui/icons/History';

import {getUserFromGithubUrl} from '../../util/url-parsers';
import {shortenCommitId, shortenMessage, convertTimestampToDate} from '../Tarantula/TaranMenuItem';

import "./Overview.scss";


const Overview = (props) => {
    const { commits } = props;
    const project = props.project.toJS();
    console.log(project);

    return (
        <div id="overview">
            <div className="projectInfoView">
                <div className="projectInfoDetailsContainer">
                    <div>
                        <p>{project.projectName}</p>
                        <div className="navIcon">
                            <GitHubIcon onClick={() => {window.open(project.projectLink, '_blank')}} />
                        </div>
                    </div>
                    <p>{getUserFromGithubUrl(project.projectLink)}</p>
                </div>

                <div className="projectInfoCardContainer">
                    <div className="materialCard">
                        <div>
                            <p className="materialCardNumeral">{commits.length}</p>
                            <p className="materialCardDescription">Number of Commits</p>
                        </div>
                        <div>
                            <HistoryIcon />
                        </div>
                    </div>
                </div>
            </div>

            <div className="recentCommitsView">
                <p className="recentCommitsTitle">Recent Commits</p>
                {
                    commits.map((c) => (
                        <div className="recentCommitsItem" key={c.commitId}>
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

export default Overview;
