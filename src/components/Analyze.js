import React, { Component } from 'react';

import * as d3 from 'd3';
// import * as fs from fs;

import "../css/Analyze.css";
import { text } from 'd3';

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
            selectionIndex: -1
        };

        this.loadAllFiles = this.loadAllFiles.bind(this);
        // this.requestFile = this.requestFile.bind(this);
        this.generateFileContainers = this.generateFileContainers.bind(this);
        this.generateMinimap = this.generateMinimap.bind(this);
        this.generateDisplay = this.generateDisplay.bind(this);
        this.updateSelection = this.updateSelection.bind(this);
    } 

    componentDidMount() {
        this.loadAllFiles();
    }

    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */

    loadAllFiles() {
        console.log("loadAllFiles()");
        let files = [
            // 'https://mdn.github.io/learning-area/javascript/oojs/json/superheroes.json';
            process.env.PUBLIC_URL + "/tests/hello-world.txt",
            // process.env.PUBLIC_URL + "/tests/Botm2.java",
            process.env.PUBLIC_URL + "/tests/pride-and-prejudice.txt"
        ];

        this.generateFileContainers(files.length);

        let promisesArr = new Array(files.length);

        for (let i = 0; i < files.length; i++) {
            // let f = files[i];
            // this.requestFile(f, i);
            let promise = this.makeRequest(files[i]);
            promisesArr[i] = promise;
        }

        Promise.all(promisesArr).then((values) => {
            for (let i = 0; i < values.length; i++) {
                console.log(values[i]);
                this.processResponse(values[i], i);
            }

            console.log("Done");
        });
    }

    makeRequest(url, method) {
        // Create the XHR request
        var request = new XMLHttpRequest();
    
        // Return it as a Promise
        return new Promise(function (resolve, reject) {
    
            // Setup our listener to process compeleted requests
            request.onreadystatechange = function () {
    
                // Only run if the request is complete
                if (request.readyState !== 4) return;
    
                // Process the response
                if (request.status >= 200 && request.status < 300) {
                    // If successful
                    resolve(request);
                } else {
                    // If failed
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
    
            };
    
            // Setup our HTTP request
            request.open(method || 'GET', url, true);
            request.responseType = 'text';
    
            // Send the request
            request.send();
        });
    };

    processResponse(request, index) {
        const txt = request.response;
        let txtLineByLine = txt.split("\n");
        console.log(txt);
        console.log(txtLineByLine);

        // For each element in array that is empty, replace with newline
        txtLineByLine = txtLineByLine.map((l) => {
            if (l.length === 0) {
                return "\n";
            } else {
                return l;
            }
        });

        let obj = {
            name: request.responseURL,
            contents: txtLineByLine
        }
        
        this.setState((state) => ({
            allFiles: state.allFiles.concat(obj)
        }));

        this.generateMinimap(txtLineByLine, index);
    }

    generateFileContainers(numberOfFiles) {
        // Scrollview handle
        let horizontalView = document.getElementById("horizontalScrollView");

        for (let i = 0; i < numberOfFiles; i++) {
            // File container holds title- and svg containers
            let fileContainer = document.createElement('div');
            fileContainer.classList.add('fileContainer');
            horizontalView.appendChild(fileContainer);
        }
    }

    generateMinimap(txtLineByLine, fileIndex) {

        // this.setState({
        //     currentText: {
        //         name: "hello-world.txt",
        //         content: txtLineByLine
        //     }
        // });

        // this.generateDisplay(txt);
        // this.generateMinimap(txt);

        // Constants
        const linesOfCode = txtLineByLine.length;
        const FONT_SIZE = 2;         // Font size for svg text
        const X_PADDING = 10;        // Left padding for each tspan
        const Y_PADDING = 10;        // Top and Bottom padding for each text
        const Y_TEXT_PADDING = 2;      // Top padding for each tspan

        const SVG_MAX_HEIGHT = 400;   // Height for each svg
        const AVAILABLE_SVG_HEIGHT = SVG_MAX_HEIGHT - (Y_PADDING * 2);   // Space for text and padding
        const PIXELS_PER_LINE = FONT_SIZE + Y_TEXT_PADDING;              // # of pixels making up 1 line
        const LINES_PER_SVG = Math.floor(AVAILABLE_SVG_HEIGHT / PIXELS_PER_LINE);

        // Scrollview handle
        // let horizontalView = document.getElementById("horizontalScrollView");

        // // File container holds title- and svg containers
        // let fileContainer = document.createElement('div');
        // fileContainer.classList.add('fileContainer');
        // horizontalView.appendChild(fileContainer);

        // File container handle
        let fileContainer = document.getElementsByClassName('fileContainer')[fileIndex];

        // Add onclick event
        fileContainer.addEventListener('click', (e) => this.generateDisplay(fileIndex, e));

        // Title container and title of file
        let titleContainer = document.createElement('div');
        let title = document.createElement('p');


        console.log("FILEINDEX: " + fileIndex);


        title.innerHTML = this.state.allFiles[fileIndex].name;

        fileContainer.appendChild(titleContainer);
        titleContainer.appendChild(title);

        // Svg container
        let svgContainer = document.createElement('div');
        svgContainer.classList.add("svgContainer");
        fileContainer.appendChild(svgContainer);

        // Calculate # of svgs
        let totalHeightForFile = linesOfCode * PIXELS_PER_LINE;
        let numberOfSvgs = Math.ceil(totalHeightForFile  / AVAILABLE_SVG_HEIGHT);

        // For each svg, set its width, height, y offset, and append elements
        for (let i = 0; i < numberOfSvgs; i++) {
            let div = document.createElement('div');
            let svg = document.createElement('svg');
            let text = document.createElement('text');

            svg.setAttribute("width", 96);
            let svgHeight =  (i < numberOfSvgs - 1) ? SVG_MAX_HEIGHT : 
                            (totalHeightForFile % AVAILABLE_SVG_HEIGHT) + (Y_PADDING * 2);
            svg.setAttribute("height", svgHeight);
            text.setAttribute('y', Y_PADDING);

            svgContainer.appendChild(div);
            div.appendChild(svg);
            svg.appendChild(text);

            // Find the number of lines for the current svg
            let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? LINES_PER_SVG :
                                (linesOfCode % LINES_PER_SVG);

            // For each set of lines for each svg, create a tspan element, add
            // attributes, set text, and append
            for (let j = 0; j < maxLinesInCurrentSvg; j++) {
                let tspan = document.createElement('tspan');

                let dy = (j == 0) ? 0: PIXELS_PER_LINE;
                tspan.setAttribute('x', X_PADDING);
                tspan.setAttribute('dy', dy);
                tspan.innerHTML = txtLineByLine[(LINES_PER_SVG * i) + j];

                text.appendChild(tspan);
            }
        }

        // Set font size on text element
        d3.selectAll('.svgContainer')
            .selectAll('div')
            .select('svg')
            .select('text')
            .style('font-size', FONT_SIZE.toString() + "px");
    }

    generateDisplay(i) {
        console.log("generateDisplay() - " + i);

        // Update selection
        this.updateSelection(i);

        let obj = this.state.allFiles[i];
        let content = obj.contents;

        console.log(obj);
        console.log(content);

        let width = 960 - 130; // width - minimap width
        let height = 2000;

        d3.select("#displayScrollView").selectAll("*").remove();

        let table = d3.select("#displayScrollView")
            // .attr('width', width)
            // .attr('height', height)
            .append("table");
        let tablebody = table
            .attr('width', width)
            // .attr('height', height)
            .append("tbody");
        let rows = tablebody
            .selectAll("tr")
            .data(content)
            .enter()
            .append("tr");

        rows.append("td")
            .data(content)
            .text((_, i) => i + 1)
            .style('font-size', "12px");
        rows.append("td")
            .data(content)
            .text(d => d)
            .attr("style","white-space:pre")
            .style('font-size', "12px");
        
        d3.select("#displayScrollView")
            .style("padding", "24px");

        // tablebody
        //     .selectAll("tr")
        //     .filter(function (_, i) { 
        //         return txt.errors.includes(i);
        //     })
        //     .select("td:nth-of-type(2)")
        //     .classed('error', true);

        // tablebody
        //     .selectAll("tr")
        //     .filter(function (_, i) { 
        //         return txt.warnings.includes(i);
        //     })
        //     .select("td:nth-of-type(2)")
        //     .classed('warning', true);        
    }

    updateSelection(index) {
        console.log("updateSelection() - " + index);

        this.setState((state) => ({
            selectionIndex: index
        }));

        let fileContainers = document.getElementsByClassName('fileContainer');
        for (let i = 0; i < fileContainers.length; i++) {
            fileContainers[i].classList.remove('selectedContainer');
        }

        fileContainers[index].classList.add('selectedContainer');

        this.generateSlider(index);
    }

    generateSlider(index) {
        console.log("generateSlider() - " + index);

        let width = 96;
        let scrollHeight = 400;

        let svg0 = d3.selectAll('.fileContainer')
            .filter((_, i) => {return i === index})
            .selectAll('.svgContainer')
            .filter((_, i) => {return i === 0})
            .append('svg');

        let slider = svg0.append('rect')
            .attr('class', 'slider-rect')
            .attr('width', width)
            .attr('height', scrollHeight);
    }

    // generateMinimap() {
    //     let scrollContainer = document.getElementsByClassName('fileScrollContainer')[0];
    //     let width = 960 - 130; // width - minimap width
    //     let height = 2000;
    //     let scrollHeight = 500;
    //     let minimapK = 6;
    //     let root;
    
    //     let drag = d3.drag()
    //         .on('start drag', function() { 
    //             scrollContainer.scrollTop = d3.event.y * minimapK - scrollHeight / 2;
    //         });
        
    //     let fileToDisplay = d3.select(scrollContainer)
    //         .on('scroll', function(d) {
    //             slider.attr('y', this.scrollTop);
    //         })
    //         // .on('scroll', function(d) {
    //         //     slider.attr('y', this.scrollTop);
    //         // })
    //         // .select('svg')
    //         // .attr('viewBox', [0, 0, width, height].join(' '))
    //         // .attr('width', width)
    //         // .attr('height', height);
        
    //     // svg0.append('g').attr('transform', 'translate(40,0)');
        
    //     let svg1 = d3.select('#minimap > svg')
    //         .attr('viewBox', [0, 0, width, height].join(' '))
    //         .attr('preserveAspectRatio', 'xMidYMid meet')
    //         .attr('width', width / minimapK)
    //         .attr('height', height / minimapK)
    //         .call(drag);
        
    //     svg1.append('g').attr('transform', 'translate(40,0)');
        
    //     let slider = svg1.append('rect')
    //         .attr('class', 'slider-rect')
    //         .attr('width', width)
    //         .attr('height', scrollHeight);
    // }

    /** =======================================================================
     * 
     * RENDER
     * 
     ======================================================================= */
     render() {
        return (
            <div className="analyze">
                 <div id="horizontalScrollView"></div> 

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

                <div id="displayScrollView"></div>
            </div>
        );
     }
}

export default Analyze;