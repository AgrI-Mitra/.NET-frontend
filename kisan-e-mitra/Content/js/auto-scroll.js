(function () {

    // Get h-scrollable-wrapper element
    const hScrollableWrapper = document.getElementById('hScrollableWrapper');

    // Keep auto scrolling left to right and right to left horizontally in the h-scrollable-wrapper with slow scrolling
    $('#hScrollableWrapper').trigger('scroll', { left: 100, behavior: 'smooth', });
    

})();