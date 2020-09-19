class SuspiciousnessV2 {
    constructor() {
    }

    /**
     * Expected input:
     * [
     *     {
     *         testcases: [
     *             {
     *                 signature: string,
     *                 sourceName: string,
     *                 passed: number(1|0),
     *                 coverage: [
     *                     {
     *                         line: {
     *                             lineId: string,
     *                             lineNumber: number,
     *                             sourceName: string
     *                         }
     *                     }, ...
     *                 ]
     *             }
     *         ]
     *     }, ...
     * ]
     * @param {Array} input A list of testcase response objects
     * @param {Array} fileNames A list of filenames
     */
    computeSuspiciousness(input, fileNames) {
        let passedTestcases = input.filter((tc) => {
            return tc.testcases[0].passed === 1;
        });
        let failedTestcases = input.filter((tc) => {
            return tc.testcases[0].passed === 0;
        });
        let numberOfTestcasesPassed = passedTestcases.length;
        let numberOfTestcasesFailed = failedTestcases.length;
        
        let passedFileNames = {};
        for (let f of fileNames) {
            passedFileNames[f] = new Map();
        }

        let failedFileNames = {};
        for (let f of fileNames) {
            failedFileNames[f] = new Map();
        }

        this.countLineOccurrences(passedTestcases, passedFileNames);
        this.countLineOccurrences(failedTestcases, failedFileNames);

        this.calculateRatios(passedFileNames, numberOfTestcasesPassed);
        this.calculateRatios(failedFileNames, numberOfTestcasesFailed);

        let output = this.calculateScores(passedFileNames, failedFileNames, fileNames);

        // console.log("passedTestcases: " + JSON.stringify(passedTestcases) +
        // "\nfailedTestcases: " + failedTestcases +
        // "\nnumberOfTestcasesPassed: " + numberOfTestcasesPassed + 
        // "\nnumberOfTestcasesFailed: " + numberOfTestcasesFailed + 
        // "\npassedFileNames: " + JSON.stringify(passedFileNames) +
        // "\nfailedFileNames: " + JSON.stringify(failedFileNames));

        // for (let k of Object.keys(output)) {
        //     let map = output[k];
        //     console.log("**** File: " + k + " ****");
        //     for (let [key, val] of map.entries()) {
        //         console.log("Key: " + key + " Val: " + JSON.stringify(val));
        //     }
        // }

        return output;
    }

    /**
     * For each line object under the coverage array of a testcase, stores into
     * a map a count, where each key is a line number of a file, and each value
     * is how many times that line appears across the testcases passed in.
     * @param {Array} testcases A list of testcase objects
     * @param {Array} fileNames A list of string representing names of the files
     */
    countLineOccurrences(testcases, fileNames) {
        // For each (passing/failing) testcase,
        for (let i = 0; i < testcases.length; i++) {
            let testcaseObj = testcases[i].testcases[0];

            for (let c = 0; c < testcaseObj.coverage.length; c++) {
                let line = testcaseObj.coverage[c].line;

                // Pull out map from fileNames
                if (fileNames.hasOwnProperty(line.sourceName)) {
                    let map = fileNames[line.sourceName];

                    // Either increment if line number exists, or set to 1 otherwise
                    if (map.has(line.lineNumber)) {
                        let prev = map.get(line.lineNumber);
                        map.set(line.lineNumber, prev + 1);
                    } else {
                        map.set(line.lineNumber, 1);
                    }
                }
            }
        }
    }

    /**
     * Transforms each count in the map into a ratio: %p or %f
     * @param {Array} fileNames A list of string representing names of the files
     * @param {number} total The total number of testcases (passing or failing)
     */
    calculateRatios(fileNames, total) {
        for (let [k, v] of Object.entries(fileNames)) {
            let map = new Map();
            for (let [lineNumber, count] of v.entries()) {
                map.set(lineNumber, (count / total));
            }
            fileNames[k] = map;
        }
    }

    /**
     * Calculates suspiciousness scores and hues for each line for each file name passed in as
     * an array. The following forumla is used to calculate this score:
     * 
     *     score = %p / %p + %f
     * 
     * A score of 1 means least suspiciousness, 0 most suspicious. To make it more intuitive, we
     * subtract by 1.
     * 
     *     suspiciousness = 1 - score
     * @param {Array} passedFileNames A list where each key = filename, and each value = a map of ratios (%p)
     * @param {Array} failedFileNames A list where each key = filename, and each value = a map of ratios (%f)
     * @param {Array} fileNames A list of string representing names of the files
     * @return {Array} An list of objects containing the source and the lines (objects containing suspiciousness data)
     */
    calculateScores(passedFileNames, failedFileNames, fileNames) {
        const DEFAULT_HUE = 120;
        const DEFAULT_SATURATION = 100;
        const DEFAULT_LIGHTNESS = 50;

        // let output = {};
        let output = [];

        // Calculate suspiciousness for each line of each file
        for (let f of fileNames) {
            let finalMap = new Map();
            // Actually a list of objects
            // let finalMap = [];

            // Get map for both passed and failed
            let passedMap = passedFileNames[f];
            let failedMap = failedFileNames[f];

            for (let [lineNumber, percentP] of passedMap.entries()) {
                let percentF = (failedMap.has(lineNumber)) ? failedMap.get(lineNumber) : 0;

                // For lines in passedMap that don't have a matching lineNumber in the failedMap,
                // score would be calculated as %p / (%p + %f) = %p / (%p + 0) = 1
                let score = Math.round(percentP / (percentP + percentF));
                let suspiciousness = 1 - score;
                let hue = DEFAULT_HUE * score;
                let lightness = DEFAULT_LIGHTNESS * Math.max(percentF, percentP);

                finalMap.set(lineNumber, {
                    suspiciousness: suspiciousness,
                    pRatio: percentP,
                    fRatio: percentF,
                    hsl: `hsl(${hue}, ${DEFAULT_SATURATION}%, ${lightness}%)`,
                    linenumber: lineNumber
                });
            }

            for (let [lineNumber, percentF] of failedMap.entries()) {
                if (passedMap.has(lineNumber)) {
                    continue;
                }

                // For lines in failedMap that don't have a matching lineNumber in the passedMap,
                // score would be calculated as %p / (%p + %f) = 0 / (0 + %f) = 0
                let score = 0;
                let suspiciousness = 1 - score;
                let hue = DEFAULT_HUE * score;
                let lightness = DEFAULT_LIGHTNESS * percentF;

                finalMap.set(lineNumber, {
                    suspiciousness: suspiciousness,
                    pRatio: 0,
                    fRatio: percentF,
                    hsl: `hsl(${hue}, ${DEFAULT_SATURATION}%, ${lightness}%)`,
                    linenumber: lineNumber
                });
            }

            // Transform the final map
            let source = f;
            let lines = this.mapToListOfObjects(finalMap);

            // Push as an object to the output
            output.push({
                source: source,
                lines: lines
            });
        }
        return output;
    }

    mapToListOfObjects(map) {
        let lines = [];
        for (let [k, v] of map.entries()) {
            lines.push(v);
        }
        return lines;
    }
}
export default SuspiciousnessV2;