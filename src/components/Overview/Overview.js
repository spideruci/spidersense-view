import React, { Component } from 'react';

import * as d3 from 'd3';
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
            currentTextName: "Test",
            currentLinesOfCode: 55,
            recentCommits: []
        }
    }

    componentDidMount() {
        this.generateRecentCommitsView();
    }

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */

    generateRecentCommitsView() {
        // TODO: Get actual commits data
        const TEMP_COMMITS_DATA = [
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
            {
                commitId: "b589f83a9c6bb3631e8c796848c309c2a677b2a8",
                committer: "VijayKrishna",
                timestamp: "2020-08-18 08:56:40",
                message: "Minor Edits"
            },
        ];

        this.setState((state) => ({
            recentCommits: TEMP_COMMITS_DATA
        }));
        // let recentCommitsItems = d3.select("#recentCommitsView")
        //     .selectAll("div")
        //     .data(TEMP_COMMITS_DATA)
        //     .enter()
        //     .append("div")
        //     .classed("recentCommitsItem", true);

        // let firstWrappers = recentCommitsItems.append("div");

        // let recentCommitsMessages = firstWrappers.append("p")
        //     .text(function(t) {
        //         return t.message;
        //     })
        //     .classed("recentCommitsMessage", true);
        // let recentCommitsDescription = firstWrappers.append("p");
        // recentCommitsDescription.append("span")
        //     .text(function (t) {
        //         return t.
        //     })
        //     .classed("recentCommitsCommitter", true)
        // recentCommitsDescription.append("span")
        //     .classed("recentCommitsDate", true)

        // let recentCommitsIds = recentCommitsItems.append("div")
        //     .append("p")
        //     .classed("recentCommitsId", true);
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
                    <div className="materialCard">
                        <div>
                            <p className="materialCardNumeral">100</p>
                            <p className="materialCardDescription">Number of Commits</p>
                        </div>
                        <div>
                            {/* <img className="materialCardIcon" /> */}
                        </div>
                    </div>
                    {/* <p>File Name:</p>
                    <p>{this.state.currentTextName}</p> */}
                </div>
                <div id="recentCommitsView">
                    <p id="recentCommitsTitle">Recent Commits</p>
                    {
                        this.state.recentCommits.map((c) => (
                            <div className="recentCommitsItem">
                                <div>
                                    <p className="recentCommitsMessage">{shortenMessage(c.message)}</p>
                                    <p>
                                        <span className="recentCommitsCommitter">{c.committer}</span>
                                        <span className="recentCommitsDate"> committed on {convertTimestampToDate(c.timestamp)}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="recentCommitsId">{shortenCommitId(c.commitId)}</p>
                                </div>
                            </div>
                        ))
                    }
                    {/* <p>Lines of code:</p>
                    <p>{this.state.currentLinesOfCode}</p> */}
                </div>
            </div>
        );
    }
}

export default Overview;
