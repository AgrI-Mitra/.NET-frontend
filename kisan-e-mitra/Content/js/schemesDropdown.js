(async function async() {

    function updateSelectedSchemeTranslation(updatedTranslation) {
        document.getElementById('selectedSchemeLabel').innerText = updatedTranslation;
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

        const schemesDropdownWrapper = document.getElementById('schemesDropdownWrapper');

        if (schemesDropdownWrapper) {
            schemesDropdownWrapper.style.display = 'flex';
        }

        var dropdown = document.getElementById('schemesDropdown');
        //updateSelectedSchemeTranslation('');

        for (var i = 0; i < schemes.length; i++) {

            let currentScheme = schemes[i];

            if (currentScheme.id === selectedSchemeId && !skipUpdatingCurrentSchemeTitle) {

                //document.getElementById('selectedSchemeLabel').innerText = currentScheme.title;
                updateSelectedSchemeTranslation(currentScheme.title);
            }

            var option = getSchemeOptionHtmlContent(currentScheme, currentScheme.id == selectedSchemeId ? "fw-bold" : "");


            // Parse html string to html Node to update it inside UL element
            const parsedHtml = new DOMParser().parseFromString(option, 'text/html');

            const liHtml = parsedHtml.getElementsByTagName("li")[0];
            if (i == 0) {
                dropdown.replaceChildren();
            }

            dropdown.appendChild(liHtml);
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
            "<li class='scheme-label-wrapper'" +

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

    async function getSchemesList() {
        try {
            const response = await fetch('/Content/data/schemes.json', { cache: 'no-cache' });
            const schemes = await response.json();

            bindSchemesToDropdown(schemes, schemes[0].id, true)

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

    //await getSchemesList();
})();