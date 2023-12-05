////This module is used to format string into variout pattern and formats
//export const FormatStringHelper = (function () {

//    /**
//     * This function is used to genearte hyperlink from the inputString
//     * @param {any} inputString
//     * @returns
//     */
//    function generateHyperlink(inputString) {
//        // Regular expression to match the pattern [some text] (link)
//        var regex = /\[(.*?)\]\s*\((.*?)\)/g;
//        var match = regex.exec(inputString);

//        if (match) {
//            var linkText = match[1];
//            var url = match[2];

//            // Construct the HTML hyperlink string
//            var hyperlink = '<a href="' + url + '" target="_blank">' + linkText + '</a>';
//            return hyperlink;
//        } else {
//            return inputString;//"Invalid format. Please provide input in the format [some text] (link)";
//        }
//    }

//    return {
//        generateHyperlink: generateHyperlink
//    };

//})();