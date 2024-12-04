document.addEventListener('DOMContentLoaded', function () {
    var popoverTrigger = document.getElementById('settingsButton');
    var popoverContent = document.getElementById('settings-popover-content');

    var popover = new bootstrap.Popover(document.querySelector('.example-popover'), {
        container: 'body',
        html: true,
        content: popoverContent,
        placement: 'bottom-start',
        customClass: 'settings-popover',
        popperConfig: {
            placement: 'bottom-start'
        },
        fallbackPlacements: ['bottom']
    })

    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'popoverButton') {
        }
    });

    popoverTrigger.addEventListener('click', function (event) {
        event.stopPropagation();
        popover.toggle();
    });

    document.addEventListener('click', function (event) {
        var popoverElement = document.querySelector('.popover');
        if (popoverElement && !popoverElement.contains(event.target) && !popoverTrigger.contains(event.target)) {
            popover.hide();
        }
    });

    //$('#settingsButton').popover();
    new bootstrap.Popover(popoverTrigger);

    // Create the backdrop element
    var backdrop = document.createElement('div');
    backdrop.className = 'popover-backdrop';
    document.body.appendChild(backdrop);

    // Show the backdrop when the popover is shown
    popoverTrigger.addEventListener('show.bs.popover', function () {
        backdrop.style.display = 'block';
    });

    // Hide the backdrop when the popover is hidden
    popoverTrigger.addEventListener('hide.bs.popover', function () {
        backdrop.style.display = 'none';
    });
});