import FileNameParser from '../util/file-name-parser';

class TestcaseCoverageAdapter {

    constructor(id, jsonObject) {
        this.testCaseId = id;
        this.response = jsonObject;
    }

    getTestCaseId() {
        return this.testCaseId;
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
    getLineCoverageByFile() {
        let parser = new FileNameParser();

        let testCase = this.response.testcases[0];
        let coverageArr = testCase.coverage;
        
        let coverageMap = new Map();
        for (let c of coverageArr) {
            let l = c.line;
            let lineNumber = l.lineNumber;
            let srcName = parser.extractFileNameByDot(l.sourceName);
            if (coverageMap.has(srcName)) {
                let prevLines = coverageMap.get(srcName);
                coverageMap.set(srcName, prevLines.concat(lineNumber));
            } else {
                coverageMap.set(srcName, [lineNumber]);
            }
        }
        return coverageMap;
    }
}
export default TestcaseCoverageAdapter;