class FileNameParser {
    constructor() {

    }

    extractFileName(filePath) {
        let splitPath = function(name) {
            var index = name.lastIndexOf("/");
            return [name.substring(0, index), name.substring(index + 1)]
        }
        let pathArr = splitPath(filePath);
        return (pathArr[1].length == 0) ? pathArr[0] : pathArr[1];
    }
}
export default FileNameParser;