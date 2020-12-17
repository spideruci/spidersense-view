/** =======================================================================
 * SpiderSense-worker Urls
 ======================================================================= */
 // Uncomment to use the urls locally
 
 /*
const spidersenseWorkerUrls = {
    getAllProjects: "http://127.0.01:5000/getAllProjects ",
    getProject: "http://127.0.0.1:5000/getProject/",            // Param: <projectId>
    getCommits: "http://127.0.0.1:5000/getCommits/",            // Param: <projectId> 
    getSourceInfo: "http://127.0.0.1:5000/getSourceInfo/",      // Param: <commitId>
    getAllTestcases: "http://127.0.01:5000/getAllTestcases/",    // Param: <commitId>
    testcaseCoverage: "http://127.0.0.1:5000/testcaseCoverage/", // Param: <testcaseId>
    batchTestcaseCoverage: "http://127.0.0.1:5000/batchTestcaseCoverage", // Body: {tlist: '12345,12346'}
    commitCoverage: "http://127.0.0.1:5000/commitCoverage/"     // Param: <testcaseId>
};
export {spidersenseWorkerUrls};
*/

// Uncomment for production (on anthill)

 const spidersenseWorkerUrls = {
    getAllProjects: "/api/getAllProjects ",
    getProject: "/api/getProject/",            // Param: <projectId>
    getCommits: "/api/getCommits/",            // Param: <projectId> 
    getSourceInfo: "/api/getSourceInfo/",      // Param: <commitId>
    getAllTestcases: "/api/getAllTestcases/",    // Param: <commitId>
    testcaseCoverage: "/api/testcaseCoverage/", // Param: <testcaseId>
    batchTestcaseCoverage: "/api/batchTestcaseCoverage", // Body: {tlist: '12345,12346'}
    commitCoverage: "/api/commitCoverage/"     // Param: <testcaseId>
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
    messages: [
        {
            messageTitle: "",
            message: "Fault localization techniques have been developed to automate the process of searching for faults, in an effort to reduce the costs of locating faults and debugging. Tarantula is one such technique and offers a way to rank code statements in terms of their suspiciousness."
        },
        {
            messageTitle: "Tarantula",
            message: "Tarantula uses information about the pass/fail status of each test case, about the statements, branches, and methods executed by each test case, and about the actual source code that the test suite is run against. Using these pieces, the technique visualizes how faulty a statement is by computing how many failed test cases executed that statement. Faultiness, and thus suspiciousness, is then mapped to a color (or hue) spectrum from red, to yellow, to green. For instance, a statement that was executed primarily by failed test cases would be mostly red.",
        },
        {
            messageTitle: "SpiderSense",
            message: "So how does SpiderSense fit into all of this?"
        },
        {
            messageTitle: "",
            message: "SpiderSense is a collaborative project that utilizes the SpiderSense Worker, the backend infrastructure, to build and run analysis tools upon a new commit on Github. These tools are ran on a number of Github projects that we follow. Users are able to interact with a web-based interface, the SpiderSense View, which is integrated with the worker and includes visualizations of the fault localizations."
        }
    ],
    titleMembers: "Meet the Team",
    members: [
        {
            name: "James A. Jones",
            position: "Professor",
            description: "Jim is the inventor of Tarantula (i.e., the technique implemented on this web service), and more broadly, spectra-based fault localization. The idea of which is to utilize commonly available test coverage to help finding bugs that are causing test failures. Jim leads the Spider Lab at UC Irvine, which conducts research in the area of software engineering, testing, debugging, program comprehension, and visualization.",
            imagePath: "images/profile_james_a_jones.jpg"
        },
        {
            name: "Kaj Dreef",
            position: "Software Engineer | Ph.D. Student",
            description: "Sofware Engineering Ph.D. student at the University of California Irvine, currently focused on software comprehension, debugging, dynamic analysis, and history slicing. Kaj holds a B.Sc. in Electrical Engineering and a M.Sc. in Embedded Systems from the Deft University of Technology in the Netherlands.",
            imagePath: "images/profile_kaj_dreef.jpg"
        },
        {
            name: "Dongxin Xiang",
            position: "Backend Developer",
            description: "",
            imagePath: "images/face-black-48dp.svg"
        },
        {
            name: "Ashutosh Kumar Singh",
            position: "Frontend Developer",
            description: "",
            imagePath: "images/face-black-48dp.svg"
        },
        {
            name: "Thuc Nguyen",
            position: "Frontend Developer",
            description: "A graduate student who is part of the Master of Software Engineering program at UCI (Class of 2020), Thuc enjoys designing and implementing application for both web and mobile platforms. He hopes to pursue a career as a Full-stack engineer in the near future.",
            imagePath: "images/profile_thuc_nguyen.jpg"
        },
        {
            name: "Jing Chen",
            position: "Frontend Developer",
            description: "Graduate Student of UCI Master of Software Engineering (c.o 2020)",
            imagePath: "images/profile_jing_chen.jpeg"
        },
        {
            name: "Marc Andrada",
            position: "Backend Developer",
            description: "Graduate Student of UCI Master of Software Engineering (c.o 2020)",
            imagePath: "images/profile_marc_andrada.jpeg"
        },
        {
            name: "Weihuan Fu",
            position: "Frontend Developer",
            description: "Graduate Student of UCI Master of Software Engineering (c.o 2020)",
            imagePath: "images/profile_weihuan_fu.jpg"
        },
    ]
};
export {aboutPageDetails};