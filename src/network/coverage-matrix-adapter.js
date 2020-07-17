import FileNameParser from '../util/file-name-parser';

class CoverageMatrixAdapter {
    constructor(jsonObject) {
        this.response = jsonObject;
    }

    // Methods
    filterSourcesByActivatingTest(testNumber) {
        let activatedSources = [];
        for (let src of this.response.sources) {
            if (src.activatingTests.includes(testNumber)) {
                activatedSources.push(src);
            }
        }

        return activatedSources;
    }

    findSourceByName(name) {
        let parser = new FileNameParser();

        for (let src of this.response.sources) {
            if (parser.extractFileName(src.source.fullName) === parser.extractFileName(name)) {
                return src;
            }
        }
        return null;
    }

    // Getters
    getFullName(index) {
        return this.getSource(index).source.fullName;
    }

    getFirstLine(index) {
        return this.getSource(index).source.firstLine;
    }

    getLastLine(index) {
        return this.getSource(index).source.lastLine;
    }

    getSource(index) {
        return this.response.sources[index];
    }

    getActivatingTests(index) {
        return this.getSource(index).activatingTests;
    }

    getTestStmtMatrix(index) {
        return this.getSource(index).testStmtMatrix;
    }

    getCoverableLines(index) {
        return this.getSource(index).coverableLines;
    }
}

export default CoverageMatrixAdapter;