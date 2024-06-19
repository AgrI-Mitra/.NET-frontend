(async function async() {

    function updateSelectedSchemeTranslation(updatedTranslation) {
        //document.getElementById('selectedSchemeLabel').innerText = updatedTranslation;
    }

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
    function bindSchemesToDropdown(schemes, selectedSchemeId, skipUpdatingCurrentSchemeTitle) {

        //var dropdown = document.getElementById('schemesDropdown');
        var labelsWrapper = document.getElementById('schemesLabelsWrapper');

        for (var i = 0; i < schemes.length; i++) {

            let currentScheme = schemes[i];

            if (currentScheme.id === selectedSchemeId && !skipUpdatingCurrentSchemeTitle) {

                //document.getElementById('selectedSchemeLabel').innerText = currentScheme.title;
                updateSelectedSchemeTranslation(currentScheme.title);
            }

            //var option = getSchemeOptionHtmlContent(currentScheme, currentScheme.id == selectedSchemeId ? "fw-bold" : "");

            var label = getSchemesLabelsHtmlContent(currentScheme, currentScheme.id == selectedSchemeId ? "btn-success" : "");

            // Parse html string to html Node to update it inside UL element
            //const parsedHtml = new DOMParser().parseFromString(option, 'text/html');



            //const liHtml = parsedHtml.getElementsByTagName("li")[0];
            if (i == 0) {
                //dropdown.replaceChildren();
                labelsWrapper.replaceChildren();
            }

            //dropdown.appendChild(liHtml);

            const parsedLabelHtml = new DOMParser().parseFromString(label, 'text/html');
            const labelHtml = parsedLabelHtml.getElementsByTagName("button")[0];
            labelsWrapper.appendChild(labelHtml);
        }

        // Set schemes info to global object
        window.schemesInfo.list = schemes;
        window.schemesInfo.currentScheme = selectedSchemeId;
    }
    function getSchemeOptionHtmlContent(schemeInfo, extraClass) {

        let dropDownItemClassString = extraClass ?
            "dropdown-item " + extraClass
            : "dropdown-item";
        return (
            "<li class='scheme-label-wrapper schemeEventListener'" +

            "data-scheme-id='" +
            schemeInfo.id +
            "'>" +
            "<a class='" + dropDownItemClassString + "'" +
            "id='" +
            schemeInfo.id +
            "'>" +
            schemeInfo.title +
            '</a>' +
            '</li>'
        );
    }

    function getSchemesLabelsHtmlContent(schemeInfo, extraClass) {

        let labelsClassString = extraClass ? extraClass : "btn btn-secondary";
        let dataType = extraClass ? "data-type='secondary' " : "";
        return (
            "<button data-bs-container='body'" + dataType
            + "data-bs-toggle='popover' data-bs-placement='top' data-bs-content='" + schemeInfo.title + "'" +
            "data-scheme-id='" + schemeInfo.id + "'" +
            "id='scheme-button-" + schemeInfo.id + "'" +

            "type='button' class='btn language-buttons mx-1 schemeEventListener " + labelsClassString + "'> " + schemeInfo.title + "</button>"
        )
    }

    async function getSchemesList() {

        //Enable Schemes dropdown
        //document.getElementById('schemesDropdownWrapper').style.display = "flex";
        document.getElementById('schemesLabelsWrapper').style.display = "flex";

        try {
            const response = await fetch('/Content/data/schemes.json', { cache: 'no-cache' });
            const schemes = await response.json();

            // Check if defaultScheme config is available, if yes then use the id mentioned in it else the first scheme will be the default selected
            if (window.appConfig.defaultScheme) {
                bindSchemesToDropdown(schemes, window.appConfig.defaultScheme, true);
            } else {
                bindSchemesToDropdown(schemes, schemes[0].id, true);
            }

        } catch (e) {
            console.log('Error while fetching schemes data: ', e);
        }
    }

    // Set schemes info to global object
    window.schemesInfo = {
        bindSchemesToDropdown: bindSchemesToDropdown,
        updateSelectedSchemeTranslation: updateSelectedSchemeTranslation,
        getSchemesList: getSchemesList,
        updateSchemesTranslations: updateSchemesTranslations
    }
})();