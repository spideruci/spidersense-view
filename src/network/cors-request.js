class CorsRequest {
    constructor() {

    }

    // Create the XHR object.
    createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            console.log("Running with credentials");
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
        } 
        // else if (typeof XDomainRequest != "undefined") {
        //     // XDomainRequest for IE.
        //     xhr = new XDomainRequest();
        //     xhr.open(method, url);
        // } 
        else {
        // CORS not supported.
        xhr = null;
        }
        return xhr;
    }
    
    // Helper method to parse the title tag from the response.
    //   function getTitle(text) {
    //     return text.match('<title>(.*)?</title>')[1];
    //   }
    
    // Make the actual CORS request.
    makeCorsRequest(url) {
        // This is a sample server that supports CORS.
        // var url = 'http://html5rocks-cors.s3-website-us-east-1.amazonaws.com/index.html';
    
        var xhr = this.createCORSRequest('GET', url);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }
    
        // Response handlers.
        xhr.onload = function() {
            var text = xhr.responseText;
            //   var title = getTitle(text);
            alert('Response from CORS request to ' + url);
        };
    
        xhr.onerror = function() {
            alert('Woops, there was an error making the request.');
        };
    
        xhr.send();
    }
}
export default CorsRequest;