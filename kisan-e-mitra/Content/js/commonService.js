(function () {
    function escapeSingleQuote(str) {
        return str.replace(/'/g, "\\'");
    }

    window.commonService = {
        escapeSingleQuote: escapeSingleQuote
    };
})();