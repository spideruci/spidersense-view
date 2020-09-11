/**
 * Given a url from Github, splits off the base url and path following the user
 * to return the user.
 * Ex. https://github.com/  |  <github-user>  |  /<project-name>/... 
 * @param {string} url The Github url
 * @return {string} The user of the Github repo
 */
function getUserFromGithubUrl(url) {
    if (url == null || url.length === 0) {
        return "";
    }

    const baseUrl = "https://github.com/";
    const baseUrlLength = baseUrl.length;
    let index = url.indexOf(baseUrl);

    let slicedUrl = url.slice(index + baseUrlLength, url.length);
    let splitUrl = slicedUrl.split("/");

    // The username is at index 0
    return splitUrl[0];
}
export {getUserFromGithubUrl};

/**
 * Given a url from Github, shorted it to a specific number of 
 * characters
 * @param {string} url The Github url
 * @param {number} length The number of characters to shorten to
 * @return {string} The shortened url
 */
function shortenGithubUrl(url, length) {
    if (url.length <= length) {
        return url;
    }

    // const MAX_CHARACTERS = 47;
    return `${url.substring(0, length)}...`;
}
export {shortenGithubUrl};