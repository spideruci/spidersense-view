import React, { Component } from 'react';

import * as d3 from 'd3';
import Request from '../../network/request';
import FileNameParser from '../../util/file-name-parser';
import TestcaseCoverageAdapter from '../../network/testcase-coverage-adapter';

import "./Tarantula.css";

class Tarantula extends Component {
    /** =======================================================================
     * 
     * LIFECYCLE
     * 
     ======================================================================= */
    constructor(props) {
        super(props);

        // Initialize state
        this.state = {
            allFiles: [],
            selectionIndex: -1,
            numberOfSvgs: 0,
            minimapMaxHeights: [],
            scrollContainerHeight: 0,
            adapters: [],
            testcases: []
        };

        // Constants
        this.FONT_SIZE = 1;            // Font size for svg text
        this.Y_TEXT_PADDING = 1;       // Top padding for each tspan

        this.SVG_WIDTH = 48;           // Width of each minimap
        this.SVG_MAX_HEIGHT = 300;     // Height of each minimap
        this.PIXELS_PER_LINE = this.FONT_SIZE + this.Y_TEXT_PADDING;    // # of pixels making up 1 line
        this.LINES_PER_SVG = Math.floor(this.SVG_MAX_HEIGHT / this.PIXELS_PER_LINE);
        this.TABLE_BODY_WIDTH = 700;
        this.SCROLL_FONT_SIZE = 12;
        this.SCROLL_CONTAINER_PADDING = 12;

        const SCROLL_CONTAINER_HEIGHT = 512;
        // this.DIRECTORY_HEIGHT = this.SVG_MAX_HEIGHT + 16 + 12 + 14 + SCROLL_CONTAINER_HEIGHT;
        this.DIRECTORY_HEIGHT = 864;

        // Bind methods
        this.loadAllFiles = this.loadAllFiles.bind(this);

        this.generateDirectoryContainer = this.generateDirectoryContainer.bind(this);
        this.onSourceNameChecked = this.onSourceNameChecked.bind(this);

        this.generateFileContainers = this.generateFileContainers.bind(this);
        this.generateMinimap = this.generateMinimap.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.generateSlider = this.generateSlider.bind(this);
        this.generateDisplay = this.generateDisplay.bind(this);

        this.loadCoverageData = this.loadCoverageData.bind(this);
        this.displayCoverage = this.displayCoverage.bind(this);
        this.displaySelectedCoverage = this.displaySelectedCoverage.bind(this);
    } 

    componentDidMount() {
        this.loadAllFiles();
    }

    /** =======================================================================
     * 
     * METHODS - Requests and Response
     * 
     ======================================================================= */
    /**
     * Loads the files into the current component. A request is made for each file 
     * and gathered as promises.
     */
    loadAllFiles() {
        console.log("loadAllFiles()");

        const baseUrl = "https://raw.githubusercontent.com";
        let username = "spideruci";
        let projectName = "Tarantula";
        let branch = "master";
        let javaDirectoryPath = "src/main/java";

        let sourceNames = [
            "org.spideruci.tarantula.PassFailPair.java",
            "org.spideruci.tarantula.Tarantula.java",
            "org.spideruci.tarantula.TarantulaData.java",
            "org.spideruci.tarantula.TarantulaDataBuilder.java",
            "org.spideruci.tarantula.TarantulaFaultLocalizer.java"
        ];
        let modifiedSourceNames = sourceNames.map((v) => {
            let split = v.split(".");
            let fSplit = split.slice(0, split.length - 1);
            let fJoined = fSplit.join("/");
            return fJoined + "." + split[split.length - 1];
        });
        console.log(modifiedSourceNames);

        let files = modifiedSourceNames.map((v) => {
            return [baseUrl, username, projectName, branch, javaDirectoryPath, v].join("/");
        });
        console.log(files);


        // Generate file container
        this.generateFileContainers(files.length);

        // Create Request object to handle requests
        let req = new Request();
        let promisesArr;
        try {
            promisesArr = req.prepareRequest(files, 'text');
        } catch(err) {
            console.err(err);
            return;
        }

        // Process each response only when all requests complete
        Promise.all(promisesArr).then((values) => {
            for (let i = 0; i < values.length; i++) {
                console.log("Request #" + i + ":\n" + values[i]);
                this.processResponse(values[i], i);
            }

            console.log("Successfully processed all responses");

            let getTaranTestcasesUrl = "http://127.0.0.1:5000/getAllTaranTestcases";
            let getTaranTestcasesRequest = new Request();
            let getTaranTestcasesPromise = getTaranTestcasesRequest.prepareSingleRequest(getTaranTestcasesUrl, 'json');
            getTaranTestcasesPromise.then((value) => {
                console.log(JSON.stringify(value.response));
                // Generate directory contianer
                this.generateDirectoryContainer(value.response);
            });
        });
    }

    /** =======================================================================
     * 
     * METHODS - Directory View
     * 
     ======================================================================= */
    generateDirectoryContainer(testcases) {
        let sourceNames = testcases.src;
        console.log("Printing source names: " + sourceNames);

        let testcasesData = [];
        for (let k of Object.keys(testcases)) {
            if (k !== "src") {
                let obj = {};
                obj[k] = testcases[k];
                testcasesData.push(obj);
            }
        }
        console.log(JSON.stringify(testcasesData));

        let tests = d3.select("#directoryContainer")
            .style("height", this.DIRECTORY_HEIGHT.toString() + "px")
            .selectAll("div")
            .data(testcasesData)
            .enter()
            .append("div")
            .classed("directoryTests sourceName", true);
        
        let testsCheckContainer = tests.append("div")
            .classed("directoryCheckboxLabel", true);
        testsCheckContainer.append("input")
            .attr("type", "checkbox")
            .attr("key", function(t) {return Object.keys(t)[0]});
        testsCheckContainer.append("label")
            .text(function(t) {return Object.keys(t)[0]});

        let testCases = tests.append("div")
            .classed("directoryTestCases", true)
            .selectAll("div")
            .data(function(t) {
                let k = Object.keys(t)[0];
                return t[k];
            })
            .enter()
            .append("div")
            .classed("directoryCheckboxLabel testCase", true);
        testCases.append("input")
            .attr("type", "checkbox")
            .attr("key", function(t) {return t.testcaseId});
        testCases.append("label")
            .text(function(t) {return t.signature});

        this.setState((state) => ({
            testcases: testcasesData
        }));

        d3.selectAll(".sourceName input")
            .on('click', () => {
                this.onSourceNameChecked(d3.event.target.getAttribute("key"), d3.event.target.checked);
            });
        d3.selectAll(".testCase input")
            .on('click', () => {
                this.onTestCaseChecked(d3.event.target.getAttribute("key"), d3.event.target.checked);
            });
    }

    onSourceNameChecked(sourceName, checked) {
        console.log("onSourceNameChecked(): sourcename: " + sourceName + " checked: " + checked);
        let source = this.state.testcases.filter((t) => {
            let k = Object.keys(t)[0];
            console.log("K: " + k);
            return k === sourceName;
        })[0];
        
        let testCases = source[sourceName].map((tc) => {
            return tc.testcaseId;
        });
        console.log("test cases: " + testCases);

        let allTestCheckboxes = d3.selectAll(".testCase")
            .select("input").nodes();

        for (let i = 0; i < allTestCheckboxes.length; i++) {
            let key = allTestCheckboxes[i].getAttribute("key");
            if (testCases.includes(key)) {
                console.log("KEY: " + key);
                allTestCheckboxes[i].checked = checked;
            }
        }

        this.loadCoverageData();
    }

    onTestCaseChecked(testCaseId, checked) {
        console.log("onTestCaseChecked(): testCaseId: " + testCaseId + " checked: " + checked);
        this.loadCoverageData();
    }


    /**
     * Retrieves the response from the request object, processes the response
     * text, and updates the state to include the current file.
     * @param   {Object}    request     The request object
     * @param   {number}    index       The index of the request
     */
    processResponse(request, index) {
        const txt = request.response;
        let txtLineByLine = txt.split("\n");

        console.log("Processing response - text line-by-line is:\n" + txtLineByLine);

        // For each element in array that is empty, replace with newline
        txtLineByLine = txtLineByLine.map((l) => {
            return (l.length === 0) ? "\n" : l;
        });

        // Add object with information about file to allFiles
        let obj = {
            name: request.responseURL,
            contents: txtLineByLine
        }
        
        this.setState((state) => ({
            allFiles: state.allFiles.concat(obj)
        }));

        // Generate minimap(s) for the current file
        this.generateMinimap(txtLineByLine, index);
    }

    /** =======================================================================
     * 
     * METHODS - DOM Manipulation
     * 
     ======================================================================= */

    /**
     * Creates a container (div) with the class 'fileContainer' for each
     * file that was requested. The file containers will hold the containers
     * for the title of the file and each svg element of the file.
     * @param {number} numFiles The number of files
     */
    generateFileContainers(numFiles) {
        console.log("Generating file containers...");

        let horizontalScollViewD3 = d3.select("#horizontalScrollView")
            .style("width", this.TABLE_BODY_WIDTH + "px");
        
        for (let i = 0; i < numFiles; i++) {
            horizontalScollViewD3.append("div")
                .classed('fileContainer', true);
        }
    }

    /**
     * Generates the minimap(s) for each file that was requested.
     * Calculates how many maps should be added, the height for each map, and
     * the tspan elements that should be embedded for each svg element.
     * @param   {number}    txtLineByLine   The lines of the file as an array
     * @param   {number}    fileIndex       The index of the current file
     */
    generateMinimap(txtLineByLine, fileIndex) {
        console.log("Generating minimap for file at index #" + fileIndex);

        // Calculate variables
        const linesOfCode = txtLineByLine.length;
        let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);
        console.log("LOC: " + linesOfCode + "\nAvailable svg height:" + this.SVG_MAX_HEIGHT 
            + "\nPixels per line: " + this.PIXELS_PER_LINE
            + "\nLines per svg: " + this.LINES_PER_SVG
            + "\nTotal height for file: " + totalHeightForFile 
            + "\nNumber of svgs: " + numberOfSvgs);

        let fileContainer = d3.selectAll('.fileContainer')
            .filter(function(d, i) {return i === fileIndex})
            .on('click', (e) => {
                this.updateSelection(fileIndex, e);
            });

        let parser = new FileNameParser();
        let modifiedTitle = parser.extractFileName(this.state.allFiles[fileIndex].name);
        let titleContainer = fileContainer.append('div');
        titleContainer.append('p')
            .text(modifiedTitle);

        let svgContainerD3 = fileContainer.append('div')
            .classed('svgContainer', true);

        // For each svg, set its width, height, y offset, and append elements
        for (let i = 0; i < numberOfSvgs; i++) {
            let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
                        (totalHeightForFile % this.SVG_MAX_HEIGHT);

            let divI = svgContainerD3.append("div");
            let svgI = divI.append("svg")
                .attr("width", this.SVG_WIDTH)
                .attr("height", svgHeight);
            let textI = svgI.append("text")
                .attr("x", 0)
                .attr("y", 0);

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

        // Set font size on text element
        d3.selectAll('.svgContainer')
            .selectAll('div')
            .select('svg')
            .selectAll('text')
            .style('font-size', this.FONT_SIZE.toString() + "px");
    }

    /**
     * Update the state with the selected file container. Reset background color of  
     * unselected containers and update color for selected file container.
     * Generate the display, the slider, and coverage for selected index.
     * @param {number} index The index of the file container that was clicked
     */
    updateSelection(index) {
        console.log("Update selection of file container at index #" + index);

        if (this.state.selectionIndex === index) {
            console.log("Already in same file container");
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
        let fileContainers = document.getElementsByClassName('fileContainer');
        for (let i = 0; i < fileContainers.length; i++) {
            fileContainers[i].style.backgroundColor = "#FFFFFF";
        }
        fileContainers[index].style.backgroundColor = "#E9E9E9";

        // Generate display
        this.generateDisplay(index);

        // Generate slider
        this.generateSlider(index);

        // Display selected coverage if it is available
        this.displaySelectedCoverage();
    }

    /**
     * Generates the display for whichever file was clicked. This function is
     * called from updateSelection() when a click event on a file container occurs.
     * @param {number} index The index of the file container that was clicked.
     */
    generateDisplay(index) {
        console.log("Generating display for file container at index #" + index);

        // Grab contents 
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
                if (currentSliderState == sliderState.TRANSITION_BACK) {
                    d3.select(nodes[currentSvgIndex - 1])
                        .select('.sliderRect').remove();
                }
                else if (currentSliderState == sliderState.TRANSITION_NEXT) {
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
                if (currentSliderState == sliderState.BASE) {
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
                    if (currentSliderState == sliderState.TRANSITION_NEXT) {
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
                    else if (currentSliderState == sliderState.TRANSITION_BACK) {
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
     * Load the json file pertaining to the coverage data
     */
    loadCoverageData() {
        this.removeExistingCoverage();

        // Get the test ids of the activated (checked) tests 
        let activatedTestCases = d3.selectAll(".testCase")
            .select("input")
            .nodes()
            .filter((n) => {
                return n.checked;
            })
            .map((n) => {
                return n.getAttribute("key");
            });
        
        console.log("Activated tests: " + activatedTestCases);

        // Map test ids to server url
        let files = activatedTestCases.map((t) => {
            // return process.env.PUBLIC_URL + "/tests/test-case-" + t.toString() + ".json";
            return "http://127.0.0.1:5000/testcaseCoverage/" + t.toString();
        });

        console.log(files);

        // Create Request object to handle requests
        let promisesArr = new Array(files.length);
        for (let i = 0; i < files.length; i++) {
            let req = new Request();
            promisesArr[i] = req.makeRequest(files[i], 'json');
        }

        // Process each response only when all requests complete
        Promise.all(promisesArr).then((values) => {
            for (let i = 0; i < values.length; i++) {
                console.log("Request #" + i + ":\n" + JSON.stringify(values[i].response));

                this.displayCoverage(values[i].response, activatedTestCases[i]);
            }

            console.log("Successfully processed all responses");
        })
        .catch(error => { 
            console.error(error.message);
        });
    }

    /**
     * Display coverage for the test case (using testcaseid). Go through each entry in the
     * coverage map, find the file container associated with it, and highlight covered lines.
     * @param {Object} response   The response object containing coverage data
     * @param {number} testCaseId The test case id to display coverage for
     */
    displayCoverage(response, testCaseId) {
        // this.removeExistingCoverage();

        let parser = new FileNameParser();
        // let adapter = new TestcaseCoverageAdapter(testCaseId, request.response);
        let adapter = new TestcaseCoverageAdapter(testCaseId);
        adapter.getLineCoverageByFile(response);

        // let coverageMap = adapter.getLineCoverageByFile();
        let coverageMap = adapter.getCoverageMap();
        for (let [key, value] of coverageMap.entries()) {
            console.log(key + ' = ' + value);
        }

        // For each entry in the map, get the matching file container index,
        // and add rects for each line that is covered.
        for (let [key, value] of coverageMap.entries()) {
            let fileContainerIndex = this.state.allFiles.findIndex((val) => {
                return (key === parser.extractFileName(val.name));
            });

            let svgsD3 = d3.selectAll(".fileContainer")
                .filter(function(d, i) {return i === fileContainerIndex})
                .selectAll(".svgContainer > div > svg");
        
            console.log("src extract name: " + key
                + "\nfile container index: " + fileContainerIndex
                + "\nsvgsD3 lengths: " + svgsD3.nodes().length);
            
            for (let i = 0; i < value.length; i++) {
                let svgNumber = Math.floor((value[i] - 1) / this.LINES_PER_SVG);

                svgsD3.filter(function(d, f) {return f === svgNumber})
                    .append("rect")
                    .attr("width", this.SVG_WIDTH)
                    .attr("height", this.PIXELS_PER_LINE)
                    .attr("x", 0)
                    .attr("y", this.PIXELS_PER_LINE * ((value[i] - 1) % this.LINES_PER_SVG ))
                    .classed("coverable", true);
            }
        }

        // Update state with adapter and activating test
        this.setState((state) => ({
            adapters: state.adapters.concat(adapter),
            // activatingTests: [testCaseId]
        }));

        // Display coverage in scroll container
        this.displaySelectedCoverage();
    }

    /**
     * For the currently selected file determined by the selection index, 
     * display the coverage data by highlighting lines of the activated test.
     */
    displaySelectedCoverage() {
        // Return if no file container was selected or the coverage data hasn't been loaded
        if (this.state.selectionIndex === -1) {
            return;
        }
        if (this.state.adapters == null || this.state.adapters.length === 0) {
            return;
        }

        console.log("ADAPTERS: " + JSON.stringify(this.state.adapters) + "\nSELECTION INDEX: " + this.state.selectionIndex);
        console.log("Files: " + JSON.stringify(this.state.allFiles));

        let fileName = this.state.allFiles[this.state.selectionIndex].name;
        let parser = new FileNameParser();
        let extractedFileName = parser.extractFileName(fileName);

        // Obtain list of tr nodes 
        let rows = d3.select("#scrollContainer")
            .select("table")
            .select("tbody")
            .selectAll("tr")
            .nodes();

        let allAdapters = this.state.adapters;
        for (let a = 0; a < allAdapters.length; a++) {
            let adapter = allAdapters[a];
            let coverageMap = adapter.getCoverageMap();

            // Find source in current adapter that has same name as the file name
            let coveredLines = coverageMap.get(extractedFileName);
            let coveredLinesLength = coveredLines.length;
            if (coveredLines == undefined) {
                console.error("Couldn't retrieve extracted file name from adapter");
                console.log("filename: " + fileName 
                    + "\nextracted file name: " + extractedFileName);
                return;
            }

            // Change background color of nodes that are covered
            for (let i = 0; i < coveredLinesLength; i++) {
                rows[coveredLines[i] - 1].classList.add("coverableTr");
            }
        }
    }

    removeExistingCoverage() {
        let svgsD3 = d3.selectAll(".fileContainer")
            .selectAll(".svgContainer > div > svg");
            svgsD3.selectAll('rect.coverable')
            .remove();

        this.setState((state) => ({
            adapters: []
        }));
    }


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
    render() {
        return (
            <div id="tarantula">
                <div id="directoryContainer"></div>

                <div id="coverageContainer">
                    <div id="horizontalScrollView"></div> 
                    <div id="scrollContainer"></div>
                </div>
            </div>
        );
    }
}

export default Tarantula;
