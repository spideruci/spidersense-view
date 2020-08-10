class FileNameParser {
    /** =======================================================================
     * 
     * METHODS
     * 
     ======================================================================= */
    extractFileName(filePath) {
        let splitPath = function(name) {
            var index = name.lastIndexOf("/");
            return [name.substring(0, index), name.substring(index + 1)]
        }
        let pathArr = splitPath(filePath);
        return (pathArr[1].length === 0) ? pathArr[0] : pathArr[1];
    }

    extractFileNameByDot(filePath) {
        let splitPath = filePath.split(".");
        if (splitPath.length < 2) {
            return null;
        }
        if (splitPath.length === 2) {
            return splitPath;
        }

        return [splitPath[splitPath.length - 2], splitPath[splitPath.length - 1]].join(".");
    }
}
export default FileNameParser;