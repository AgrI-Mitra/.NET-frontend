(function () {

    // Listen scroll events
    // document.getElementById('message-list').addEventListener('scroll', function (event) {

    //     //Hide header if srolled to bottom direction and make header visible again on scroll top top direction

    //     if (event.target.scrollTop > 0 || event.target.scrollTop > 0) {
    //         $('#appHeader').removeClass('d-flex');
    //         $('#appHeader').addClass('d-none');
    //         $('#message-list').addClass('without-header');
    //         $('#appHeader').addClass('without-header');
    //     } else {
    //         $('#appHeader').addClass('d-flex');
    //         $('#appHeader').removeClass('d-none');
    //         $('#message-list').removeClass('without-header');
    //         $('#appHeader').removeClass('without-header');
    //     }
    // });
    document.addEventListener('scroll', function(event) {
        var appHeader = document.getElementById('appHeader');
        var messageList = document.getElementById('message-list');

        if (event.target.scrollTop > 0) {
            toggleClasses(appHeader, ['d-flex', 'without-header'], ['d-none', 'without-header']);
            messageList.classList.add('without-header');
        } else {
            toggleClasses(appHeader, ['d-none', 'without-header'], ['d-flex', 'without-header']);
            messageList.classList.remove('without-header');
        }
    });

    function toggleClasses(element, removeClasses, addClasses) {
        removeClasses.forEach(cls => element.classList.remove(cls));
        addClasses.forEach(cls => element.classList.add(cls));
    }
})();