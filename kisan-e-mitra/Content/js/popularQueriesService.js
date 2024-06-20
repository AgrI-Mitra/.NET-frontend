(function () {

    const popularQueriesStorageKey = "usedPopularQueries";

    function resetUsedQueries() {
        localStorage.removeItem(popularQueriesStorageKey);
    }
    function getUsedQueries(scheme) {
        let usedQueries = [];
        // Get current used queries
        const usedQueriesString = localStorage.getItem(popularQueriesStorageKey);

        if (usedQueriesString) {
            const usedQueriesObject = JSON.parse(usedQueriesString);

            if (usedQueriesObject) {
                const currentSchemeQueries = usedQueriesObject.find(f => f.scheme == scheme);
                if (currentSchemeQueries) {
                    usedQueries = currentSchemeQueries.queries;
                }
            }
        }

        return usedQueries;
    }

    function updateUsedQueries(scheme, usedQuery, numberOfQueries) {

        let usedQueries = [];
        // Get current used queries
        const usedQueriesString = localStorage.getItem(popularQueriesStorageKey);

        if (usedQueriesString) {
            const usedQueriesObject = JSON.parse(usedQueriesString);

            if (usedQueriesObject && usedQueriesObject.length) {
                usedQueries = usedQueriesObject;
            }
        }

        let selectedSchemeUsedQueries = {
            scheme: scheme,
            queries: []
        };

        let usedQueriesBySchemeNameIndex = usedQueries.findIndex(f => f.scheme == scheme);

        if (usedQueriesBySchemeNameIndex >= 0) {

            // Check if query is already saved as used query or not
            const usedQueriesOfCurrentScheme = usedQueries[usedQueriesBySchemeNameIndex];
            const isQueryAlreadySaved = usedQueriesOfCurrentScheme.queries.find(f => f == usedQuery);

            if (isQueryAlreadySaved) {
                return;
            }

        } else {
            usedQueries.push(selectedSchemeUsedQueries);
        }

        // Check the lenght of existing used queries
        usedQueriesBySchemeNameIndex = usedQueries.findIndex(f => f.scheme == scheme);

        if (usedQueriesBySchemeNameIndex >= 0) {
            usedQueries[usedQueriesBySchemeNameIndex].queries = usedQueries[usedQueriesBySchemeNameIndex].queries.concat([usedQuery]);
        }

        // Get the number of max used queries we need to remember
        const numberOfUsedPopularQueriesToRetain = window.appConfig.numberOfUsedPopularQueriesToRetain;

        // Check the length of currently used queries
        // If length is more than 4, then delete the remaining queries from top
        if (usedQueries[usedQueriesBySchemeNameIndex].queries.length > numberOfUsedPopularQueriesToRetain) {
            usedQueries[usedQueriesBySchemeNameIndex].queries.splice(0, usedQueries[usedQueriesBySchemeNameIndex].queries.length - numberOfUsedPopularQueriesToRetain);
        }

        // Save updated used popular qureies to local storage
        const usedPopularQueriesString = JSON.stringify(usedQueries);
        localStorage.setItem(popularQueriesStorageKey, usedPopularQueriesString);
    }

    // Attach to the global object (window)
    window.popularQueriesService = {
        getUsedQueries: getUsedQueries,
        updateUsedQueries: updateUsedQueries,
        resetUsedQueries: resetUsedQueries
    };
})();