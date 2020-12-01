import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';

import { actionCreator } from './store';

import CommitHeader from './CommitHeader'
import TestDirectory from './TestDirectory'
import CodeContainer from './CodeContainer';

import * as d3 from 'd3';
import {extractSourceNameFromRawGithubUrl, extractFileNameFromSourceName} from '../../util/file-name-parser';
import SuspiciousnessV2 from '../../models/SuspiciousnessV2';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import { spidersenseWorkerUrls } from '../../vars/vars';
import "./Tarantula.scss";
import "./MaterialCheckbox.css";
import "./Tooltip.css";
import { act } from 'react-dom/test-utils';



class Tarantula extends Component {
    commitWrapper = createRef();

    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Constants
        this.FONT_SIZE = 1;            // Font size for svg text
        this.BATCH_SIZE = 100;
        this.Y_TEXT_PADDING = 1;       // Top padding for each tspan
        this.SVG_WIDTH = 48;           // Width of each minimap
        this.SVG_MAX_HEIGHT = 300;     // Height of each minimap
        this.PIXELS_PER_LINE = this.FONT_SIZE + this.Y_TEXT_PADDING;    // # of pixels making up 1 line
        this.LINES_PER_SVG = Math.floor(this.SVG_MAX_HEIGHT / this.PIXELS_PER_LINE);    // # of lines per svg 
        this.TABLE_BODY_WIDTH = 700;           // Width of display scroll container table
        this.SCROLL_FONT_SIZE = 12;            // Font size of td element 
        this.SCROLL_CONTAINER_PADDING = 12;    // Padding of display scroll container
        this.SUBMIT_MARGIN = 120;

        // const SCROLL_CONTAINER_HEIGHT = 512;
        // this.DIRECTORY_HEIGHT = this.SVG_MAX_HEIGHT + 16 + 12 + 14 + SCROLL_CONTAINER_HEIGHT;
        this.DIRECTORY_HEIGHT = 864;

        // Bind methods
        this.generateDirectoryView = this.generateDirectoryView.bind(this);
        this.onSourceNameChecked = this.onSourceNameChecked.bind(this);
        this.generateFileContainers = this.generateFileContainers.bind(this);
        this.generateMinimap = this.generateMinimap.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.generateSlider = this.generateSlider.bind(this);
        this.generateDisplay = this.generateDisplay.bind(this);
        this.requestCoverage = this.requestCoverage.bind(this);
        this.requestAllCoverage = this.requestAllCoverage.bind(this);
        this.displayCoverageOnMinimap = this.displayCoverageOnMinimap.bind(this);
        this.displayCoverageOnDisplay = this.displayCoverageOnDisplay.bind(this);
        this.onPassedOrFailedButtonClicked = this.onPassedOrFailedButtonClicked.bind(this);
        this.onClearOrAllButtonClicked = this.onClearOrAllButtonClicked.bind(this);
        this.onViewScoresClicked = this.onViewScoresClicked.bind(this);
        this.onCoverableLineClicked = this.onCoverableLineClicked.bind(this);

        this.onSelectCommitChanged = this.onSelectCommitChanged.bind(this);
        this.onViewScoresClicked = this.onViewScoresClicked.bind(this);
        this.onDialogClose = this.onDialogClose.bind(this);

        this.generateViewDialog = this.generateViewDialog.bind(this);
        this.generateSuspDialog = this.generateSuspDialog.bind(this);
    } 

    componentDidMount() {
        const { commits } = this.props
        if (commits.length !== 0) {
            this.onSelectCommitChanged(commits[0].commitId);
        }
    }

    /** =======================================================================
     * 
     * METHODS - Requests
     * 
     ======================================================================= */

    /**
     * Request from spidersense-worker the raw links to the source files on
     * Github given the commit id. On response, pass the source links to
     * download the contents.
     * 
     * The urls have been built on the server side using these factors:
     * - <base_url>/<github_user>/<repository_name>/<path_to_file>
     * @param {string} sha The commit id
     */
    requestSourceLinks(sha) {
        const { setRequestingFromWorker } = this.props;
        let url = `${spidersenseWorkerUrls.getSourceInfo}${sha}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {            
            this.downloadContentsFromGithub(data.sourceLinks);
        }).catch((error) => {
            console.error(error);
            setRequestingFromWorker(false);
        });
    }

    /**
     * Request from Github the source files given the links to those
     * files. On response, generate file containers, then generate 
     * the minimaps for each file, and finally request the test cases.
     * @param {array} sourceLinks The urls to the source files
     */
    downloadContentsFromGithub(sourceLinks) {
        const { setAllFiles, setRequestingFromWorker } = this.props;

        // Get names of source links and links in different arrays
        let names = sourceLinks.map((u) => {
            return extractSourceNameFromRawGithubUrl(u);
        })
        let urls = sourceLinks;

        // Make the request for all files
        Promise.all(urls.map((req) => {
            return fetch(req).then((response) => {
                return response.text();
            })
            .then((data) => {
                return data;
            });
        })).then((fileTexts) => {
            console.log('Callback:\n', fileTexts);

            // Generate file container
            const numberOfFileContainers = fileTexts.length;
            this.generateFileContainers(numberOfFileContainers);

            let allFiles = new Array(numberOfFileContainers);

            for (let i = 0; i < fileTexts.length; i++) {
                // console.log(`File text: ${fileTexts[i]}`);

                // Get text and split by newline, for each empty element, replace with newline
                let text = fileTexts[i];
                let textArray = text.split("\n");
                textArray = textArray.map((l) => {
                    return (l.length === 0) ? "\n" : l;
                });

                // Create object to add as element to allFiles array
                let o = {
                    name: names[i],
                    contents: textArray
                }
                allFiles[i] = o;

                // Generate minimap(s) for the current file
                this.generateMinimap(extractFileNameFromSourceName(names[i]), textArray, i);
            }

            // Update state so that allFiles contains the text of each file retrieved
            setAllFiles(allFiles)

            // Make request to get test coverage
            this.requestTestcases();
        }).catch((error) => {
            console.error(error);
            setRequestingFromWorker(false)
        });
    }

    /**
     * Request from spidersense-worker all testcases for the current project using
     * the selected commit id. On response, generate the directory view.
     */
    requestTestcases() {
        const { selectedCommit, setRequestingFromWorker } = this.props;

        let url = `${spidersenseWorkerUrls.getAllTestcases}${selectedCommit}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {            
            // console.log("Callback:\n" + JSON.stringify(data));

            this.generateDirectoryView(data);
            this.requestAllCoverage();
            setRequestingFromWorker(false)
        }).catch((error) => {
            console.error(error);
            setRequestingFromWorker(false)
        });
    }

    requestAllCoverage() {
        const { 
            setRequestingCoverage, 
            setTotalBatches, 
            setRetrievedBatches,
            setAllFormatedTestMap,
            retrievedBatches } = this.props;
        const allFiles = this.props.allFiles.toJS();

        // Get the test ids of activated (checked) tests 
        let allTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .map(n => n.getAttribute("key"));

        // Return if there are no activated test cases
        if (allTestCases.length === 0) {
            return;
        }
    
        // console.log("Activated tests: " + activatedTestCases);
        let tests = []
        let currentBatch = ''
        allTestCases.forEach((t, i) => {
            if (i !== 0 && i % this.BATCH_SIZE === 0) {
                tests.push(currentBatch.slice(0, currentBatch.length - 1))
                currentBatch = ''
            }
            currentBatch += t + ','
        })
        if (currentBatch !== '') {
            tests.push(currentBatch.slice(0, currentBatch.length - 1))
        }
        setRequestingCoverage(true)
        setTotalBatches(tests.length)
        
        Promise.all(tests.map((batch) => {
            var formdata = new FormData();
            formdata.append("tlist", batch);
            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };            
            return fetch(spidersenseWorkerUrls.batchTestcaseCoverage, requestOptions)
            .then(response => {
                setRetrievedBatches(retrievedBatches + 1)
                return response.json();
            })
            // .then((data) => {
            //     return data;
            // });
        })).then(responses => {
            let suspiciousnessScores = [];
            let formatedTests = [];
            let allFormatedTests = {};
            for (let i = 0; i < responses.length; i++) {
                let result = responses[i]
                // console.log(result)
                let testList = tests[i].split(',')
                formatedTests = testList.map(e => {
                    allFormatedTests['t' + e] = {testcases: result['t' + e]};
                    return {testcases: result['t' + e]};
                })
                // console.log(testList)
                let fileNames = allFiles.map((f) => {
                    return f.name;
                });
                let susp2 = new SuspiciousnessV2();
                let output = susp2.computeSuspiciousness(formatedTests, fileNames);
                suspiciousnessScores = suspiciousnessScores.concat(...output)
            }
            // Update state to retain scores
            setAllFormatedTestMap(allFormatedTests);
            setRetrievedBatches(retrievedBatches + 1)
        })
        .then((res)=> {
            setRequestingCoverage(false)
        })
        .catch((error) => {
            console.error(error);
        });
    }

    requestCoverage() {
        const allFiles = this.props.allFiles.toJS()
        const allFormatedTestsMap = this.props.allFormatedTestsMap.toJS()
        const { setSuspicousness } = this.props;

        this.removeExistingCoverage();
    
        this.setViewScoresDisabled();
    
        // Get the test ids of activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));
    
        // Return if there are no activated test cases
        if (activatedTestCases.length === 0) {
            return;
        }
    
        // console.log("Activated tests: " + activatedTestCases);
        let formatedTests = activatedTestCases.map((key)=> allFormatedTestsMap['t' + key]);
        let susp2 = new SuspiciousnessV2();
        let fileNames = allFiles.map((f) => {
            return f.name;
        });
        let output = susp2.computeSuspiciousness(formatedTests, fileNames);
        // Update state to retain scores
        setSuspicousness(output)

        // Display coverage on minimap
        this.displayCoverageOnMinimap(output);
    
        // Display coverage on display view
        this.displayCoverageOnDisplay(output);
    }
    
    /** =======================================================================
     * 
     * METHODS - File Containers and Minimap
     * 
     ======================================================================= */

    /**
     * Creates a container for each file requested. The file containers will hold
     * additional wrappers for the file name and each svg element of the file. 
     * Add click listener to file containers to update the selection.
     * @param {number} numFiles The number of files
     */
    generateFileContainers(numFiles) {
        console.log("generating file container: " + numFiles);
        let horizontalScollViewD3 = d3.select("#horizontalScrollView")
            .style("width", this.TABLE_BODY_WIDTH + "px")
            .style("overflow-x", "scroll");
        
        for (let i = 0; i < numFiles; i++) {
            horizontalScollViewD3.append("div")
                .classed('fileContainer', true)
                .on('click', (e) => {
                    this.updateSelection(i, e);
                });
        }
    }

    /**
     * Generates the minimap(s) for each file that was requested.
     * Calculates how many maps should be added, the height for each map, and
     * the tspan elements that should be embedded for each svg element.
     * @param   {string}    fileName        The name of the current file
     * @param   {number}    txtLineByLine   The lines of the file as an array
     * @param   {number}    fileIndex       The index of the current file
     */
    generateMinimap(fileName, txtLineByLine, fileIndex) {
        // Calculate variables
        const linesOfCode = txtLineByLine.length;
        let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);
        // console.log("\tLOC: " + linesOfCode 
        //     + "\n\tAvailable svg height:" + this.SVG_MAX_HEIGHT 
        //     + "\n\tPixels per line: " + this.PIXELS_PER_LINE
        //     + "\n\tLines per svg: " + this.LINES_PER_SVG
        //     + "\n\tTotal height for file: " + totalHeightForFile 
        //     + "\n\tNumber of svgs: " + numberOfSvgs);

        // Get handle on file container at index
        let fileContainer = d3.selectAll('.fileContainer')
            .filter(function(d, i) {return i === fileIndex})

        // Set title for file container
        let titleContainer = fileContainer.append('div');
        titleContainer.append('p')
            .text(fileName);

        // Append a div that will act as the container for svg elements
        let svgContainerD3 = fileContainer.append('div')
            .classed('svgContainer', true);

        // For each svg...
        for (let i = 0; i < numberOfSvgs; i++) {
            // Set width, height, y offset, and append elements
            let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
                        (totalHeightForFile % this.SVG_MAX_HEIGHT);

            let divI = svgContainerD3.append("div");
            let svgI = divI.append("svg")
                .attr("width", this.SVG_WIDTH + "px")
                .attr("height", svgHeight);
            let textI = svgI.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .style('font-size', this.FONT_SIZE.toString() + "px");;

            // Find the number of lines for the current svg
            let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? this.LINES_PER_SVG :
                                (linesOfCode % this.LINES_PER_SVG);

            // console.log("svg #" + i + "\nsvg height: " + svgHeight 
            //     + "\nMax lines current svg: " + maxLinesInCurrentSvg + "\n\n");

            // For each line of current svg, create a tspan element, add attributes, set text, and append
            for (let j = 0; j < maxLinesInCurrentSvg; j++) {
                textI.append("tspan")
                    .attr("x", 0)
                    .attr("y", (this.PIXELS_PER_LINE * j))
                    .text(txtLineByLine[(this.LINES_PER_SVG * i) + j]);
            }
        }
    }

    /** =======================================================================
     * 
     * METHODS - Directory View
     * 
     ======================================================================= */

    /**
     * Generates the directory given the source names and testcases for each 
     * source. Each source name and test case should have label and an 
     * input (checkbox). Update state to retain testcases, and add click listeners 
     * to each input.
     * @param {Object} response The response received
     */
    generateDirectoryView(response) {
        const { setTestcases } = this.props;

        // Reformat so that each property of object is an object in an array
        let testcasesData = [];
        for (let k of Object.keys(response)) {
            let o = {};
            o[k] = response[k];
            testcasesData.push(o);
        }
        // console.log("testcasesData: " + JSON.stringify(testcasesData));
        
        // Bind data to divs under directory container
        let directorySources = d3.select("#directoryContainer")
            .style("min-width", "288px")
            .style("height", this.DIRECTORY_HEIGHT.toString() + "px")
            .style("padding", "8px")
            .selectAll("div")
            .data(testcasesData)
            .enter()
            .append("div")
            .classed("sourceNameContainer", true);
        
        // For each source name, add a checkbox (when checked, will check all testcases)
        let sourcesContainers = directorySources.append("div")
            .classed("checkboxWrapper sourceName", true);
        let sourcesLabels = sourcesContainers.append("label")
            .classed("pure-material-checkbox", true);
        sourcesLabels.append("input")
            .attr("type", "checkbox")
            .attr("key", function(t) {return Object.keys(t)[0]});
        sourcesLabels.append("span")
            .text(function(t) {return Object.keys(t)[0]});

        // For each source name, add checkboxes equal to # of testcases 
        let testcasesContainer = directorySources.append("div")
            .classed("testcaseNameContainer", true)
            .selectAll("div")
            .data(function(t) {
                let k = Object.keys(t)[0];
                return t[k];
            })
            .enter()
            .append("div")
            .classed("checkboxWrapper testcase", true);

        // Add Pass or Fail status of testcase
        testcasesContainer.append("p")
            .text(function(t) { return (t.passed === 1) ? "P" : "F" })
            .style("color", function(t) {
                return (t.passed === 1) ? "green" : "red";
            });

        // For each testcase, add a checkbox
        let testcasesLabels = testcasesContainer.append("label")
            .classed("pure-material-checkbox", true);
        testcasesLabels.append("input")
            .attr("type", "checkbox")
            .attr("key", function(t) {return t.testcaseId});
        testcasesLabels.append("span")
            .text(function(t) {return t.signature});

        // Update state for testcases
        setTestcases(testcasesData)

        // Add click listeners for checkboxes
        d3.selectAll(".sourceName input")
            .on('click', () => {
                this.onSourceNameChecked(d3.event.target.getAttribute("key"), d3.event.target.checked);
            });
        d3.selectAll(".testcase input")
            .on('click');
    }

    /** =======================================================================
     * 
     * METHODS - Display View (Scroll container)
     * 
     ======================================================================= */

    /**
     * Generates the display for whichever file was clicked. This function is
     * called from updateSelection() when a click event on a file container occurs.
     * @param {number} index The index of the file container that was clicked.
     * Update the state to save the scrollContainerHeight
     */
    generateDisplay(index) {
        const { setScrollContainerHeight } = this.props
        const allFiles = this.props.allFiles.toJS();

        // Grab contents from state
        let obj = allFiles[index];
        let content = obj.contents;

        // Clear everything in scroll view
        d3.select("#scrollContainer").selectAll("*").remove();

        console.log("TABLE WIDTH: " + (this.TABLE_BODY_WIDTH - (this.SCROLL_CONTAINER_PADDING * 2)));

        let table = d3.select("#scrollContainer")
            .append("table")
            .attr('width', (this.TABLE_BODY_WIDTH - (this.SCROLL_CONTAINER_PADDING * 2)) + "px")
        let tablebody = table
            .append("tbody");

        // Add # of table rows matching # of lines
        let rows = tablebody
            .selectAll("tr")
            .data(content)
            .enter()
            .append("tr");

        // Add number for each row, and line for each row
        rows.append("td")
            .data(content)
            .text((_, i) => i + 1)
            .style('font-size', this.SCROLL_FONT_SIZE.toString() + "px");
        rows.append("td")
            .data(content)
            .text(d => d)
            .attr("style","white-space:pre")
            // .attr("style", "overflow-x: scroll")
            .style('font-size', this.SCROLL_FONT_SIZE.toString() + "px");
        
        // Add padding to view
        d3.select("#scrollContainer")
            .style("padding", this.SCROLL_CONTAINER_PADDING.toString() + "px")
            .style("overflow-y", "scroll");

        // Update state scroll container height
        let scrollContainer = d3.select('#scrollContainer').node();
        let scrollHeight =  scrollContainer.scrollHeight;
        setScrollContainerHeight(scrollHeight)
    }

    /**
     * Generate the slider for the current file container. Within this method, there
     * are 3 events that are added and managed:
     * (1) mousedown - user clicks on a part of the minimap (current or new)
     * (2) drag - user drags the slider up and down the minimap. User can't drag out of
     *          the minimap. Event occurs after mousedown.
     * (3) scroll - user scrolls the display view, the scroll container. When the user
     *          drags, the scroll container is updated, and when the user scrolls the
     *          scroll container, the minimap updates.
     * @param {number} index The index of the file container that was clicked.
     */
    generateSlider(index) {
        const { numberOfSvgs, scrollContainerHeight } = this.props;
        const allFiles = this.props.allFiles.toJS();
        const minimapMaxHeights = this.props.minimapMaxHeights.toJS();
        // Remove all existing sliders and drag behaviors first
        d3.selectAll(".sliderRect").remove();

        // Define states for slider
        const sliderState = {
            BASE: "base",
            TRANSITION_NEXT: "next",
            TRANSITION_BACK: "back"
        };

        let currentSliderState = sliderState.BASE;

        // Define constants
        const SVG_WIDTH = this.SVG_WIDTH;
        const SVG_MAX_HEIGHT = this.SVG_MAX_HEIGHT;
        const SCROLL_HEIGHT = 512;

        // Define variables
        let slider;
        let transitionSlider;
        let currentSvgIndex = 0;

        let maxNumSvgs= numberOfSvgs;
        let currentMinimapHeight = minimapMaxHeights[currentSvgIndex];
        let newScrollContainerHeight = scrollContainerHeight - SCROLL_HEIGHT;

        let contents = allFiles[index].contents;
        let multiplier = newScrollContainerHeight / (contents.length * this.PIXELS_PER_LINE);

        // Use multiplier to calculate slider's height
        const SLIDER_HEIGHT = Math.floor((SCROLL_HEIGHT - (this.SCROLL_CONTAINER_PADDING * 2)) / multiplier);

        // console.log("Max number of svgs: " + maxNumSvgs 
        //     + "\ncurrentMinimapHeight: " + currentMinimapHeight
        //     + "\nscrollContainer height: " + scrollContainerHeight
        //     + "\nmultiplier: " + multiplier);

        // Get handle on the scroll container
        let scrollContainer = document.getElementById('scrollContainer');

        // Initialize first slider
        slider = d3.selectAll(".fileContainer")
            .filter(function(d, i) {return i === index})
            .select(".svgContainer")
            .select("div")
            .select("svg")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", SVG_WIDTH + "px")
            .attr("height", SLIDER_HEIGHT)
            .attr("class", "sliderRect");
        
        // Event: Drag on the minimap
        let drag = d3.drag()
            .on('start drag', function(d, i) { 
                // console.log("Event: Drag => Coordinates: (" + d3.event.x + ", " + d3.event.y + ")"
                //     + "\nSvg #" + i);

                if (d3.event.y > currentMinimapHeight) {
                    // console.log("ERROR: Can't drag out");
                } else {
                    // console.log("scrolling... - calculated: " + Math.ceil((d3.event.y + (currentSvgIndex * SVG_MAX_HEIGHT)) * multiplier));
                    // console.log("currentsvgindex: " + currentSvgIndex 
                    //     + "\nsvg max height: " + SVG_MAX_HEIGHT
                    //     + "\nmultiplier: " + multiplier);
                    scrollContainer.scrollTop = Math.ceil((d3.event.y + (currentSvgIndex * SVG_MAX_HEIGHT)) * multiplier);
                }
            });
        
        // Event: Click on the minimap
        let allSvgs = d3.selectAll(".fileContainer")
            .filter(function(d, i) {return i === index})
            .selectAll(".svgContainer > div > svg")
            .on("mousedown", (d, i, nodes) => {
                if (i === currentSvgIndex) {
                    // console.log("Event: Mousedown: Same Svg #" + i);
                    return;
                }
                // console.log("Event: Mousedown: Different Svg #" + i);

                // Remove any sliders that are in the transition state
                if (currentSliderState === sliderState.TRANSITION_BACK) {
                    d3.select(nodes[currentSvgIndex - 1])
                        .select('.sliderRect').remove();
                }
                else if (currentSliderState === sliderState.TRANSITION_NEXT) {
                    d3.select(nodes[currentSvgIndex + 1])
                        .select('.sliderRect').remove();
                }

                // Find cursor point of click translated into svg coordinates
                let node = nodes[i];
                let pt = node.createSVGPoint();
                pt.x = d3.event.clientX;
                pt.y = d3.event.clientY;        
                var cursorpt =  pt.matrixTransform(node.getScreenCTM().inverse());

                // console.log("Mousedown Coordinates: (" + cursorpt.x + ", " + cursorpt.y + ")");

                // Remove current slider and drag behavior
                currentSvg.select('.sliderRect').remove();
                d3.select(currentSvg).on('mousedown.drag', null);

                // Update variables
                currentSvgIndex = i;
                currentMinimapHeight = minimapMaxHeights[currentSvgIndex];

                slider = d3.select(allSvgs[currentSvgIndex])
                    .append('rect')
                    .attr('class', 'sliderRect')
                    .attr('width', SVG_WIDTH + "px")
                    .attr('height', SLIDER_HEIGHT)
                    .attr('y', cursorpt.y);
                transitionSlider = null;
                currentSvg = d3.select(allSvgs[currentSvgIndex]).call(drag);

                // Update state
                currentSliderState = sliderState.BASE;

                scrollContainer.scrollTop = Math.ceil((cursorpt.y + (currentSvgIndex * SVG_MAX_HEIGHT)) * multiplier);
            })
            .nodes();
        
        let currentSvg =  d3.select(allSvgs[currentSvgIndex])
            .call(drag);
        
        // Event: Scrolling the scroll container
        d3.select(scrollContainer)
            .on('scroll', function(d) {
                // console.log("Event: Scroll: scrollTop = " + this.scrollTop);
                slider.attr('y', Math.floor(this.scrollTop / multiplier) - (currentSvgIndex * SVG_MAX_HEIGHT));

                // Determine slider state
                if (currentSliderState === sliderState.BASE) {
                    if ( (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT - SLIDER_HEIGHT
                        && currentSvgIndex + 1 < maxNumSvgs)
                        || (Math.floor(this.scrollTop / multiplier) < currentSvgIndex * SVG_MAX_HEIGHT
                        && currentSvgIndex - 1 >= 0) ) {
                        // console.log("Entering a transition...");

                        let transitionIndex = currentSvgIndex;
                        let transitionSliderPosY;

                        // Transition next
                        if (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT - SLIDER_HEIGHT) {
                            // console.log("Transition next");
                            transitionIndex += 1;
                            currentSliderState = sliderState.TRANSITION_NEXT;
                        } else {
                            // console.log("Transition back");
                            transitionIndex -= 1;
                            currentSliderState = sliderState.TRANSITION_BACK;
                        }

                        transitionSliderPosY = Math.floor(this.scrollTop / multiplier) - (transitionIndex * SVG_MAX_HEIGHT);

                        // Create new slider for next svg
                        transitionSlider = d3.select(allSvgs[transitionIndex])
                            .append('rect')
                            .attr('class', 'sliderRect')
                            .attr('width', SVG_WIDTH + "px")
                            .attr('height', SLIDER_HEIGHT)
                            .attr('y', transitionSliderPosY);
                    }
                }
                else {
                    // console.log("transitioning...");
                    if (currentSliderState === sliderState.TRANSITION_NEXT) {
                        transitionSlider.attr('y', Math.floor(this.scrollTop / multiplier) - ((currentSvgIndex + 1) * SVG_MAX_HEIGHT));

                        // If transitioning next but return
                        if (Math.floor(this.scrollTop / multiplier) < (currentSvgIndex + 1) * SVG_MAX_HEIGHT - SLIDER_HEIGHT) {
                            // Remove transition next slider
                            d3.select(allSvgs[currentSvgIndex + 1])
                                .select('.sliderRect').remove();
                            transitionSlider = null;
    
                            // Update state
                            currentSliderState = sliderState.BASE;
                        }
                    } 
                    else if (currentSliderState === sliderState.TRANSITION_BACK) {
                        transitionSlider.attr('y', Math.floor(this.scrollTop / multiplier) - ((currentSvgIndex - 1) * SVG_MAX_HEIGHT));

                        // If transitioning back but return
                        if (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex * SVG_MAX_HEIGHT)) {
                            // Remove transition previous slider
                            d3.select(allSvgs[currentSvgIndex - 1])
                                .select('.sliderRect').remove();
                            transitionSlider = null;
    
                            // Update state
                            currentSliderState = sliderState.BASE;
                        }
                    }

                    // If successfully transitioned
                    if (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT
                        || Math.floor(this.scrollTop / multiplier) < (currentSvgIndex * SVG_MAX_HEIGHT) - SLIDER_HEIGHT) {
                        // console.log("Entered transitioned svg");

                        // Remove current slider and drag behavior
                        currentSvg.select('.sliderRect').remove();
                        d3.select(currentSvg).on('mousedown.drag', null);

                        if (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT) {
                            currentSvgIndex += 1;
                        } else {
                            currentSvgIndex -= 1;
                        }

                        currentMinimapHeight = minimapMaxHeights[currentSvgIndex];

                        // Update variables
                        slider = d3.select(allSvgs[currentSvgIndex]).select('.sliderRect');
                        transitionSlider = null;
                        currentSvg = d3.select(allSvgs[currentSvgIndex]).call(drag);

                        // Update state
                        currentSliderState = sliderState.BASE;
                    }
                }

            });
    }

    /** =======================================================================
     * 
     * METHODS - Code Coverage
     * 
     ======================================================================= */

    /**
     * Display fault localization suspiciousness scores for each file. Go through each 
     * score in the list, filter for correct file container, get all svg elements for
     * that file, and append a rect for each line that is coverable and has a score.
     * @param {Object} suspiciousnessScores The suspiciousness object
     */
    displayCoverageOnMinimap(suspiciousnessScores) {
        const allFiles = this.props.allFiles.toJS()

        for (let score of suspiciousnessScores) {
            // Find index of file container
            let fileContainerIndex = allFiles.findIndex((val) => {
                return (score.source === val.name);
            });

            if (fileContainerIndex === -1) {
                console.error("Unable to find file container index");
                continue;
            }

            // Get all svg elements associated with file
            let svgsD3 = d3.selectAll(".fileContainer")
                .filter(function(d, i) {return i === fileContainerIndex})
                .selectAll(".svgContainer > div > svg");

            // console.log("source: " + score.source
            //     + "\nFile container index: " + fileContainerIndex
            //     + "\nNumber of svg nodes: " + svgsD3.nodes().length);

            // Go through each line object
            for (let l = 0; l < score.lines.length; l++) {
                let lineObject = score.lines[l];

                // There can be multiple svgs in a file, find right svg for the current linenumber
                let svgNumber = Math.floor((lineObject.linenumber - 1) / this.LINES_PER_SVG);

                // Create a rect with the appropriate color
                svgsD3.filter(function(d, f) {return f === svgNumber})
                    .append("rect")
                    .attr("width", this.SVG_WIDTH + "px")
                    .attr("height", this.PIXELS_PER_LINE)
                    .attr("x", 0)
                    .attr("y", this.PIXELS_PER_LINE * ((lineObject.linenumber - 1) % this.LINES_PER_SVG ))
                    .style("fill", lineObject.hsl)
                    .classed("coverable", true);
            }
        }
    }

    /**
     * For the currently selected file determined by the selection index, 
     * highlight lines of selected file based on suspiciousness data.
     */
    displayCoverageOnDisplay(input) {
        const { selectionIndex } = this.props;
        const allFiles = this.props.allFiles.toJS();
        console.log("allFiles:");
        console.log(allFiles);
        console.log("selectionIndex: " + selectionIndex);
        const suspiciousness = this.props.suspiciousness;

        // Return if no file container was selected
        if (selectionIndex === -1) {
            console.log("No file containers were selected");
            return;
        }

        // console.log("Selection Index: " + this.state.selectionIndex
        //     + "\nFiles: " + JSON.stringify(this.state.allFiles));

        // Get file name for selected file container and suspiciousness scores
        let fileName = allFiles[selectionIndex].name;
        let suspiciousnessScores;
        if (input === undefined) {
            suspiciousnessScores = suspiciousness;
        } else {
            suspiciousnessScores = input;
        }
        
        console.log("sus score");
        console.log(suspiciousnessScores.toJS());

        // Filter appropriate score object using filename
        let scoresArr = suspiciousnessScores.toJS().filter((s) => {
            return s.source === fileName;
        });
        if (scoresArr.length === 0) {
            console.error("Unable to find source name");
            return;
        }

        let score = scoresArr[0];
        score.lines = score.lines.sort((a, b) => a.linenumber - b.linenumber)
        // Obtain list of tr nodes 
        let rows = d3.select("#scrollContainer")
            .select("table")
            .select("tbody")
            .selectAll("tr")
            .nodes();
        
        // For each line number in score.lines, change background color of appropriate row
        for (let i = 0; i < score.lines.length; i++) {
            let lineObject = score.lines[i];
            rows[lineObject.linenumber - 1].style.backgroundColor = lineObject.hsl;
            rows[lineObject.linenumber - 1].classList.add("coverable");
        }

        d3.select("#scrollContainer table tbody")
            .selectAll("tr.coverable")
            .on('click', (d, i) => {
                this.onCoverableLineClicked(i);
            });
    }


    /**
     * Checks if any tests have been activated on the directory view.
     * If none are, then disables the view scores button. Enabled otherwise
     */
    setViewScoresDisabled() {
        const { setViewScoresDisabled, selectionIndex } = this.props;

        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));

        // Update state to enable or disable viewScores button
        let enabled = (activatedTestCases.length > 0) && selectionIndex !== -1;
        setViewScoresDisabled(!enabled)
    }

    /**
     * Generate the title andcontent for the view dialog (Fault Localization Analysis)
     */
    generateViewDialog() {
        const { isDialogOpened, 
                selectionIndex } = this.props;
        const suspiciousness = this.props.suspiciousness.toJS()
        const allFiles = this.props.allFiles.toJS()

        // Return if no file containers were selected
        if (!isDialogOpened || selectionIndex === -1) {
            return;
        }

        // Remove any previous dialog content
        d3.select("#dialogScoresContainer").selectAll("*").remove();

        // Grab contents, file name for selected file container, and 
        // suspiciousness scores from state
        let obj = allFiles[selectionIndex];
        let content = obj.contents;
        let fileName = allFiles[selectionIndex].name;
        let suspiciousnessScores = suspiciousness;

        // Filter score object using filename
        let scoresArr = suspiciousnessScores.filter((s) => {
            return s.source === fileName;
        });

        // Start with the dialog title
        d3.select("#viewDialogTitle")
            .text(`Fault Localization of ${obj.name}`);

        // The hdeaders for table
        let tbody = d3.select("#dialogScoresContainer")
            .append("table")
            .append("tbody");
        let headerTr = tbody.append("tr")
            .classed("dialogTrHeader", true);
        headerTr.append("th")
            .text("Line");
        headerTr.append("th")
            .text("Hue");
        headerTr.append("th")
            .text("Score");
        headerTr.append("th")
            .text("Statement");

        // Then content for each row
        let trs = tbody.selectAll("tr:not(.dialogTrHeader)")
            .data(content)
            .enter()
            .append("tr");
        trs.append("td")
            .text(function(d, i) {
                return i + 1;
            });

        if (scoresArr.length === 0) {
            trs.append("td");
            trs.append("td");
        } else {
            let score = scoresArr[0];

            let scoreFound = function(index) {
                let scoreArr = score.lines.filter(li => li.linenumber === (index + 1));
                if (scoreArr.length !== 1) {
                    return "";
                }
                let s = scoreArr[0];
                return s.suspiciousness;
            };
            let hueFound = function(index) {
                let scoreArr = score.lines.filter(li => li.linenumber === (index + 1));
                if (scoreArr.length !== 1) {
                    return "none";
                }
                let s = scoreArr[0];
                return s.hsl;
            }

            trs.append("td")
                .append("div")
                .style("background-color", function(d, i) {
                    return hueFound(i);
                });
            trs.append("td")
                .text(function(d, i) {
                    return scoreFound(i);
                });
        }

        trs.append("td")
            .text(function(d, i) {
                return d;
            });
    }

    /**
     * Generate the title and content for the susp dialog (Line Details)
     */
    generateSuspDialog() {
        const { isSuspDialogOpened,
                selectionIndex,
                coverableIndex } = this.props;
        const suspiciousness = this.props.suspiciousness.toJS();
        const allFiles = this.props.allFiles.toJS();

        // Return if no file containers were selected
        if (!isSuspDialogOpened || selectionIndex === -1 
            || coverableIndex === -1) {
            return;
        }

        // Grab contents, file name for selected file container, and suspiciousness scores
        // from state
        let obj = allFiles[selectionIndex];
        let content = obj.contents;
        let fileName = allFiles[selectionIndex].name;
        let suspiciousnessScores = suspiciousness;

        // Filter appropriate score object using filename
        let scoresArr = suspiciousnessScores.filter((s) => {
            return s.source === fileName;
        });
        if (scoresArr.length === 0) {
            return <p>An error occurred</p>;
        }
        let score = scoresArr[0];
        let lineObj = score.lines[coverableIndex];

        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));

        // Prepare data for the details
        let detailsArr = [
            {
                title: "File:",
                value: fileName
            },
            {
                title: "Activated Test Cases:",
                value: activatedTestCases.length
            },
            {
                title: "%p:",
                value: lineObj.pRatio
            },
            {
                title: "%f:",
                value: lineObj.fRatio
            }
        ];

        let containers = d3.select("#dialogSuspContainer")
            .selectAll("div")
            .data(detailsArr)
            .enter()
            .append("div");
        containers.append("p")
            .text(function(d, i) {
                return d.title;
            });
        containers.append("p")
            .text(function(d, i) {
                return d.value;
            });

        // Table (1 line/statement)
        let tbody = d3.select("#dialogSuspContainer")
            .append("table")
            .append("tbody");
        let trHeader = tbody.append("tr")
            .classed("dialogTrHeader", true);
        trHeader.append("th")
            .text("Line");
        trHeader.append("th")
            .text("Hue");
        trHeader.append("th")
            .text("Score");
        trHeader.append("th")
            .text("Statement");

        // The content for the selected row
        let trLine = tbody.append("tr");
        trLine.append("td")
            .text(lineObj.linenumber);
        trLine.append("td")
            .append("div")
            .style("background-color", lineObj.hsl);
        trLine.append("td")
            .text(lineObj.suspiciousness);
        trLine.append("td")
            .text(content[lineObj.linenumber - 1]);
    }

    /** =======================================================================
     * 
     * METHODS - Clearing/Resetting
     * 
     ======================================================================= */
    resetComponent() {
        console.log("reseting...");
        const { reset } = this.props;

        // Remove nodes
        d3.select("#directoryContainer").selectAll("*").remove();
        d3.select("#directoryContainer")
            .style("min-width", null)
            .style("height", null)
            .style("padding", null);
        d3.select("#horizontalScrollView").selectAll("*").remove();
        d3.select("#horizontalScrollView")
            .style("width", null)
            .style("overflow-x", null);
        d3.select("#scrollContainer").selectAll("*").remove();
        d3.select("#scrollContainer")
            .style("padding", null)
            .style("overflow-y", null);

        // Reset state
        // NOTE: commits[] is not reset 
        reset();
    }

    /**
     * Removes coverage the appears on each minimap of each file container
     * and on the display
     */
    removeExistingCoverage() {
        const { selectionIndex } = this.props;

        // Remove coverage nodes on minimap
        let svgsD3 = d3.selectAll(".fileContainer")
            .selectAll(".svgContainer > div > svg");
        svgsD3.selectAll('rect.coverable')
            .remove();
        
        // If the display view is shown, remove coverage nodes 
        if (selectionIndex !== -1) {
            let trD3 = d3.select("#scrollContainer table tbody")
                .selectAll("tr.coverable")
                .style("background-color", null)
                .classed("coverable", false);
            
            trD3.selectAll("td:nth-of-type(2)")
                .selectAll("span")
                .remove();
        }
    }

    /** =======================================================================
     * 
     * METHODS - Event Handling
     * 
     ======================================================================= */

    /**
     * Event callback when a commit id is selected. Reset the state of this
     * component and remove generated DOM nodes.
     * @param {Object} event The event that triggered the callback
     */
    onSelectCommitChanged(commitId) {
        const { selectedCommit, setSelectedCommit, setButtonGroupDisabled, setRequestingFromWorker } = this.props;
        
        console.log("selectedCommit: " + selectedCommit);
        console.log("commitId: " + commitId);
        // Reset only if newly selected sha is different from previous sha
        if (selectedCommit !== commitId) {
            this.resetComponent();
        }

        // Update state for the selected commit/sha
        setSelectedCommit(commitId);
        setRequestingFromWorker(true)

        // Enable or disable the button group
        setButtonGroupDisabled(false);
        
        // Request urls to the source files for current commit
        this.requestSourceLinks(commitId);
    }

    /**
     * Event callback when the checkbox for a source name is clicked.
     * Looks through the state's testcases to find the affiliated testcaseIds for the
     * clicked source, and checks the input checkboxes whose keys match those testcaseIds.
     * Then loads coverage data for multiple test cases.
     * @param   {string}    sourceName  The name of the source file
     * @param   {boolean}   checked     Whether the input was checked or unchecked
     */
    onSourceNameChecked(sourceName, checked) {
        const testcases = this.props.testcases.toJS();

        // Filter state's testcases by source name that was checked
        let source = testcases.filter((t) => {
            let k = Object.keys(t)[0];
            return k === sourceName;
        })[0];
        
        // Gather testcase ids in an array
        let currentTestcases = source[sourceName].map((tc) => {
            return tc.testcaseId;
        });

        // Check only checkboxes with testcase keys contained in testcases
        d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return currentTestcases.includes(d3.select(this).attr("key"));
            })
            .property("checked", checked);
    }

    /**
     * Update the state with the selected file container, the number of svgs for
     * the current selected file, and the minimapMaxHeights for current file.
     * Change background color of selected file container. Generate the display, 
     * the slider, the coverage on display container if available, and 
     * enable/disable view scores button.
     * @param {number} index The index of the file container that was clicked
     */
    updateSelection(index) {
        console.log("selection: " + index);
        const { 
            selectionIndex, 
            setSelectionIndex,
            setNumberOfSvgs,
            setMinimapMaxHeights } = this.props;
        const allFiles = this.props.allFiles.toJS()

        if (selectionIndex === index) {
            return;
        }

        // Calculate variables
        const linesOfCode = allFiles[index].contents.length;
        let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);

        let minimapMaxHeights = [];
        for (let i = 0; i < numberOfSvgs; i++) {
            let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
                        (totalHeightForFile % this.SVG_MAX_HEIGHT);
            minimapMaxHeights.push(svgHeight);
        }

        // Update state
        setSelectionIndex(index)
        setNumberOfSvgs(numberOfSvgs)
        setMinimapMaxHeights(minimapMaxHeights)

        // Change background color of file container
        let fileContainers = d3.selectAll(".fileContainer")
            .classed("fileContainerSelected", false);
        fileContainers.filter(function(d, i) {
                return i === index;
            }).classed("fileContainerSelected", true);

        // Generate display
        this.generateDisplay(index);

        // Generate slider
        this.generateSlider(index);

        // Display coverage on display container if it is available
        this.displayCoverageOnDisplay();

        // Enable or disable viewScores button
        this.setViewScoresDisabled();
    }

    /**
     * Event callback when clear or all button is clicked. Either all source name
     * inputs and testcases are checked, or all are cleared/unchecked. 
     * Thereafter, request coverage again.
     * @param {boolean} checkAll If all testcases should be checked or not
     */
    onClearOrAllButtonClicked(checkAll) {
        d3.selectAll(".sourceName")
            .select("input")
            .property("checked", checkAll);

        d3.selectAll(".testcase")
            .select("input")
            .property("checked", checkAll);
    }

    /**
     * Event callback when passed or failed button is clicked. Either all testcases
     * that passed are checked, or all testcases that failed are checked. 
     * Thereafter, request coverage again.
     * @param {boolean} passFailStatus If all passed testcases or all failed should be checked
     */
    onPassedOrFailedButtonClicked(passFailStatus) {
        const testcases = this.props.testcases.toJS()
        let status = (passFailStatus) ? 1 : 0;

        // Get test case ids for tests that passed from 
        let testcaseIds = [];
        for (let t of testcases) {
            let k = Object.keys(t)[0];
            let v = t[k];

            let ids = v.filter((o) => {
                return o.passed === status;
            }).map((o) => {
                return o.testcaseId;
            });
            testcaseIds = testcaseIds.concat(ids);
        }
        // console.log("testcaseIds: " + testcaseIds);

        // (Included checkboxes) For checkboxes whose id is included in testcaseIds, check 
        d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return testcaseIds.includes(d3.select(this).attr("key"));
            })
            .property("checked", true);;
        
        // (Exlucded checkboxes) For checkboxes whose id is not included in testcaseIds, uncheck
        d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return !testcaseIds.includes(d3.select(this).attr("key"));
            })
            .property("checked", false);;
    }

    /**
     * Event callback for when view scores button is clicked.
     * Update state to set isDialogOpened to true.
     */
    onViewScoresClicked() {
        const { isDialogOpened, setDialogOpened } = this.props;

        if (!isDialogOpened) {
            setDialogOpened(true)
        }
    }

    /**
     * Event callback for when a coverable line on the display view
     * is clicked. Update state to set isSuspDialogOpened to true and
     * to set coverableIndex.
     * @param {number} coverableIndex The index of the clicked coverable tr node
     */
    onCoverableLineClicked(coverableIndex) {
        const { isSuspDialogOpened, setSuspDialogOpened, setCoverableIndex } = this.props;

        if (!isSuspDialogOpened) {
            setSuspDialogOpened(true)
            setCoverableIndex(coverableIndex)
        }
    }

    /**
     * Event callback for when the dialog needs to be closed. Updates
     * the state to set either isDialogOpened or isSuspDialogOpened to
     * false.
     * @param {string} dlg The type of dialog (view or susp)
     */
    onDialogClose(dlg) {
        const { setDialogOpened, setSuspDialogOpened } = this.props;
        console.log("dialog closing...");
        switch(dlg) {
            case "view": {
                // console.log("Dialog for view closed");
                setDialogOpened(false)
                break;
            }
            case "susp": {
                // console.log("Dialog for susp closed");
                setSuspDialogOpened(false)
                break;
            }
            default: {
                break;
            }
        }
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
    render() {
        const { isRequestingCoverage,
                isRequestingFromWorker,
                isViewScoresDisabled,
                isButtonGroupDisabled,
                isDialogOpened,
                isSuspDialogOpened,
                selectedCommit,
                commits,
                retrievedBatches,
                totalBatches } = this.props

        return (
            <div id="tarantula">
                <CommitHeader 
                    onClearOrAllButtonClicked={this.onClearOrAllButtonClicked}
                    onPassedOrFailedButtonClicked={this.onPassedOrFailedButtonClicked}
                    requestCoverage={this.requestCoverage}
                    onViewScoresClicked={this.onViewScoresClicked}
                    onSelectCommitChanged={this.onSelectCommitChanged}
                    isRequestingCoverage={isRequestingCoverage}
                    isViewScoresDisabled={isViewScoresDisabled}
                    isButtonGroupDisabled={isButtonGroupDisabled}
                    selectedCommit={selectedCommit}
                    commits={commits}
                    submitMarginLeft={this.SUBMIT_MARGIN}
                    commitWrapper={this.commitWrapper}
                />
                <div id="tarantulaWrapper">
                    <TestDirectory />
                    <CodeContainer 
                        isRequestingCoverage={isRequestingCoverage}
                        loadingProgress={retrievedBatches / totalBatches}
                    />
                    {
                        isRequestingFromWorker &&
                        <div id="progressWrapper">
                            <CircularProgress color="secondary" />
                        </div>
                    }
                </div>

                <Dialog 
                    onEntered={this.generateViewDialog}
                    onClose={(e) => this.onDialogClose("view", e)} 
                    aria-labelledby="viewDialogTitle" 
                    open={isDialogOpened}
                    fullWidth={true}
                    maxWidth="md">
                    <DialogTitle id="viewDialogTitle"></DialogTitle>
                    <DialogContent>
                        <div id="dialogScoresContainer"></div>
                    </DialogContent>
                </Dialog>

                <Dialog 
                    onEntered={this.generateSuspDialog}
                    onClose={(e) => this.onDialogClose("susp", e)}
                    aria-labelledby="suspDialogTitle" 
                    open={isSuspDialogOpened}
                    fullWidth={true}
                    maxWidth="sm">
                    <DialogTitle id="suspDialogTitle">Line Details</DialogTitle>
                    <div id="dialogSuspHelp">
                        <div className="tooltip">
                            <HelpOutlineIcon />
                            <span className="tooltiptext">
                                <p><b>%p</b>: A ratio representing the number of passed test cases that executed the statement one or more times over the number of activated test cases that passed.</p>
                                <br/>
                                <p><b>%f</b>: A ratio representing the number of failed test cases that executed the statement one or more times over the number of activated test cases that failed.</p>
                            </span>
                        </div>
                    </div>
                    <DialogContent>
                        <div id="dialogSuspContainer"></div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        // Commits
        selectedCommit: state.getIn(['project', 'tarantula', 'selectedCommit']),

        // All files
        allFiles: state.getIn(['project', 'tarantula', 'allFiles']),
        
        // Selected File Container
        selectionIndex: state.getIn(['project', 'tarantula', 'selectionIndex']),
        numberOfSvgs: state.getIn(['project', 'tarantula', 'numberOfSvgs']),
        minimapMaxHeights: state.getIn(['project', 'tarantula', 'minimapMaxHeights']),
        scrollContainerHeight: state.getIn(['project', 'tarantula', 'scrollContainerHeight']),
        
        // Active test cases
        testcases: state.getIn(['project', 'tarantula', 'testcases']),
        totalBatches: state.getIn(['project', 'tarantula', 'totalBatches']),
        retrievedBatches: state.getIn(['project', 'tarantula', 'retrievedBatches']),
        
        // Fault localization
        suspiciousness: state.getIn(['project', 'tarantula', 'suspiciousness']),
        
        // Buttons, Progresses, and Dialogs
        isButtonGroupDisabled: state.getIn(['project', 'tarantula', 'isButtonGroupDisabled']),
        isViewScoresDisabled: state.getIn(['project', 'tarantula', 'isViewScoresDisabled']),
        isRequestingFromWorker: state.getIn(['project', 'tarantula', 'isRequestingFromWorker']),
        isDialogOpened: state.getIn(['project', 'tarantula', 'isDialogOpened']),
        isSuspDialogOpened: state.getIn(['project', 'tarantula', 'isSuspDialogOpened']),
        coverableIndex: state.getIn(['project', 'tarantula', 'coverableIndex']),
        isRequestingCoverage: state.getIn(['project', 'tarantula', 'isRequestingCoverage']),
        allFormatedTestsMap: state.getIn(['project', 'tarantula', 'allFormatedTestsMap']),
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        reset() {
            dispatch(actionCreator.resetComponent())
        },
        setSelectedCommit(commitId) {
            dispatch(actionCreator.updateSelectedCommit(commitId))
        },
        setRequestingFromWorker(isRequesting) {
            dispatch(actionCreator.updateRequestingFromWorker(isRequesting))
        },
        setButtonGroupDisabled(disabled) {
            dispatch(actionCreator.updateButtonGroupDisabled(disabled))
        },
        setAllFiles(files) {
            dispatch(actionCreator.updateAllFiles(files))
        },
        setSelectionIndex(index) {
            dispatch(actionCreator.updateSelectionIndex(index))
        },
        setNumberOfSvgs(num) {
            dispatch(actionCreator.updateNumberOfSvgs(num))
        },
        setMinimapMaxHeights(heights) {
            dispatch(actionCreator.updateMinimapMaxHeights(heights))
        },
        setScrollContainerHeight(height) {
            dispatch(actionCreator.updateScrollContainerHeight(height))
        },
        setTestcases(testcases) {
            dispatch(actionCreator.updateTestCases(testcases))
        },
        setTotalBatches(num) {
            dispatch(actionCreator.updateTotalBatches(num))
        },
        setRetrievedBatches(num) {
            dispatch(actionCreator.updateRetrievedBatches(num))
        },
        setSuspDialogOpened(isOpened) {
            dispatch(actionCreator.updateSuspDialogOpened(isOpened))
        },
        setSuspicousness(sus) {
            dispatch(actionCreator.updateSuspiciousness(sus))
        },
        setCoverableIndex(index) {
            dispatch(actionCreator.updateCoverableIndex(index))
        },
        setRequestingCoverage(isRequesting) {
            dispatch(actionCreator.updateRequestingCoverage(isRequesting))
        },
        setViewScoresDisabled(disabled) {
            dispatch(actionCreator.updateViewScoresDisabled(disabled))
        },
        setDialogOpened(opened) {
            dispatch(actionCreator.updateDialogOpened(opened))
        },
        setAllFormatedTestMap(map) {
            dispatch(actionCreator.updateAllFormatedTestsMap(map))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Tarantula);
