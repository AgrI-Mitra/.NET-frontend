(function () {
    var selectedVoice = '';
    var isAutoPlayEnabled = false;
    var isVoiceSelected = false;
    const voiceSelectionChannel = new BroadcastChannel('voice_selection');
    var popover;
    document.addEventListener('DOMContentLoaded', function () {
        var popoverTrigger = document.getElementById('autoReadButton');
        var popoverContent = document.getElementById('globalAutoReadPopover');

        const containers = document.querySelectorAll('.image-container');
        containers.forEach(container => {
            container.addEventListener('click', function (event) {
                // Get the associated radio button ID
                const radioId = container.getAttribute('data-radio');
                const radioButton = document.getElementById(radioId);

                // Check the radio button
                radioButton.checked = true;

                // Remove 'selected' class from all images
                containers.forEach(c => c.querySelector('img').classList.remove('selected'));

                // Add 'selected' class to the clicked image
                container.querySelector('img').classList.add('selected');

                document.getElementById(radioId).checked = true;
                globalAutoReadFeature.selectedVoice = radioId;
                globalAutoReadFeature.isVoiceSelected = true;
                voiceSelectionChannel.postMessage(globalAutoReadFeature.selectedVoice);

                popover.hide();

                setAutoReadStatus(false, true);

                // Remove popover click event listener
                // Unregister the event listener
                popoverTrigger.removeEventListener('click', handleClick);

                // Stop propagation for label and img elements
                const label = container.querySelector('label');
                const img = container.querySelector('img');
                const radio = container.querySelector('input[type="radio"]');

                radio.addEventListener('click', function (event) {
                    event.stopPropagation();
                });
                label.addEventListener('click', function (event) {
                    event.stopPropagation();
                });
                img.addEventListener('click', function (event) {
                    event.stopPropagation();
                });
            });
        });

        popover = new bootstrap.Popover(document.querySelector('#autoReadButton'), {
            container: 'body',
            html: true,
            content: popoverContent,
            placement: 'bottom-start',
            customClass: 'settings-popover global-auto-read-popover',
            popperConfig: {
                placement: 'bottom-start',
            },
            trigger: 'manual',
            fallbackPlacements: ['bottom'],
        });

        function handleClick(event) {
            if (globalAutoReadFeature.isVoiceSelected == false) {
                popover.toggle();
                event.stopPropagation();
            }
        }

        // Register the event listener
        popoverTrigger.addEventListener('click', handleClick);

        // $('#autoReadButton').popover();
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

    // function setAutoReadStatus(shouldToggle = true, autoReadStatus = true) {
    //     // get the value of the img source
    //     const autoReadStatusImage = $('#autoReadImage').attr('src');

    //     if (shouldToggle) {
    //         if (autoReadStatusImage.indexOf('auto-read-on.svg') >= 0) {
    //             $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');

    //             $('.auto-read-button-wrapper').removeClass('p-0');
                
    //             globalAutoReadFeature.isAutoPlayEnabled = false;
    //         } else {
    //             $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');

    //             localStorage.setItem('isAutoPlayEnabled', true);
    //             globalAutoReadFeature.isAutoPlayEnabled = true;
    //             // Add "p-0" class
    //             $('.auto-read-button-wrapper').addClass('p-0');
    //         }
    //     } else if (autoReadStatus == true) {
    //         $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');
    //         $('.auto-read-button-wrapper').addClass('p-0');
    //         globalAutoReadFeature.isAutoPlayEnabled = true;
    //     } else {
    //         $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');
    //         $('.auto-read-button-wrapper').removeClass('p-0');
    //         globalAutoReadFeature.isAutoPlayEnabled = false;
    //     }
    // }
    function setAutoReadStatus(shouldToggle = true, autoReadStatus = true) {
        // get the value of the img source
        const autoReadStatusImage = document.getElementById('autoReadImage').src;

        if (shouldToggle) {
            if (autoReadStatusImage.indexOf('auto-read-on.svg') >= 0) {
                document.getElementById('autoReadImage').src = '../Content/Images/auto-read-off.svg';

                document.querySelectorAll('.auto-read-button-wrapper').forEach(element => {
                    element.classList.remove('p-0');
                });

                globalAutoReadFeature.isAutoPlayEnabled = false;
            } else {
                document.getElementById('autoReadImage').src = '../Content/Images/auto-read-on.svg';

                localStorage.setItem('isAutoPlayEnabled', true);
                globalAutoReadFeature.isAutoPlayEnabled = true;

                document.querySelectorAll('.auto-read-button-wrapper').forEach(element => {
                    element.classList.add('p-0');
                });
            }
        } else if (autoReadStatus === true) {
            document.getElementById('autoReadImage').src = '../Content/Images/auto-read-on.svg';

            document.querySelectorAll('.auto-read-button-wrapper').forEach(element => {
                element.classList.add('p-0');
            });

            globalAutoReadFeature.isAutoPlayEnabled = true;
        } else {
            document.getElementById('autoReadImage').src = '../Content/Images/auto-read-off.svg';

            document.querySelectorAll('.auto-read-button-wrapper').forEach(element => {
                element.classList.remove('p-0');
            });

            globalAutoReadFeature.isAutoPlayEnabled = false;
        }
    }

    window.globalAutoReadFeature = {
        setAutoReadStatus,
        selectedVoice,
        isAutoPlayEnabled,
        isVoiceSelected,
    };
})();
