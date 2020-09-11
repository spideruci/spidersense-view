/**
 * Extracts the source name from the raw github url and returns it.
 * This function makes 2 assumtions:
 *     1) Base url is from raw.githubusercontent
 *     2) Project is a Java project (and includes path src/main/java)
 * 
 * Expected url format:
 * <base_url>/<github_user>/<repo>/<commit_id>/src/main/java/<source_name>
 * Ex. https://raw.githubusercontent.com/sunflower0309/jsoup/e08cbb489ba2b06d7f85106b1fd5edb14b5ad2f7/src/main/java/org/jsoup/parser/CharacterReader.java
 * 
 * @param {string} url The raw.githubusercontent url
 */
function extractSourceNameFromRawGithubUrl(url) {
    const BASE_URL = "https://raw.githubusercontent.com/"; //34
    const SEPARATOR = "/";

    let searchResultForBase = url.indexOf(BASE_URL);
    if (searchResultForBase === -1) {
        return null;
    }
    let noBaseUrl = url.substring(BASE_URL.length);
    let splitNoBase = noBaseUrl.split(SEPARATOR);

    let indexOfJava = -1;
    for (let i = 0; i < splitNoBase.length; i++) {
        if (splitNoBase[i] === "java") {
            indexOfJava = i;
            break;
        }
    }
    if (indexOfJava === -1) {
        return null;
    }

    return splitNoBase.slice(indexOfJava + 1, splitNoBase.length).join(SEPARATOR);
}
export {extractSourceNameFromRawGithubUrl};

/**
 * Extracts the file name from the source name.
 * 
 * Ex. "https://github.com/spideruci/Tarantula.git"
 * => ["https://github.com/spideruci", "Tarantula.git"]
 * @param {string} sourceName The source name
 */
function extractFileNameFromSourceName(sourceName) {
    let splitPath = function(name) {
        var index = name.lastIndexOf("/");
        return [name.substring(0, index), name.substring(index + 1)];
    }
    let pathArr = splitPath(sourceName);
    return (pathArr[1].length === 0) ? pathArr[0] : pathArr[1];
}
export {extractFileNameFromSourceName};