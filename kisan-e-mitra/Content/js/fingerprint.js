(async function () {
    function initFingerprintJS() {

        console.log("initFingerprintJS: ");
        FingerprintJS.load().then(fp => {
            // The FingerprintJS agent is ready.
            // Get a visitor identifier when you'd like to.
            fp.get().then(result => {
                // This is the visitor identifier:
                const visitorId = result.visitorId;
                console.log(visitorId);
                console.log('visitorId :', visitorId);
                sessionStorage.setItem('fingerPrintId', visitorId);
                window.dispatchEvent(new Event('storage'));
            });
        });
    }

    // Create a new script tag
    var scriptTag = document.createElement('script');

    // Add an event listener for the 'load' event
    scriptTag.addEventListener('load', function () {
        initFingerprintJS();
    });

    // Set the source of the script tag
    scriptTag.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js";

    // Append the script tag to the body of the document
    document.body.appendChild(scriptTag);

})();
