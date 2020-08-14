const spidersenseWorkerUrls = {
    getAllProjects: "http://127.0.01:5000/getAllProjects ",
    getCommits: "http://127.0.0.1:5000/getCommits/",            // Param: <projectId> 
    getSourceInfo: "http://127.0.0.1:5000/getSourceInfo/",      // Param: <commitId>
    getAllTestcases: "http://127.0.01:5000/getAllTestcases",    // Param: <commitId>
    commitCoverage: "http://127.0.0.1:5000/commitCoverage/",    // Param: <commitId> + <testcaseId>
    testcaseCoverage: "http://127.0.0.1:5000/testcaseCoverage"  // Param: <testcaseId>
};
export {spidersenseWorkerUrls};