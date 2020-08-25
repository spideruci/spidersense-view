/**
 * Shorted the commitId if its length is more than 6 characters.
 * 6 is the # of characters a commit id on Github is usually shortened to.
 * @param   {string}    commitId        The commit id
 */
function shortenCommitId(commitId) {
    if (commitId == null || commitId == undefined) {
        return "Invalid commit id";
    }

    return (commitId.length <= 6) ? commitId : commitId.substring(0, 7);
}
export {shortenCommitId};

/**
 * Shortens the commitMessage so that it is constrained to 80 characters.
 * @param   {string}    commitMessage   The commit message
 */
function shortenMessage(commitMessage) {
    if (commitMessage == null || commitMessage == undefined) {
        return "<invalid-message>";
    }

    return (commitMessage.length <= 80) ? commitMessage : commitMessage.substring(0, 80);
}
export {shortenMessage};

/**
 * Converts timestamp to date. Returns the string that will be used to
 * inform users about the date.
 * 
 * Timestamp format is: YYYY-MM-DD HH:MM:SS
 * @param   {string}    timestamp       The timestamp the commit was pushed
 */
function convertTimestampToDate(timestamp) {
    let splitTimestamp = timestamp.split(" ");

    let dateArray = splitTimestamp[0].split("-");

    const year = dateArray[0];
    const month = dateArray[1];
    const day = dateArray[2];

    let date = new Date(year, month, day);

    const monthsReference = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];

    return `${monthsReference[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${splitTimestamp[1]}`;
}
export {convertTimestampToDate};