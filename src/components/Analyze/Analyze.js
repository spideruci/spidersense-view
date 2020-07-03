import React, { Component } from 'react';

import * as d3 from 'd3';
import Timer from "./../../util/timer";

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
            timeDiffSvg: 0,
            timeDiffCanvas: 0
        };

        // Bind methods
        this.loadAllFiles = this.loadAllFiles.bind(this);
        this.generateFileContainers = this.generateFileContainers.bind(this);
        this.generateMinimap = this.generateMinimap.bind(this);
        this.generateMinimapCanvas = this.generateMinimapCanvas.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
        this.generateDisplay = this.generateDisplay.bind(this);

        this.benchmarkMinimapSvg = this.benchmarkMinimapSvg.bind(this);
        this.benchmarkMinimapCanvas = this.benchmarkMinimapCanvas.bind(this);
    } 

    componentDidMount() {
        this.loadAllFiles();
    }

    /** =======================================================================
     * 
     * METHODS - Network
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
            process.env.PUBLIC_URL + "/tests/pride-and-prejudice.txt"
            // process.env.PUBLIC_URL + "/tests/Botm2.java",
            // 'https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json'
        ];

        // Generate file container
        this.generateFileContainers(files.length);

        // Gather the requests as promises into an array
        let promisesArr = new Array(files.length);
        for (let i = 0; i < files.length; i++) {
            let promise = this.makeRequest(files[i]);
            promisesArr[i] = promise;
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
     * Returns the request for the given url (a file) as a promise
     * @param   {string}    url     The url to the file
     * @param   {string}    method  The HTTP method
     */
    makeRequest(url, method) {
        // Create the XHR request and return as a promise
        let request = new XMLHttpRequest();
    
        return new Promise(function (resolve, reject) {
            // Setup our listener to process compeleted requests
            request.onreadystatechange = function () {
                // Only run if the request is complete
                if (request.readyState !== 4) {
                    return;
                }
    
                // Process the response, resolve if success, reject if fial
                if (request.status >= 200 && request.status < 300) {
                    resolve(request);
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
            };
    
            // Setup our HTTP request and send
            request.open(method || 'GET', url, true);
            request.responseType = 'text';    
            request.send();
        });
    };

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
        // this.generateMinimap(txtLineByLine, index);
    }

    /** =======================================================================
     * 
     * METHODS - DOM Manipulation
     * 
     ======================================================================= */

    /**
     * Creates a container (div) with the class 'fileContainer' for each
     * file that was requested. The file containers will hold the containers
     * for the title of the file, and each svg element of the file.
     * @param {number} numFiles The number of files
     */
    generateFileContainers(numFiles) {
        let horizontalView = document.getElementById("horizontalScrollView");

        for (let i = 0; i < numFiles; i++) {
            let fileContainer = document.createElement('div');
            fileContainer.classList.add('fileContainer');
            horizontalView.appendChild(fileContainer);
        }
    }

    /**
     * Generates the minimap(s) and called for each file that was requested.
     * Calculates how many maps should be added, the height for each map, and
     * the tspan elements that should be embedded for each svg element.
     * @param   {number}    txtLineByLine   The lines of the file as an array
     * @param   {number}    fileIndex       The index of the current file
     */
    generateMinimap(txtLineByLine, fileIndex) {
        console.log("Generating minimap for file at index " + fileIndex);

        // Minimap Constants
        const linesOfCode = txtLineByLine.length;
        const FONT_SIZE = 2;         // Font size for svg text
        const X_PADDING = 10;        // Left padding for each tspan
        const Y_PADDING = 10;        // Top and Bottom padding for each text
        const Y_TEXT_PADDING = 2;    // Top padding for each tspan

        const SVG_WIDTH = 96;           // Width of each minimap
        const SVG_MAX_HEIGHT = 400;     // Height of each minimap
        const AVAILABLE_SVG_HEIGHT = SVG_MAX_HEIGHT - (Y_PADDING * 2);   // Space for text and padding
        const PIXELS_PER_LINE = FONT_SIZE + Y_TEXT_PADDING;              // # of pixels making up 1 line
        const LINES_PER_SVG = Math.floor(AVAILABLE_SVG_HEIGHT / PIXELS_PER_LINE);

        // Add click event to file container
        let fileContainer = document.getElementsByClassName('fileContainer')[fileIndex];
        fileContainer.addEventListener('click', (e) => this.updateSelection(fileIndex, e));

        // Create title container and set the title for current file
        let titleContainer = document.createElement('div');
        let title = document.createElement('p');
        title.innerHTML = this.state.allFiles[fileIndex].name;

        fileContainer.appendChild(titleContainer);
        titleContainer.appendChild(title);

        // Container for minimap
        let svgContainer = document.createElement('div');
        svgContainer.classList.add("svgContainer");
        fileContainer.appendChild(svgContainer);

        // // Calculate # of svgs for this file
        // let totalHeightForFile = linesOfCode * PIXELS_PER_LINE;
        // let numberOfSvgs = Math.ceil(totalHeightForFile  / AVAILABLE_SVG_HEIGHT);

        // // For each svg, set its width, height, y offset, and append elements
        // for (let i = 0; i < numberOfSvgs; i++) {
        //     let div = document.createElement('div');
        //     let svg = document.createElement('svg');
        //     let text = document.createElement('text');

        //     svg.setAttribute("width", SVG_WIDTH);
        //     let svgHeight =  (i < numberOfSvgs - 1) ? SVG_MAX_HEIGHT : 
        //                     (totalHeightForFile % AVAILABLE_SVG_HEIGHT) + (Y_PADDING * 2);
        //     svg.setAttribute("height", svgHeight);
        //     text.setAttribute('y', Y_PADDING);

        //     svgContainer.appendChild(div);
        //     div.appendChild(svg);
        //     svg.appendChild(text);

        //     // Find the number of lines for the current svg
        //     let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? LINES_PER_SVG :
        //                         (linesOfCode % LINES_PER_SVG);

        //     // For each line of current svg, create a tspan element, add attributes, set text, and append
        //     for (let j = 0; j < maxLinesInCurrentSvg; j++) {
        //         let tspan = document.createElement('tspan');

        //         let dy = (j == 0) ? 0: PIXELS_PER_LINE;
        //         tspan.setAttribute('x', X_PADDING);
        //         tspan.setAttribute('dy', dy);
        //         tspan.innerHTML = txtLineByLine[(LINES_PER_SVG * i) + j];

        //         text.appendChild(tspan);
        //     }
        // }

        // TODO: delete after
        // Calculate # of svgs for this file
        let totalHeightForFile = linesOfCode * PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / AVAILABLE_SVG_HEIGHT);
        // let numberOfSvgs = 1;

        // For each svg, set its width, height, y offset, and append elements
        // for (let i = 0; i < numberOfSvgs; i++) {
        let div = document.createElement('div');
        let svg = document.createElement('svg');
        // let text = document.createElement('text');

        svg.setAttribute("width", SVG_WIDTH * numberOfSvgs);
            // let svgHeight =  (i < numberOfSvgs - 1) ? SVG_MAX_HEIGHT : 
            //                 (totalHeightForFile % AVAILABLE_SVG_HEIGHT) + (Y_PADDING * 2);
        svg.setAttribute("height", SVG_MAX_HEIGHT);
        // text.setAttribute('y', Y_PADDING);

        svgContainer.appendChild(div);
        div.appendChild(svg);
        // svg.appendChild(text);

        for (let i = 0; i < numberOfSvgs; i++) {
            // let g = document.createElement('g');
            let text = document.createElement('text');
            text.setAttribute('x', X_PADDING + (SVG_WIDTH * i));
            text.setAttribute('y', Y_PADDING);

            // Find the number of lines for the current svg
            let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? LINES_PER_SVG :
                                (linesOfCode % LINES_PER_SVG);

            // let dx = i * SVG_WIDTH;
            // let y = Y_PADDING;

            // For each line of current svg, create a tspan element, add attributes, set text, and append
            for (let j = 0; j < maxLinesInCurrentSvg; j++) {
                let tspan = document.createElement('tspan');

                let dy = (j == 0) ? 0: PIXELS_PER_LINE;
                // tspan.setAttribute('x', X_PADDING);
                // tspan.setAttribute('dx', dx);
                tspan.setAttribute('dy', dy);
                tspan.innerHTML = txtLineByLine[(LINES_PER_SVG * i) + j];

                text.appendChild(tspan);
            }
            svg.appendChild(text);
        }

        // Set font size on text element
        d3.selectAll('.svgContainer')
            .selectAll('div')
            .select('svg')
            .selectAll('text')
            .style('font-size', FONT_SIZE.toString() + "px");
    }

    generateMinimapCanvas(txtLineByLine, fileIndex) {
        const X_PADDING = 10;        // Left padding for each tspan
        const Y_PADDING = 10;        // Top and Bottom padding for each text

        const canvasWidth = 200;
        const canvasHeight = 24000;
        let totalCanvasHeight = txtLineByLine.length * 6;
        let numCanvases = Math.ceil(totalCanvasHeight / (canvasHeight - (Y_PADDING * 2)));

        console.log("Num canvases = " + numCanvases);

        // Calculate height
        // const canvasHeight = (txtLineByLine.length * 6) + (Y_PADDING * 2);
        // console.log("canvas height = " + canvasHeight);

        let canvasHorizontalScrollView = document.querySelector('#canvasHorizontalScrollView > div:nth-of-type(1)');

        let linesPerCanvas = Math.floor((canvasHeight - (Y_PADDING * 2)) / 6);

        for (let i = 0; i < numCanvases; i++) {
            let canvas = document.createElement('canvas');
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);
            canvas.style.border = "1px dashed #000000";
    
            let ctx = canvas.getContext('2d'); 
            ctx.font = "6px Arial";

            let linesForCurrentCanvas = (i < numCanvases - 1) ? linesPerCanvas :
                (txtLineByLine.length % linesPerCanvas);

            for (let j = 0; j < linesForCurrentCanvas; j++) {
                ctx.fillText(txtLineByLine[(linesPerCanvas * i) + j], 
                            // X_PADDING + (canvasWidth * i), 
                            X_PADDING,
                            Y_PADDING + (6 * j));
            }
            canvasHorizontalScrollView.appendChild(canvas);
        }

        // canvasHorizontalScrollView.appendChild(canvas);
    }

    /**
     * Update the state with the selected file container. Remove previous 
     * selectedContainer classes and add the class to selected file container.
     * @param {number} index The index of the file container that was clicked
     */
    updateSelection(index) {
        console.log("Updating selected file container at index " + index);

        this.setState((state) => ({
            selectionIndex: index
        }));

        let fileContainers = document.getElementsByClassName('fileContainer');
        for (let i = 0; i < fileContainers.length; i++) {
            fileContainers[i].classList.remove('selectedContainer');
        }
        fileContainers[index].classList.add('selectedContainer');

        this.generateDisplay(index);
    }

    /**
     * Generates the display for whichever file was clicked. This function is
     * called from updateSelection() when a click event on a file container occurs.
     * @param {number} index The index of the file container that was clicked.
     */
    generateDisplay(index) {
        console.log("Generating the display for file container at index " + index);

        // Grab contents 
        let obj = this.state.allFiles[index];
        let content = obj.contents;

        const TABLE_BODY_WIDTH = 800;

        // Clear everything in scroll view
        d3.select("#displayScrollView").selectAll("*").remove();

        let table = d3.select("#displayScrollView")
            .append("table");
        let tablebody = table
            .attr('width', TABLE_BODY_WIDTH)
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
            .style('font-size', "12px");
        rows.append("td")
            .data(content)
            .text(d => d)
            .attr("style","white-space:pre")
            .style('font-size', "12px");
        
        // Add padding to view
        d3.select("#displayScrollView")
            .style("padding", "24px");  
    }

    // TODO: Delete later
    benchmarkMinimapSvg() {
        console.log("benchmarkMinimapSvg()");

        let timer1 = new Timer();
        timer1.start();
        // console.log("Start time = " + timer1.getStartTime());

        for (let i = 0; i < this.state.allFiles.length; i++) {
            let obj = this.state.allFiles[i];
            let txtLineByLine = obj.contents;
            this.generateMinimap(txtLineByLine, i);
        }
        timer1.end();

        let timeDiff = timer1.getTimeDiff();
        console.log("Time diff svg = " + timeDiff);

        this.setState((state) => ({
            timeDiffSvg: timeDiff
        }));
    }

    benchmarkMinimapCanvas() {
        console.log("benchmarkMinimapCanvas()");

        let timer2 = new Timer();
        timer2.start();

        for (let i = 0; i < this.state.allFiles.length; i++) {
            let obj = this.state.allFiles[i];
            let txtLineByLine = obj.contents;
            // this.generateMinimap(txtLineByLine, i);
            this.generateMinimapCanvas(txtLineByLine, i);
        }
        timer2.end();

        let timeDiff = timer2.getTimeDiff();
        console.log("Time diff svg = " + timeDiff);

        this.setState((state) => ({
            timeDiffCanvas: timeDiff
        }));
    }


    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
        return (
            <div className="analyze">
                <div className="benchmark">
                    <button onClick={this.benchmarkMinimapSvg}>Generate minimap with Svg</button>
                    <p>Completed in: {this.state.timeDiffSvg} ms</p>
                </div>
                <div id="horizontalScrollView"></div> 

                <div className="benchmark">
                    <button onClick={this.benchmarkMinimapCanvas}>Generate minimap with Canvas</button>
                    <p>Completed in: {this.state.timeDiffCanvas} ms</p>
                </div>
                <div id="canvasHorizontalScrollView">
                    <div></div>
                </div>

                <div id="displayScrollView"></div>

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