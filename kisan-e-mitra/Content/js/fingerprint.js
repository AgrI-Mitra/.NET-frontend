//(function () {
//    console.log('fingerprint js: ');
//    // Initialize the agent at application startup.
//    const fpPromise = import('https://openfpcdn.io/fingerprintjs/v4')
//        .then(FingerprintJS => FingerprintJS.load())

//    // Get the visitor identifier when you need it.
//    fpPromise
//        .then(fp => fp.get())
//        .then(result => {
//            // This is the visitor identifier:
//            const visitorId = result.visitorId
//            console.log('visitorId:', visitorId);
//        })
////});

(async function () {

    

    //Initialize the agent at application startup.
    const fpPromise = import('https://openfpcdn.io/fingerprintjs/v4')
        .then(FingerprintJS => FingerprintJS.load())
    console.log('library load');
    //Get the visitor identifier when you need it.
    await fpPromise
        .then(fp => fp.get())
        .then(result => {
            //This is the visitor identifier:
            const visitorId = result.visitorId;
            console.log('visitorId :', visitorId);
            sessionStorage.setItem('fingerPrintId', visitorId);
            window.dispatchEvent(new Event('storage'));
        });
})();
