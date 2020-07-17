class Request {
    constructor() {
    }

    /**
     * Takes array of urls as an argument and makes a request to each
     * url, returning a list of promises.
     * @param   {array}     urls    The urls of the requested files
     * @param   {string}    type    The response type
     * @return  {array}     An array of promises
     */
    prepareRequest(urls, type) {
        // Throw error is urls is not an array
        if (!Array.isArray(urls)) {
            throw "urls is not an array";
        }

        // Gather the requests as promises into an array
        let promisesArr = new Array(urls.length);
        for (let i = 0; i < urls.length; i++) {
            let promise = this.makeRequest(urls[i], type);
            promisesArr[i] = promise;
        }

        // Return the array of promises
        return promisesArr;
    }

    /**
     * Takes a single url as an argument and makes a request, returning
     * a promise
     * @param   {string}    url     The url of the requested file
     * @param   {string}    type    The response type
     * @return  {Object}    A promise
     */
    prepareSingleRequest(url, type) {
        return this.makeRequest(url, type);
    }

    /**
     * Returns the request for the given url (a file) as a promise
     * @param   {string}    url     The url to the file
     * @param   {string}    method  The HTTP method
     * @param   {string}    type    The response type
     */
    makeRequest(url, type, method) {
        // Create the XHR request and return as a promise
        let request = new XMLHttpRequest();
    
        return new Promise(function (resolve, reject) {
            // Setup our listener to process compeleted requests
            request.onreadystatechange = function () {
                // Only run if the request is complete
                if (request.readyState !== 4) {
                    return;
                }
    
                // Process the response, resolve if success, reject if fial
                if (request.status >= 200 && request.status < 300) {
                    resolve(request);
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                }
            };
    
            // Setup our HTTP request and send
            request.open(method || 'GET', url, true);
            request.responseType = type;    
            request.send();
        });
    };
}

export default Request;