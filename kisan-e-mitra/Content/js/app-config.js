(async function () {
    async function getAppConfig() {
        try {
            const response = await fetch('/Content/data/clientConfig.json');
            const appConfig = await response.json();

            window.appConfig = {
                numberOfVisiblePopularQueries: appConfig.numberOfVisiblePopularQueries,
                numberOfUsedPopularQueriesToRetain: appConfig.numberOfUsedPopularQueriesToRetain,
                defaultScheme: appConfig.defaultScheme
            }

        } catch (e) {
            console.log('Error while fetching app config data: ', e);
        }
    }

    await getAppConfig();
})();