import React, { Component, createRef } from 'react';

import * as d3 from 'd3';
import {extractFileName, extractFileNameByDot} from '../../util/file-name-parser';
import {shortenCommitId, shortenMessage, convertTimestampToDate} from './TaranMenuItem';
import Suspiciousness from '../../models/Suspiciousness';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import PageviewIcon from '@material-ui/icons/Pageview';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import { spidersenseWorkerUrls } from '../../vars/vars';
import "./Tarantula.scss";
import "./MaterialCheckbox.css";
import "./Tooltip.css";

class Tarantula extends Component {
    commitWrapper = createRef();

    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            commits: props.commits,
            selectedCommit: '',
            allFiles: [],
            selectionIndex: -1,
            numberOfSvgs: 0,
            minimapMaxHeights: [],
            scrollContainerHeight: 0,
            testcases: [],
            suspiciousness: [],
            isViewScoresDisabled: true,

            isDialogOpened: false,
            isSuspDialogOpened: false,

            coverableIndex: -1
        };

        // Constants
        this.FONT_SIZE = 1;            // Font size for svg text
        this.Y_TEXT_PADDING = 1;       // Top padding for each tspan
        this.SVG_WIDTH = 48;           // Width of each minimap
        this.SVG_MAX_HEIGHT = 300;     // Height of each minimap
        this.PIXELS_PER_LINE = this.FONT_SIZE + this.Y_TEXT_PADDING;    // # of pixels making up 1 line
        this.LINES_PER_SVG = Math.floor(this.SVG_MAX_HEIGHT / this.PIXELS_PER_LINE);    // # of lines per svg 
        this.TABLE_BODY_WIDTH = 700;           // Width of display scroll container table
        this.SCROLL_FONT_SIZE = 12;            // Font size of td element 
        this.SCROLL_CONTAINER_PADDING = 12;    // Padding of display scroll container

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
        this.displayCoverageOnMinimap = this.displayCoverageOnMinimap.bind(this);
        this.displayCoverageOnDisplay = this.displayCoverageOnDisplay.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.onViewScoresClicked = this.onViewScoresClicked.bind(this);
        this.onDialogClose = this.onDialogClose.bind(this);

        this.generateViewDialog = this.generateViewDialog.bind(this);
        this.generateSuspDialog = this.generateSuspDialog.bind(this);
    } 

    componentDidMount() {
    }

    componentDidUpdate() {
        console.log("componentDidUpdate()");
    }

    /** =======================================================================
     * 
     * METHODS - Requests and Response
     * 
     ======================================================================= */

    /**
     * Use the selected commit id as a parameter for the GraphQL query to 
     * get back the urls of the source files. Pass the source links to
     * download contents from Github.
     * 
     * The urls have been built on the server side using the ingredients:
     * - Github owner name
     * - Repository name
     * - commit id
     * - The path to the file
     * - The file name
     * @param   {string}    sha     The commit id
     */
    requestSourceLinks(sha) {
        console.log("requestSourceLinks()");
        let url = `${spidersenseWorkerUrls.getSourceInfo}/${sha}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {            
            console.log("Callback:\n" + JSON.stringify(data.sourceLinks));

            this.downloadContentsFromGithub(data.sourceLinks);
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Use the built urls to retrieve the source files from Github.
     * After retrieving them, generate the file containers, then generate
     * the minimaps for each file. Finally, request the test cases.
     * @param   {array}     sourceLinks    The urls to get the source files
     */
    downloadContentsFromGithub(sourceLinks) {
        console.log("downloadContentsFromGithub()");

        // Get names of source links and links in different arrays
        let names = sourceLinks.map((u) => {
            return extractFileName(u);
        });
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
                console.log(`File text: ${fileTexts[i]}`);

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
                this.generateMinimap(names[i], textArray, i);
            }

            // Update state so that allFiles contains the text of each file retrieved
            this.setState((state) => ({
                allFiles: allFiles
            }));

            // Make request to get test coverage
            this.requestTestcases();
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Using the selectedCommit from the state, request all testcases of 
     * the current project from the SpiderSense worker. On response, 
     * generate the directory view.
     */
    requestTestcases() {
        console.log("requestTestcases()");

        let selectedCommitId = this.state.selectedCommit;
        let url = `${spidersenseWorkerUrls.getAllTestcases}/${selectedCommitId}`;

        fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.json();
        }).then((data) => {            
            console.log("Callback:\n" + JSON.stringify(data));

            this.generateDirectoryView(data)
        }).catch((error) => {
            console.error(error);
        });
    }

    /**
     * Request test coverage data for each testcase id that was checked in
     * ths directory view. Remove existing testcases before getting the
     * coverage data.
     */
    requestCoverage() {
        console.log("requestCoverage()");

        this.removeExistingCoverage();

        this.setViewScoresDisabled();

        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));

        // Return if there are no activated test cases
        if (activatedTestCases.length === 0) {
            return;
        }
        
        // Map test ids to server url
        let urls = activatedTestCases.map((t) => {
            return `${spidersenseWorkerUrls.testcaseCoverage}/${t.toString()}`;
        });

        console.log("Activated tests: " + activatedTestCases);
        console.log("Urls: " + urls);

        // Make the request for all activated test cases (liveness)
        Promise.all(urls.map((req) => {
            return fetch(req).then((response) => {
                return response.json();
            })
            .then((data) => {
                return data;
            });
        })).then((response) => {
            console.log('Callback:\n' + JSON.stringify(response));

            // Get suspiciousness data from Suspiciousness module
            let susp = new Suspiciousness(response);
            let suspiciousnessScores = susp.suspiciousness();
            console.log("Suspiciousness:\n" + JSON.stringify(suspiciousnessScores));

            // Update state to retain scores
            this.setState((state) => ({
                suspiciousness: suspiciousnessScores
            }));

            // Display coverage on minimap
            this.displayCoverageOnMinimap(suspiciousnessScores);

            // Display coverage on display view
            this.displayCoverageOnDisplay(suspiciousnessScores);

        }).catch((error) => {
            console.error(error);
        });
    }

    /** =======================================================================
     * 
     * METHODS - Directory View
     * 
     ======================================================================= */

    /**
     * Generates the directory given the source names and testcases for each 
     * source. Each source name and test case should have an input (checkbox)
     * and label. Update state for testcases and add click listeners to checkboxes.
     * @param   {Object}    response    The response received
     */
    generateDirectoryView(response) {
        console.log("generateDirectoryView()");

        // Reformat so that each property of object is an object in an array
        let testcasesData = [];
        for (let k of Object.keys(response)) {
            let o = {};
            o[k] = response[k];
            testcasesData.push(o);
        }
        console.log("testcasesData: " + JSON.stringify(testcasesData));
        
        // Bind data to divs under directory container
        let directorySources = d3.select("#directoryContainer")
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

        let testcasesLabels = testcasesContainer.append("label")
            .classed("pure-material-checkbox", true);
        testcasesLabels.append("input")
            .attr("type", "checkbox")
            .attr("key", function(t) {return t.testcaseId});
        testcasesLabels.append("span")
            .text(function(t) {return t.signature});

        // Update state for testcases
        this.setState((state) => ({
            testcases: testcasesData
        }));

        // Add click listeners for checkboxes
        d3.selectAll(".sourceName input")
            .on('click', () => {
                this.onSourceNameChecked(d3.event.target.getAttribute("key"), d3.event.target.checked);
            });
        d3.selectAll(".testcase input")
            .on('click', () => {
                this.onTestCaseChecked(d3.event.target.getAttribute("key"), d3.event.target.checked);
            });
    }
    
    /** =======================================================================
     * 
     * METHODS - File Containers and Minimap
     * 
     ======================================================================= */

    /**
     * Creates a container with the class 'fileContainer' for each file that was 
     * requested. The file containers will hold containers for the title of the 
     * file and each svg element of the file. Add click listener to file containers
     * to update the selection.
     * @param   {number}    numFiles    The number of files
     */
    generateFileContainers(numFiles) {
        console.log("generateFileContainers() - numFiles: " + numFiles);

        let horizontalScollViewD3 = d3.select("#horizontalScrollView")
            .style("width", this.TABLE_BODY_WIDTH + "px");
        
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
        console.log("generateMinimap() - index #" + fileIndex);

        // Calculate variables
        const linesOfCode = txtLineByLine.length;
        let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);
        console.log("\tLOC: " + linesOfCode 
            + "\n\tAvailable svg height:" + this.SVG_MAX_HEIGHT 
            + "\n\tPixels per line: " + this.PIXELS_PER_LINE
            + "\n\tLines per svg: " + this.LINES_PER_SVG
            + "\n\tTotal height for file: " + totalHeightForFile 
            + "\n\tNumber of svgs: " + numberOfSvgs);

        // Get handle on file container at index
        let fileContainer = d3.selectAll('.fileContainer')
            .filter(function(d, i) {return i === fileIndex})

        // Set title of file container to the extracted name
        // let extractedTitle = this.parser.extractFileName(this.state.allFiles[fileIndex].name);
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
                .attr("width", this.SVG_WIDTH)
                .attr("height", svgHeight);
            let textI = svgI.append("text")
                .attr("x", 0)
                .attr("y", 0)
                .style('font-size', this.FONT_SIZE.toString() + "px");;

            // Find the number of lines for the current svg
            let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? this.LINES_PER_SVG :
                                (linesOfCode % this.LINES_PER_SVG);

            console.log("svg #" + i + "\nsvg height: " + svgHeight 
                + "\nMax lines current svg: " + maxLinesInCurrentSvg + "\n\n");

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
        console.log("generateDisplay() - index #" + index);

        // Grab contents from state
        let obj = this.state.allFiles[index];
        let content = obj.contents;

        // Clear everything in scroll view
        d3.select("#scrollContainer").selectAll("*").remove();

        let table = d3.select("#scrollContainer")
            .append("table")
            .attr('width', this.TABLE_BODY_WIDTH - (this.SCROLL_CONTAINER_PADDING * 2));
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
            .style('font-size', this.SCROLL_FONT_SIZE.toString() + "px");
        
        // Add padding to view
        d3.select("#scrollContainer")
            .style("padding", this.SCROLL_CONTAINER_PADDING.toString() + "px");

        // Update state scroll container height
        let scrollContainer = d3.select('#scrollContainer').node();
        let scrollHeight =  scrollContainer.scrollHeight;
        this.setState((state) => ({
            scrollContainerHeight: scrollHeight
        }));
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
        console.log("Generating slider at index " + index);

        // Remove all existing sliders and drag behaviors first
        d3.selectAll(".sliderRect").remove();
        // d3.selectAll(currentSvg).on('mousedown.drag', null);

        // d3.selectAll(".fileContainer")
        //     .filter(function(d, i) { return i === index})
        //     .selectAll(".svgContainer")
        //     .selectAll("div")
        //     .selectAll("svg")
        //     .on('mousedown.drag', null);

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

        let maxNumSvgs= this.state.numberOfSvgs;
        let minimapMaxHeights = this.state.minimapMaxHeights;
        let currentMinimapHeight = minimapMaxHeights[currentSvgIndex];
        let scrollContainerHeight = this.state.scrollContainerHeight - SCROLL_HEIGHT;

        let contents = this.state.allFiles[index].contents;
        let multiplier = scrollContainerHeight / (contents.length * this.PIXELS_PER_LINE);

        // Use multiplier to calculate slider's height
        const SLIDER_HEIGHT = Math.floor((SCROLL_HEIGHT - (this.SCROLL_CONTAINER_PADDING * 2)) / multiplier);

        console.log("Max number of svgs: " + maxNumSvgs 
            + "\ncurrentMinimapHeight: " + currentMinimapHeight
            + "\nscrollContainer height: " + scrollContainerHeight
            + "\nmultiplier: " + multiplier);

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
            .attr("width", SVG_WIDTH)
            .attr("height", SLIDER_HEIGHT)
            .attr("class", "sliderRect");
        
        // Event: Drag on the minimap
        let drag = d3.drag()
            .on('start drag', function(d, i) { 
                console.log("Event: Drag => Coordinates: (" + d3.event.x + ", " + d3.event.y + ")"
                    + "\nSvg #" + i);

                if (d3.event.y > currentMinimapHeight) {
                    console.log("ERROR: Can't drag out");
                } else {
                    console.log("scrolling... - calculated: " + Math.ceil((d3.event.y + (currentSvgIndex * SVG_MAX_HEIGHT)) * multiplier));
                    console.log("currentsvgindex: " + currentSvgIndex 
                        + "\nsvg max height: " + SVG_MAX_HEIGHT
                        + "\nmultiplier: " + multiplier);
                    scrollContainer.scrollTop = Math.ceil((d3.event.y + (currentSvgIndex * SVG_MAX_HEIGHT)) * multiplier);
                }
            });
        
        // Event: Click on the minimap
        let allSvgs = d3.selectAll(".fileContainer")
            .filter(function(d, i) {return i === index})
            .selectAll(".svgContainer > div > svg")
            .on("mousedown", (d, i, nodes) => {
                if (i === currentSvgIndex) {
                    console.log("Event: Mousedown: Same Svg #" + i);
                    return;
                }
                console.log("Event: Mousedown: Different Svg #" + i);

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

                console.log("Mousedown Coordinates: (" + cursorpt.x + ", " + cursorpt.y + ")");

                // Remove current slider and drag behavior
                currentSvg.select('.sliderRect').remove();
                d3.select(currentSvg).on('mousedown.drag', null);

                // Update variables
                currentSvgIndex = i;
                currentMinimapHeight = minimapMaxHeights[currentSvgIndex];

                slider = d3.select(allSvgs[currentSvgIndex])
                    .append('rect')
                    .attr('class', 'sliderRect')
                    .attr('width', SVG_WIDTH)
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
        let container = d3.select(scrollContainer)
            .on('scroll', function(d) {
                console.log("Event: Scroll: scrollTop = " + this.scrollTop);
                slider.attr('y', Math.floor(this.scrollTop / multiplier) - (currentSvgIndex * SVG_MAX_HEIGHT));

                // Determine slider state
                if (currentSliderState === sliderState.BASE) {
                    if ( (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT - SLIDER_HEIGHT
                        && currentSvgIndex + 1 < maxNumSvgs)
                        || (Math.floor(this.scrollTop / multiplier) < currentSvgIndex * SVG_MAX_HEIGHT
                        && currentSvgIndex - 1 >= 0) ) {
                        console.log("Entering a transition...");

                        let transitionIndex = currentSvgIndex;
                        let transitionSliderPosY;

                        // Transition next
                        if (Math.floor(this.scrollTop / multiplier) >= (currentSvgIndex + 1) * SVG_MAX_HEIGHT - SLIDER_HEIGHT) {
                            console.log("Transition next");
                            transitionIndex += 1;
                            currentSliderState = sliderState.TRANSITION_NEXT;
                        } else {
                            console.log("Transition back");
                            transitionIndex -= 1;
                            currentSliderState = sliderState.TRANSITION_BACK;
                        }

                        transitionSliderPosY = Math.floor(this.scrollTop / multiplier) - (transitionIndex * SVG_MAX_HEIGHT);

                        // Create new slider for next svg
                        transitionSlider = d3.select(allSvgs[transitionIndex])
                            .append('rect')
                            .attr('class', 'sliderRect')
                            .attr('width', SVG_WIDTH)
                            .attr('height', SLIDER_HEIGHT)
                            .attr('y', transitionSliderPosY);
                    }
                }
                else {
                    console.log("transitioning...");
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
                        console.log("Entered transitioned svg");

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
     * Display coverage for the test case (using testcaseid). Go through each entry in the
     * coverage map, find the file container associated with it, and highlight covered lines.
     * Suspiciousness score object expected to be:
     * {
     *     source: string,
     *     lines: [{
     *         suspiciousness: number,
     *         hsl: string,
     *         linenumber: number
     *     }, ...]
     * }
     * @param {Object} suspiciousnessScores The suspiciousness object
     */
    displayCoverageOnMinimap(suspiciousnessScores) {
        console.log("displayCoverageOnMinimap()");

        for (let score of suspiciousnessScores) {
            // Extract source name
            let extractedSource = extractFileNameByDot(score.source);

            // Find index of file container
            let fileContainerIndex = this.state.allFiles.findIndex((val) => {
                return (extractedSource === val.name);
            });

            if (fileContainerIndex === -1) {
                console.error("Unable to find file container index");
                continue;
            }

            // Get all svg elements associated with file
            let svgsD3 = d3.selectAll(".fileContainer")
                .filter(function(d, i) {return i === fileContainerIndex})
                .selectAll(".svgContainer > div > svg");

            console.log("source: " + extractedSource
                + "\nFile container index: " + fileContainerIndex
                + "\nNumber of svg nodes: " + svgsD3.nodes().length);

            // Go through each line object
            for (let l = 0; l < score.lines.length; l++) {
                let lineObject = score.lines[l];

                // There can be multiple svgs in a file, find right svg for the current linenumber
                let svgNumber = Math.floor((lineObject.linenumber - 1) / this.LINES_PER_SVG);

                // Create a rect with the appropriate color
                svgsD3.filter(function(d, f) {return f === svgNumber})
                    .append("rect")
                    .attr("width", this.SVG_WIDTH)
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
    displayCoverageOnDisplay() {
        console.log("displayCoverageOnDisplay()");

        // Return if no file container was selected or the coverage data hasn't been loaded
        if (this.state.selectionIndex === -1) {
            console.log("No file containers were selected");
            return;
        }

        console.log("Selection Index: " + this.state.selectionIndex
            + "\nFiles: " + JSON.stringify(this.state.allFiles));

        // Get name of file for the selected file container
        let fileName = this.state.allFiles[this.state.selectionIndex].name;

        // Retrieve suspiciousness scores from state
        let suspiciousnessScores = this.state.suspiciousness;

        // Filter appropriate score object using filename
        let scoresArr = suspiciousnessScores.filter((s) => {
            return extractFileNameByDot(s.source) === fileName;
        });
        if (scoresArr.length === 0) {
            console.error("Unable to find source name");
            return;
        }
        let score = scoresArr[0];

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

    setViewScoresDisabled() {
        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));

        // Update state to enable or disable viewScores button
        let enabled = (activatedTestCases.length > 0) && this.state.selectionIndex != -1;
        this.setState((state) => ({
            isViewScoresDisabled: !enabled
        }));
    }

    generateViewDialog() {
        console.log("generateViewDialog()");
        // Return if no file containers were selected
        if (!this.state.isDialogOpened || this.state.selectionIndex === -1) {
            return;
        }

        // Remove any previous dialog content
        d3.select("#dialogScoresContainer").selectAll("*").remove();

        // Grab contents, file name for selected file container, and suspiciousness scores
        // from state
        let obj = this.state.allFiles[this.state.selectionIndex];
        let content = obj.contents;
        let fileName = this.state.allFiles[this.state.selectionIndex].name;
        let suspiciousnessScores = this.state.suspiciousness;

        // Filter score object using filename
        let scoresArr = suspiciousnessScores.filter((s) => {
            return extractFileNameByDot(s.source) === fileName;
        });

        // Start with the dialog title
        d3.select("#viewDialogTitle")
            .text(`Suspiciousness scores for ${obj.name}`);

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

    generateSuspDialog() {
        console.log("generateSuspDialog()");
        // Return if no file containers were selected
        if (!this.state.isSuspDialogOpened || this.state.selectionIndex === -1 
            || this.state.coverableIndex === -1) {
            return;
        }

        console.log("Coverable index: " + this.state.coverableIndex);
        let coverableIndex = this.state.coverableIndex;

        // Grab contents, file name for selected file container, and suspiciousness scores
        // from state
        let obj = this.state.allFiles[this.state.selectionIndex];
        let content = obj.contents;
        let fileName = this.state.allFiles[this.state.selectionIndex].name;
        let suspiciousnessScores = this.state.suspiciousness;

        // Filter appropriate score object using filename
        let scoresArr = suspiciousnessScores.filter((s) => {
            return extractFileNameByDot(s.source) === fileName;
        });
        if (scoresArr.length === 0) {
            return <p>An error occurred</p>;
        }
        let score = scoresArr[0];
        let lineObj = score.lines[coverableIndex];

        // Get data for detailsArr
        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testcase")
            .select("input")
            .nodes()
            .filter(n => n.checked)
            .map(n => n.getAttribute("key"));

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
                title: "Passed:",
                value: 0
            },
            {
                title: "Total Passed:",
                value: 0
            },
            {
                title: "Failed:",
                value: 0
            },
            {
                title: "Total Failed:",
                value: 0
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
        // Remove nodes
        d3.select("#directoryContainer").selectAll("*").remove();
        d3.select("#horizontalScrollView").selectAll("*").remove();
        d3.select("#scrollContainer").selectAll("*").remove();

        // Reset state
        // NOTE: commits[] is not reset 
        this.setState((state) => ({
            selectedCommit: '',
            allFiles: [],
            selectionIndex: -1,
            numberOfSvgs: 0,
            minimapMaxHeights: [],
            scrollContainerHeight: 0,
            testcases: [],
            suspiciousness: [],
            isViewScoresDisabled: true,
            coverableIndex: -1
        }));
    }

    /**
     * Removes coverage the appears on each minimap of each file container
     * and on the display
     */
    removeExistingCoverage() {
        // Remove coverage nodes on minimap
        let svgsD3 = d3.selectAll(".fileContainer")
            .selectAll(".svgContainer > div > svg");
        svgsD3.selectAll('rect.coverable')
            .remove();
        
        // If the display view is shown, remove coverage nodes 
        if (this.state.selectionIndex !== -1) {
            console.log("Removing coverableTr class");
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
     * @param  {Object}    event   The event that triggered the callback
     */
    handleChange(event) {
        console.log("handleChange() - sha: " + event.target.value);
        let sha = event.target.value;

        // Reset only if newly selected sha is different from previous sha
        if (this.state.selectedCommit !== sha) {
            this.resetComponent();
        }

        // Update state for the selected commit/sha
        this.setState(state => ({
            selectedCommit: sha
        }));
        
        // Request urls to the source files for current commit
        this.requestSourceLinks(sha);
    }

    /**
     * Event callback for when the checkbox for a source name is clicked.
     * Looks through the state's testcases to find the affiliated testcaseIds for the
     * clicked source, and checks the input checkboxes whose keys match those testcaseIds.
     * Then loads coverage data for multiple test cases.
     * @param   {string}    sourceName  The name of the source file
     * @param   {boolean}   checked     Whether the checkbox was checked or unchecked
     */
    onSourceNameChecked(sourceName, checked) {
        console.log("onSourceNameChecked() - sourceName: " + sourceName + ", checked: " + checked);

        // Filter state's testcases by source name that was checked
        let source = this.state.testcases.filter((t) => {
            let k = Object.keys(t)[0];
            return k === sourceName;
        })[0];
        
        // Gather testcase ids in an array
        let testcases = source[sourceName].map((tc) => {
            return tc.testcaseId;
        });
        console.log("Test cases: " + testcases);

        // Check only checkboxes with testcase keys contained in testcases
        d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return testcases.includes(d3.select(this).attr("key"));
            })
            .property("checked", checked);

        // Request coverage data
        this.requestCoverage();
    }

    /**
     * Event callback for when the checkbox for a testcase is clicked.
     * Loads coverage data for test case.
     * @param   {number}    testcaseId  Number indicating the testcase id
     * @param   {boolean}   checked     Whether the checkbox was checked or unchecked
     */
    onTestCaseChecked(testcaseId, checked) {
        console.log("onTestCaseChecked() - testcaseId: " + testcaseId + ", checked: " + checked);

        // Request coverage data
        this.requestCoverage();
    }

    /**
     * Update the state with the selected file container. Reset background color of  
     * unselected containers and update color for selected file container.
     * Generate the display, the slider, and coverage for selected index.
     * @param {number} index The index of the file container that was clicked
     */
    updateSelection(index) {
        console.log("updateSelection() - index #" + index);

        if (this.state.selectionIndex === index) {
            console.log("Already in same file container. Returning...");
            return;
        }

        const linesOfCode = this.state.allFiles[index].contents.length;

        let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);

        let minimapMaxHeights = [];
        for (let i = 0; i < numberOfSvgs; i++) {
            let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
                        (totalHeightForFile % this.SVG_MAX_HEIGHT);
            minimapMaxHeights.push(svgHeight);
        }

        // Update state
        this.setState((state) => ({
            selectionIndex: index,
            numberOfSvgs: numberOfSvgs,
            minimapMaxHeights: minimapMaxHeights
        }));

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

    onClearOrAllButtonClicked(checkAll) {
        console.log("onClearButtonClicked()");

        d3.selectAll(".sourceName")
            .select("input")
            .property("checked", checkAll);

        d3.selectAll(".testcase")
            .select("input")
            .property("checked", checkAll);

        // Request coverage data
        this.requestCoverage();
    }

    onPassedOrFailedButtonClicked(passFailStatus) {
        console.log("onPassedOrFailedButtonClicked() - status: " + passFailStatus);

        let status = (passFailStatus) ? 1 : 0;

        // Get test case ids for tests that passed from 
        let testcaseIds = [];
        let testcases = this.state.testcases;
        for (let t of testcases) {
            let k = Object.keys(t)[0];
            let v = t[k];

            console.log("k: " + JSON.stringify(k) + "\nv: " + JSON.stringify(v));

            let ids = v.filter((o) => {
                return o.passed === status;
            }).map((o) => {
                return o.testcaseId;
            });
            console.log("ids: " + ids);
            testcaseIds = testcaseIds.concat(ids);
        }
        console.log("testcaseIds: " + testcaseIds);

        // For checkboxes whose id is included in testcaseIds, check 
        let includedCheckboxes = d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return testcaseIds.includes(d3.select(this).attr("key"));
            })
            .property("checked", true);;
        
        // For checkboxes whose id is not included in testcaseIds, uncheck
        let excludedCheckboxes = d3.selectAll(".testcase")
            .select("input")
            .filter(function(d, i) {
                return !testcaseIds.includes(d3.select(this).attr("key"));
            })
            .property("checked", false);;

        // Request coverage data
        this.requestCoverage();
    }

    onViewScoresClicked() {
        console.log("onViewScoresClicked()");
        if (!this.state.isDialogOpened) {
            this.setState((state) => ({
                isDialogOpened: true
            }));
        }
    }

    onCoverableLineClicked(coverableIndex) {
        console.log("onCoverableLineClicked(): - " 
            + "\nindex: " + coverableIndex);
        
        if (!this.state.isSuspDialogOpened) {
            this.setState((state) => ({
                isSuspDialogOpened: true,
                coverableIndex: coverableIndex
            }));
        }
    }

    onDialogClose(dlg) {
        console.log("onDialogClose()");

        switch(dlg) {
            case "view": {
                console.log("Dialog for view closed");
                this.setState((state) => ({
                    isDialogOpened: false
                }));
                break;
            }
            case "susp": {
                console.log("Dialog for susp closed");
                this.setState((state) => ({
                    isSuspDialogOpened: false
                }));
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
        return (
            <div id="tarantula">
                <div id="commitContainer">
                    <div id="directoryActions">
                        <ButtonGroup size="small" variant="text" color="primary" aria-label="small text primary button group">
                            <Button className="directoryButton" onClick={(e) => this.onClearOrAllButtonClicked(false, e)}>Clear</Button>
                            <Button className="directoryButton" onClick={(e) => this.onClearOrAllButtonClicked(true, e)}>All</Button>
                            <Button className="directoryButton" onClick={(e) => this.onPassedOrFailedButtonClicked(true, e)}>Passed</Button>
                            <Button className="directoryButton" onClick={(e) => this.onPassedOrFailedButtonClicked(false, e)}>Failed</Button>
                        </ButtonGroup>
                    </div>

                    <div>
                        <IconButton aria-label="view scores" color="primary" 
                            disabled={this.state.isViewScoresDisabled}
                            onClick={this.onViewScoresClicked}>
                            <PageviewIcon />
                        </IconButton>
                    </div>

                    <div ref={this.commitWrapper}>
                        <FormControl >
                            <InputLabel id="simpleSelectLabelCommit">Commit</InputLabel>
                            <Select
                                labelId="simpleSelectLabelCommit"
                                id="selectCommit"
                                value={this.state.selectedCommit}
                                onChange={this.handleChange}
                            >
                                {
                                    this.state.commits.map((c) => (
                                        <MenuItem className="taranMenuItem" key={c.commitId} value={c.commitId}>
                                            <div>
                                                <p className="menuItemMessage">{shortenMessage(c.message)}</p>
                                                <p>
                                                    <span className="menuItemCommitter">
                                                        {c.committer || "<invalid-user>"}
                                                    </span>
                                                    <span className="menuItemDate"> committed on {convertTimestampToDate(c.timestamp)}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="menuItemCommitId">{shortenCommitId(c.commitId)}</p>
                                            </div>
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div id="tarantulaWrapper">
                    <div id="directoryContainer"></div>

                    <div id="visualizationWrapper">
                        <div id="horizontalScrollView"></div> 
                        <div id="scrollContainer"></div>
                    </div>
                </div>

                <Dialog 
                    onEntered={this.generateViewDialog}
                    onClose={(e) => this.onDialogClose("view", e)} 
                    aria-labelledby="viewDialogTitle" 
                    open={this.state.isDialogOpened}
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
                    open={this.state.isSuspDialogOpened}
                    fullWidth={true}
                    maxWidth="sm">
                    <DialogTitle id="suspDialogTitle">Line Details</DialogTitle>
                    <DialogContent>
                        <div id="dialogSuspContainer"></div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}

export default Tarantula;
