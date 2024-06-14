(async function () {
    async function getAppConfig() {
        try {
            const response = await fetch('/Content/data/clientConfig.json');
            const appConfig = await response.json();

            window.appConfig = appConfig;

        } catch (e) {
            console.log('Error while fetching app config data: ', e);
        }
    }

    //await getAppConfig();

    window.appConfigConstruct = {
        getAppConfig: getAppConfig
    }
})();