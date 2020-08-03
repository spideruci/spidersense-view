import React from 'react';

import * as d3 from 'd3';

import Request from '../../network/request';

import Overview from '../Overview/Overview';
import Tarantula from '../Tarantula/Tarantula';

import "./Project.css";


class Project extends React.Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Initialize tabs
        this.tabs = [
            {
                tabName: "Overview",
                container: <Overview />
            },
            {
                tabName: "Tarantula",
                container: <Tarantula />
            }
        ];

        // Initialize state
        this.state = {
            currentTabIndex: 0
        };

        // Bind methods
        this.initializeTabs = this.initializeTabs.bind(this);
        this.updateCurrentTab = this.updateCurrentTab.bind(this);
        this.populateProjectContainer = this.populateProjectContainer.bind(this);
    } 

    componentDidMount() {
        // let req = new CorsRequest();
        let url = "http://127.0.0.1:5000/testcaseCoverage/10345";
        // req.makeCorsRequest(url);

        let req = new Request();
        let promise = req.prepareSingleRequest(url, 'json');
        promise.then((value) => {
            // this.displayCoverage(value, testCaseId);
            console.log("Successfully processed response\nvalue: " + value.response);
            console.log("Number of testcases = " + value.response.testcases.length);
        });

        this.initializeTabs();
    }

    /** =======================================================================
     * 
     * Methods
     * 
     ======================================================================= */
    initializeTabs() {
        console.log("initializeTabs() " + this.tabs);
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
    }

    updateCurrentTab(index) {
        console.log("updateCurrentTab(): " + index);
        this.setState((state) => ({
            currentTabIndex: index
        }));
    }

    populateProjectContainer() {
        console.log("populateProjectContainer(): " + this.state.currentTabIndex);
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
                        <p>Project Title</p>
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