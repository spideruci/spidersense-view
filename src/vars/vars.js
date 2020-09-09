/** =======================================================================
 * SpiderSense-worker Urls
 ======================================================================= */
const spidersenseWorkerUrls = {
    getAllProjects: "http://127.0.01:5000/getAllProjects ",
    getProject: "http://127.0.0.1:5000/getProject/",            // Param: <projectId>
    getCommits: "http://127.0.0.1:5000/getCommits/",            // Param: <projectId> 
    getSourceInfo: "http://127.0.0.1:5000/getSourceInfo/",      // Param: <commitId>
    getAllTestcases: "http://127.0.01:5000/getAllTestcases",    // Param: <commitId>
    testcaseCoverage: "http://127.0.0.1:5000/testcaseCoverage", // Param: <testcaseId>
    commitCoverage: "http://127.0.0.1:5000/commitCoverage/"     // Param: <testcaseId>
};
export {spidersenseWorkerUrls};

/** =======================================================================
 * ChooseProject Component
 ======================================================================= */
const chooseProjectPageDetails = {
    title: "Choose a project",
    intro: "Please visit the home page to view and select a project. After selecting one, project analytics will be available, including:",
    introList: [
        "Project details",
        "Recent commits",
        "List of tests",
        "Fault localization via visual mapping",
        "Computed suspiciousness scores of covered statements"
    ],
    actionButtonText: "Select Project"
};
export {chooseProjectPageDetails};

/** =======================================================================
 * About Component
 ======================================================================= */
const aboutPageDetails = {
    title: "Welcome to SpiderSense",
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    titleMembers: "Meet the Team",
    members: [
        {
            name: "Jim A. Jones",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Kaj Dreef",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Dongxin Xiang",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Ashutosh Kumar Singh",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            name: "Thuc Nguyen",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
    ]
};
export {aboutPageDetails};