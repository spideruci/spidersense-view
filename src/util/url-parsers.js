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