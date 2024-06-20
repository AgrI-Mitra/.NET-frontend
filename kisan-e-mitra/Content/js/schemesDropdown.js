(async function async() {

    function updateSchemesTranslations(translations) {
        for (var i = 0; i < window.schemesInfo.list.length; i++) {

            const currentScheme = window.schemesInfo.list[i];

            // Find the current scheme translations
            const currentSchemeTranslation = translations.find(f => f.key == currentScheme.id);

            if (currentSchemeTranslation) {
                window.schemesInfo.list[i].title = currentSchemeTranslation.value;
            }
        }

        // Update the translations in UI
        bindSchemesToDropdown(window.schemesInfo.list, window.schemesInfo.currentScheme);
    }
    function bindSchemesToDropdown(schemes, selectedSchemeId) {

        var labelsWrapper = document.getElementById('schemesChildWrapper');

        for (var i = 0; i < schemes.length; i++) {

            let currentScheme = schemes[i];

            var label = getSchemesLabelsHtmlContent(currentScheme, currentScheme.id == selectedSchemeId ? "btn-success" : "");
            if (i == 0) {
                labelsWrapper.replaceChildren();
            }

            const parsedLabelHtml = new DOMParser().parseFromString(label, 'text/html');
            const labelHtml = parsedLabelHtml.getElementsByTagName("button")[0];
            labelsWrapper.appendChild(labelHtml);
        }

        // Set schemes info to global object
        window.schemesInfo.list = schemes;
        window.schemesInfo.currentScheme = selectedSchemeId;
    }

    function getSchemesLabelsHtmlContent(schemeInfo, extraClass) {

        let labelsClassString = extraClass ? extraClass : "btn btn-secondary";
        let dataType = extraClass ? "data-type='secondary' " : "";
        return (
            "<button data-bs-container='body'" + dataType
            + "data-bs-toggle='popover' data-bs-placement='top' data-bs-content='" + schemeInfo.title + "'" +
            "data-scheme-id='" + schemeInfo.id + "'" +
            "id='scheme-button-" + schemeInfo.id + "'" +

            "type='button' class='btn fade-left language-buttons mx-1 schemeEventListener " + labelsClassString + "'> " + schemeInfo.title + "</button>"
        )
    }

    async function getSchemesList() {
        document.getElementById('schemesLabelsWrapper').style.display = "flex";

        try {
            const response = await fetch('/Content/data/schemes.json', { cache: 'no-cache' });
            const schemes = await response.json();

            // Check if defaultScheme config is available, if yes then use the id mentioned in it else the first scheme will be the default selected
            if (window.appConfig.defaultScheme) {
                bindSchemesToDropdown(schemes, window.appConfig.defaultScheme);
            } else {
                bindSchemesToDropdown(schemes, schemes[0].id);
            }

        } catch (e) {
            console.log('Error while fetching schemes data: ', e);
        }
    }

    // Set schemes info to global object
    window.schemesInfo = {
        bindSchemesToDropdown: bindSchemesToDropdown,
        getSchemesList: getSchemesList,
        updateSchemesTranslations: updateSchemesTranslations
    }
})();