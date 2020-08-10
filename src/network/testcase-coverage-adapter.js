import FileNameParser from '../util/file-name-parser';

class TestcaseCoverageAdapter {

    constructor(id) {
        this.testCaseId = id;
        this.coverageMap = new Map();
    }

    getTestCaseId() {
        return this.testCaseId;
    }

    getCoverageMap() {
        return this.coverageMap;
    }

    /**
     * Expected json:
     * testcases: [
     *      {
     *          signature: string,
     *          sourceName: string
     *          coverage: [
     *              {
     *                  line: {
     *                      lineId: number,
     *                      lineNumber: number,
     *                      sourceName: string
     *                  }
     *              },
     *              ...
     *          ]
     *      },
     *      ...
     * ]
     * @return {Map} A Map (key = name of the source file, value = line numbers)
     */
    getLineCoverageByFile(response) {
        let parser = new FileNameParser();
        let newCoverageMap = new Map();

        if (response.testcases == null) {
            console.error("testcases came back as null");
            return;
        }
        if (response.testcases[0] == null) {
            console.error("testases array came back as null");
            return;
        }
        if (response.testcases[0].coverage == null) {
            console.error("coverage came back as null");
            return;
        }

        let testCase = response.testcases[0];
        let coverageArr = testCase.coverage;
        
        for (let c of coverageArr) {
            let l = c.line;
            let lineNumber = l.lineNumber;
            let srcName = parser.extractFileNameByDot(l.sourceName);
            if (newCoverageMap.has(srcName)) {
                let prevLines = newCoverageMap.get(srcName);
                newCoverageMap.set(srcName, prevLines.concat(lineNumber));
            } else {
                newCoverageMap.set(srcName, [lineNumber]);
            }
        }
        this.coverageMap = newCoverageMap;
        // return coverageMap;
    }
}
export default TestcaseCoverageAdapter;