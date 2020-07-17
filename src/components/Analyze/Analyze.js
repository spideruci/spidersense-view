import React from 'react';

import * as d3 from 'd3';
import Request from '../../network/request';
import FileNameParser from '../../util/file-name-parser';
import CoverageMatrixAdapter from '../../network/coverage-matrix-adapter';

import "./Analyze.css";


class Analyze extends React.Component {
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
            adapter: null,
            activatingTests: []
        };

        // Constants
        this.FONT_SIZE = 1;            // Font size for svg text
        this.Y_TEXT_PADDING = 1;       // Top padding for each tspan

        this.SVG_WIDTH = 48;           // Width of each minimap
        this.SVG_MAX_HEIGHT = 300;     // Height of each minimap
        this.PIXELS_PER_LINE = this.FONT_SIZE + this.Y_TEXT_PADDING;    // # of pixels making up 1 line
        this.LINES_PER_SVG = Math.floor(this.SVG_MAX_HEIGHT / this.PIXELS_PER_LINE);
        this.TABLE_BODY_WIDTH = 800;
        this.SCROLL_FONT_SIZE = 12;
        this.SCROLL_CONTAINER_PADDING = 12;

        // Bind methods
        this.loadAllFiles = this.loadAllFiles.bind(this);
        this.generateFileContainers = this.generateFileContainers.bind(this);
        this.generateMinimap = this.generateMinimap.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.generateSlider = this.generateSlider.bind(this);
        this.generateDisplay = this.generateDisplay.bind(this);

        // this.handleCoverageChange = this.handleCoverageChange.bind(this);
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

        // TODO: Actually obtain list of files
        let files = [
            // process.env.PUBLIC_URL + "/tests/sampleACADEdited2.txt"
            // process.env.PUBLIC_URL + "/tests/hello-world.txt",
            // process.env.PUBLIC_URL + "/tests/pride-and-prejudice.txt"
            // process.env.PUBLIC_URL + "/tests/Botm2.java",
            // 'https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json'
            process.env.PUBLIC_URL + "/tarantula/PassFailPair.java",
            process.env.PUBLIC_URL + "/tarantula/Tarantula.java",
            process.env.PUBLIC_URL + "/tarantula/TarantulaData.java",
            process.env.PUBLIC_URL + "/tarantula/TarantulaDataBuilder.java",
            process.env.PUBLIC_URL + "/tarantula/TarantulaFaultLocalizer.java",
        ];

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
        });
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

        let horizontalView = document.getElementById("horizontalScrollView");

        for (let i = 0; i < numFiles; i++) {
            let fileContainer = document.createElement('div');
            fileContainer.classList.add('fileContainer');
            horizontalView.appendChild(fileContainer);
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
            .append("table");
        let tablebody = table
            .attr('width', this.TABLE_BODY_WIDTH)
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
        let file = process.env.PUBLIC_URL + "/tests/b589f83a9c6bb3631e8c796848c309c2a677b2a8-cov-matrix.json";

        let activatedTest = document.querySelector("#coverageInput > div > div > input").value;
        if (activatedTest == null || isNaN(parseInt(activatedTest, 10)) ) {
            console.error("Can't load coverage data");
            return;
        }
        console.log("Input value: " + activatedTest);

        // Create Request object to handle requests
        let req = new Request();
        let promise = req.prepareSingleRequest(file, 'json');

        promise.then((value) => {
            this.displayCoverage(value, parseInt(activatedTest, 10));

            console.log("Successfully processed response");
        });
    }

    /**
     * Display coverage for the activating test number. This number is an index to the 
     * testsIndex array, which maps to the test method that has "activated" or covered
     * lines of the source code.
     * @param {Object} request              The request object containing coverage data
     * @param {number} activatingTestNumber The test method to display coverage for
     */
    displayCoverage(request, activatingTestNumber) {
        let adapter = new CoverageMatrixAdapter(request.response);
        let parser = new FileNameParser();

        // Go through each source, store source only if activating test number is part of 
        // activatingTests.
        let activatedSources = adapter.filterSourcesByActivatingTest(activatingTestNumber);
        if (activatedSources.length === 0) {
            return;
        }

         // For each activated source, get testStmtArr using activatingTestNumber on matrix,
         // find file container index via name, and add rects for covered lines
        for (let src of activatedSources) {
            let srcFullName = src.source.fullName;
            let srcExtractName = parser.extractFileName(srcFullName);
            let srcFirstLine = src.source.firstLine;

            let matrixIndex = src.activatingTests.findIndex((val) => {
                return val === activatingTestNumber;
            });

            let testStmtArr = src.testStmtMatrix[matrixIndex];
            let testStmtArrLength = testStmtArr.length;

            let fileContainerIndex = this.state.allFiles.findIndex((val) => {
                return (srcExtractName === parser.extractFileName(val.name));
            });

            let svgsD3 = d3.selectAll(".fileContainer")
                .filter(function(d, i) {return i === fileContainerIndex})
                .selectAll(".svgContainer > div > svg");
            
            console.log("srcFullName: " + srcFullName
                + "\nsrc extract name: " + srcExtractName
                + "\nmatrix index: " + matrixIndex
                + "\nfile container index: " + fileContainerIndex
                + "\nsvgsD3 lengths: " + svgsD3.nodes().length);
            
            for (let i = 0; i < testStmtArrLength; i++) {
                if (!testStmtArr[i]) {
                    continue;
                }

                let svgNumber = Math.floor((i + srcFirstLine - 1) / this.LINES_PER_SVG);

                svgsD3.filter(function(d, f) {return f === svgNumber})
                    .append("rect")
                    .attr("width", this.SVG_WIDTH)
                    .attr("height", this.PIXELS_PER_LINE)
                    .attr("x", 0)
                    .attr("y", this.PIXELS_PER_LINE * ((i + srcFirstLine - 1) % this.LINES_PER_SVG ))
                    .classed("coverable", true);
            }
        }

        // Update state with adapter and activating test
        this.setState((state) => ({
            adapter: adapter,
            activatingTests: [activatingTestNumber]
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
        if (this.state.adapter == null) {
            return;
        }

        // Get activating test and file name of selection index
        let activatingTestNumber = this.state.activatingTests[0];
        let fileName = this.state.allFiles[this.state.selectionIndex].name;

        // Find source in current adapter that has same name as the file name
        let src = this.state.adapter.findSourceByName(fileName);
        let srcFirstLine = src.source.firstLine;

        let matrixIndex = src.activatingTests.findIndex((val) => {
            return val === activatingTestNumber;
        });
        if (matrixIndex === -1) {
            return;
        }

        let testStmtArr = src.testStmtMatrix[matrixIndex];
        let testStmtArrLength = testStmtArr.length;

        // Obtain list of tr nodes 
        let rows = d3.select("#scrollContainer")
            .select("table")
            .select("tbody")
            .selectAll("tr")
            .nodes();

        // Change background color of nodes that are covered
        for (let i = 0; i < testStmtArrLength; i++) {
            if (!testStmtArr[i]) {
                continue;
            }
            rows[i + srcFirstLine - 1].classList.add("coverableTr");
        }
    }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
        return (
            <div className="analyze">
                <div id="coverageInput">
                    <div>
                        <div>
                            <input type="text"></input>
                        </div>
                        <button onClick={(e) => this.loadCoverageData(e)}>Load coverage</button>
                    </div>
                </div>

                <div id="horizontalScrollView"></div> 

                <div id="scrollContainer"></div>

                {/* <div className="fileInfoHeader">
                    <div>
                        <p>File Name:</p>
                        <p>{this.state.currentText.name}</p>
                    </div>
                    <div>
                        <p>Lines of code:</p>
                        <p>{this.state.currentText.content.length}</p>
                    </div>
                </div> */}
            </div>
        );
     }
}

export default Analyze;