import * as constants from './constants'
import { spidersenseWorkerUrls } from '../../../vars/vars'
import { extractSourceNameFromRawGithubUrl, extractFileNameFromSourceName} from '../../../util/file-name-parser';
import { fromJS } from 'immutable'

export const resetComponent = () => ({
    type: constants.RESET_COMPONENT
})

export const updateSelectedCommit = (commitId) => ({
    type: constants.SET_COMMIT,
    data: commitId
})

export const updateRequestingCoverage = (isRequesting) =>({
    type: constants.SET_REQUESTING_COVERAGE,
    data: isRequesting
})

export const updateRequestingFromWorker = (isRequesting) => ({
    type: constants.SET_REQUESTING_FROM_WORKER,
    data: isRequesting
})

export const updateButtonGroupDisabled = (disabled) => ({
    type: constants.SET_BUTTON_GROUP_DISABLED,
    data: disabled
})

export const updateAllFiles = (files) => ({
    type: constants.SET_ALL_FILES,
    data: fromJS(files)
})

export const updateSelectionIndex = (index) => ({
    type: constants.SET_SELECTION_INDEX,
    data: index
})

export const updateNumberOfSvgs = (number) => ({
    type: constants.SET_NUMBER_OF_SVGS,
    data: number
})

export const updateMinimapMaxHeights = (heights) => ({
    type: constants.SET_MINIMAP_MAX_HEIGHTS,
    data: fromJS(heights)
})

export const updateScrollContainerHeight = (height) => ({
    type: constants.SET_SCROLL_CONTAINER_HEIGHT,
    data: height
})

export const updateTotalBatches = (num) => ({
    type: constants.SET_TOTAL_BATCHES,
    data: num
})

export const updateRetrievedBatches = (num) => ({
    type: constants.SET_RETRIEVED_BATCHES,
    data: num
})

export const updateTestCases = (testcases) => ({
    type: constants.SET_TEST_CASES,
    data: fromJS(testcases)
})

export const updateSuspiciousness = (sus) => ({
    type: constants.SET_SUSPICIOUSNESS,
    data: fromJS(sus)
})

export const updateViewScoresDisabled = (disabled) => ({
    type: constants.SET_VIEW_SCORES_DISABLED,
    data: disabled
})

export const updateDialogOpened = (isOpened) => ({
    type: constants.SET_DIALOG_OPENED,
    data: isOpened
})

export const updateSuspDialogOpened = (isOpened) => ({
    type: constants.SET_SUSP_DIALOG_OPENED,
    data: isOpened
})

export const updateCoverableIndex = (index) => ({
    type: constants.SET_COVERABLE_INDEX,
    data: index
})

export const updateAllFormatedTestsMap = (testsMap) => ({
    type: constants.SET_ALL_FORMATED_TESTS_MAP,
    data: fromJS(testsMap)
})

// /**
//  * Request from spidersense-worker the raw links to the source files on
//  * Github given the commit id. On response, pass the source links to
//  * download the contents.
//  * 
//  * The urls have been built on the server side using these factors:
//  * - <base_url>/<github_user>/<repository_name>/<path_to_file>
//  * @param {string} sha The commit id
//  */
// export const initCommit = (commitId, d3) => {
//     let url = `${spidersenseWorkerUrls.getSourceInfo}${commitId}`;
//     return (dispatch) => {
//         fetch(url, {
//             method: 'GET'
//         }).then((response) => {
//             return response.json();
//         }).then((data) => {            
//             console.log("Callback:\n" + JSON.stringify(data.sourceLinks));
//             downloadContentsFromGithub(dispatch, d3, data.sourceLinks);
//         }).catch((error) => {
//             console.error(error);
//             dispatch(updateRequestingFromWorker(false))
//         });
//     }
// }


// /**
//  * Request from Github the source files given the links to those
//  * files. On response, generate file containers, then generate 
//  * the minimaps for each file, and finally request the test cases.
//  * @param {array} sourceLinks The urls to the source files
//  */
// function downloadContentsFromGithub(dispatch, d3, sourceLinks) {
//     // Get names of source links and links in different arrays
//     let names = sourceLinks.map((u) => {
//         return extractSourceNameFromRawGithubUrl(u);
//     })
//     let urls = sourceLinks;

//     // Make the request for all files
//     Promise.all(urls.map((req) => {
//         return fetch(req).then((response) => {
//             return response.text();
//         })
//         .then((data) => {
//             return data;
//         });
//     })).then((fileTexts) => {
//         // Generate file container
//         const numberOfFileContainers = fileTexts.length;
//         generateFileContainers(d3, numberOfFileContainers);

//         let allFiles = new Array(numberOfFileContainers);

//         for (let i = 0; i < fileTexts.length; i++) {
//             // console.log(`File text: ${fileTexts[i]}`);

//             // Get text and split by newline, for each empty element, replace with newline
//             let text = fileTexts[i];
//             let textArray = text.split("\n");
//             textArray = textArray.map((l) => {
//                 return (l.length === 0) ? "\n" : l;
//             });

//             // Create object to add as element to allFiles array
//             let o = {
//                 name: names[i],
//                 contents: textArray
//             }
//             allFiles[i] = o;

//             // Generate minimap(s) for the current file
//             this.generateMinimap(extractFileNameFromSourceName(names[i]), textArray, i);
//         }

//         // Update state so that allFiles contains the text of each file retrieved
//         this.setState((state) => ({
//             allFiles: allFiles
//         }));

//         // Make request to get test coverage
//         this.requestTestcases();
//     }).catch((error) => {
//         console.error(error);
//         this.setState((state) => ({
//             isRequestingFromWorker: false
//         }));
//     });
// }

// /**
//  * Creates a container for each file requested. The file containers will hold
//  * additional wrappers for the file name and each svg element of the file. 
//  * Add click listener to file containers to update the selection.
//  * @param {number} numFiles The number of files
//  */
// function generateFileContainers(d3, numFiles) {
//     let horizontalScollViewD3 = d3.select("#horizontalScrollView")
//         .style("width", this.TABLE_BODY_WIDTH + "px")
//         .style("overflow-x", "scroll");
    
//     for (let i = 0; i < numFiles; i++) {
//         horizontalScollViewD3.append("div")
//             .classed('fileContainer', true)
//             .on('click', (e) => {
//                 updateSelection(i, d3, e);
//             });
//     }
// }

// /**
//  * Generates the minimap(s) for each file that was requested.
//  * Calculates how many maps should be added, the height for each map, and
//  * the tspan elements that should be embedded for each svg element.
//  * @param   {string}    fileName        The name of the current file
//  * @param   {number}    txtLineByLine   The lines of the file as an array
//  * @param   {number}    fileIndex       The index of the current file
//  */
// function generateMinimap(fileName, txtLineByLine, fileIndex) {
//     // Calculate variables
//     const linesOfCode = txtLineByLine.length;
//     let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
//     let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);
//     // console.log("\tLOC: " + linesOfCode 
//     //     + "\n\tAvailable svg height:" + this.SVG_MAX_HEIGHT 
//     //     + "\n\tPixels per line: " + this.PIXELS_PER_LINE
//     //     + "\n\tLines per svg: " + this.LINES_PER_SVG
//     //     + "\n\tTotal height for file: " + totalHeightForFile 
//     //     + "\n\tNumber of svgs: " + numberOfSvgs);

//     // Get handle on file container at index
//     let fileContainer = d3.selectAll('.fileContainer')
//         .filter(function(d, i) {return i === fileIndex})

//     // Set title for file container
//     let titleContainer = fileContainer.append('div');
//     titleContainer.append('p')
//         .text(fileName);

//     // Append a div that will act as the container for svg elements
//     let svgContainerD3 = fileContainer.append('div')
//         .classed('svgContainer', true);

//     // For each svg...
//     for (let i = 0; i < numberOfSvgs; i++) {
//         // Set width, height, y offset, and append elements
//         let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
//                     (totalHeightForFile % this.SVG_MAX_HEIGHT);

//         let divI = svgContainerD3.append("div");
//         let svgI = divI.append("svg")
//             .attr("width", this.SVG_WIDTH + "px")
//             .attr("height", svgHeight);
//         let textI = svgI.append("text")
//             .attr("x", 0)
//             .attr("y", 0)
//             .style('font-size', this.FONT_SIZE.toString() + "px");;

//         // Find the number of lines for the current svg
//         let maxLinesInCurrentSvg = (i < numberOfSvgs - 1) ? this.LINES_PER_SVG :
//                             (linesOfCode % this.LINES_PER_SVG);

//         // console.log("svg #" + i + "\nsvg height: " + svgHeight 
//         //     + "\nMax lines current svg: " + maxLinesInCurrentSvg + "\n\n");

//         // For each line of current svg, create a tspan element, add attributes, set text, and append
//         for (let j = 0; j < maxLinesInCurrentSvg; j++) {
//             textI.append("tspan")
//                 .attr("x", 0)
//                 .attr("y", (this.PIXELS_PER_LINE * j))
//                 .text(txtLineByLine[(this.LINES_PER_SVG * i) + j]);
//         }
//     }
// }

// /**
//  * Update the state with the selected file container, the number of svgs for
//  * the current selected file, and the minimapMaxHeights for current file.
//  * Change background color of selected file container. Generate the display, 
//  * the slider, the coverage on display container if available, and 
//  * enable/disable view scores button.
//  * @param {number} index The index of the file container that was clicked
//  */
// function updateSelection(index, d3) {
//     if (this.state.selectionIndex === index) {
//         return;
//     }

//     // Calculate variables
//     const linesOfCode = this.state.allFiles[index].contents.length;
//     let totalHeightForFile = linesOfCode * this.PIXELS_PER_LINE;
//     let numberOfSvgs = Math.ceil(totalHeightForFile  / this.SVG_MAX_HEIGHT);

//     let minimapMaxHeights = [];
//     for (let i = 0; i < numberOfSvgs; i++) {
//         let svgHeight =  (i < numberOfSvgs - 1) ? this.SVG_MAX_HEIGHT : 
//                     (totalHeightForFile % this.SVG_MAX_HEIGHT);
//         minimapMaxHeights.push(svgHeight);
//     }

//     // Update state
//     this.setState((state) => ({
//         selectionIndex: index,
//         numberOfSvgs: numberOfSvgs,
//         minimapMaxHeights: minimapMaxHeights
//     }));

//     // Change background color of file container
//     let fileContainers = d3.selectAll(".fileContainer")
//         .classed("fileContainerSelected", false);
//     fileContainers.filter(function(d, i) {
//             return i === index;
//         }).classed("fileContainerSelected", true);

//     // Generate display
//     this.generateDisplay(index);

//     // Generate slider
//     this.generateSlider(index);

//     // Display coverage on display container if it is available
//     this.displayCoverageOnDisplay();

//     // Enable or disable viewScores button
//     this.setViewScoresDisabled();
// }
