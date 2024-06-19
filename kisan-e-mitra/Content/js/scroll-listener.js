(function () {

    // Listen scroll events
    document.getElementById('message-list').addEventListener('scroll', function (event) {

        //Hide header if srolled to bottom direction and make header visible again on scroll top top direction

        if (event.target.scrollTop > 0 || event.target.scrollTop > 0) {
            $('#appHeader').removeClass('d-flex');
            $('#appHeader').addClass('d-none');
            $('#message-list').addClass('without-header');
            $('#appHeader').addClass('without-header');
        } else {
            $('#appHeader').addClass('d-flex');
            $('#appHeader').removeClass('d-none');
            $('#message-list').removeClass('without-header');
            $('#appHeader').removeClass('without-header');
        }
    });
})();