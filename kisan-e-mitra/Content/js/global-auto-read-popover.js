(function () {

    var selectedVoice = '';
    var isAutoPlayEnabled = false;
    var isVoiceSelected = false;
    const voiceSelectionChannel = new BroadcastChannel('voice_selection');
    var popover;
    document.addEventListener('DOMContentLoaded', function () {

        var popoverTrigger = document.getElementById('autoReadButton');
        var popoverContent = document.getElementById('globalAutoReadPopover');

        const images = document.querySelectorAll('.image-container img');
        images.forEach(img => {
            img.addEventListener('click', function (ev) {

                // Remove 'selected' class from all images
                images.forEach(image => image.classList.remove('selected'));

                // Add 'selected' class to the clicked image
                img.classList.add('selected');

                const radioId = img.closest('label').getAttribute('for');
                document.getElementById(radioId).checked = true;
                globalAutoReadFeature.selectedVoice = radioId;
                console.log('selectedVoice: ', globalAutoReadFeature.selectedVoice);
                globalAutoReadFeature.isVoiceSelected = true;
                voiceSelectionChannel.postMessage(globalAutoReadFeature.selectedVoice);

                popover.hide();

                setAutoReadStatus(false, true);

                // Remove popover click event listener
                // Unregister the event listener
                //popoverTrigger.removeEventListener('click', handleClick);
            });
        });

        popover = new bootstrap.Popover(document.querySelector('#autoReadButton'), {
            container: 'body',
            html: true,
            content: popoverContent,
            placement: 'bottom-start',
            customClass: 'settings-popover global-auto-read-popover',
            popperConfig: {
                placement: 'bottom-start'
            },
            trigger: 'manual',
            fallbackPlacements: ['bottom']
        })

        function handleClick(event) {
            if (globalAutoReadFeature.isVoiceSelected == false) {
                popover.toggle();
                event.stopPropagation();
            }
        }

        // Register the event listener
        popoverTrigger.addEventListener('click', handleClick);



        //popoverTrigger.addEventListener('click', function (event) {
        //    console.log('popover clicked');

        //    console.log('isVoiceSelected: ', isVoiceSelected);
        //    if (isVoiceSelected == false) {
        //        //popover.toggle();
        //        //event.stopPropagation();
        //    }

        //});

        // document.addEventListener('click', function (event) {
        //     //var popoverElement = document.querySelector('.popover');
        //     //if (popoverElement && !popoverElement.contains(event.target) && !popoverTrigger.contains(event.target)) {
        //     //    popover.hide();
        //     //}
        // });

        $('#autoReadButton').popover();

        // Create the backdrop element
        var backdrop = document.createElement('div');
        backdrop.className = 'popover-backdrop';
        document.body.appendChild(backdrop);

        // Show the backdrop when the popover is shown
        popoverTrigger.addEventListener('show.bs.popover', function () {
            backdrop.style.display = 'block';
            console.log('popover shown');
        });

        // Hide the backdrop when the popover is hidden
        popoverTrigger.addEventListener('hide.bs.popover', function () {
            backdrop.style.display = 'none';
            console.log('popover hidden');
        });
    });

    function setAutoReadStatus(shouldToggle = true, autoReadStatus = true) {
        // get the value of the img source
        const autoReadStatusImage = $('#autoReadImage').attr('src');

        if (shouldToggle) {
            if (autoReadStatusImage.indexOf('auto-read-on.svg') >= 0) {
                $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');

                $('.auto-read-button-wrapper').removeClass('p-0');
                //localStorage.setItem('isAutoPlayEnabled', false);
                globalAutoReadFeature.isAutoPlayEnabled = false;
            } else {
                $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');

                localStorage.setItem('isAutoPlayEnabled', true);
                globalAutoReadFeature.isAutoPlayEnabled = true;
                // Add "p-0" class
                $('.auto-read-button-wrapper').addClass('p-0');
            }
        } else if (autoReadStatus == true) {
            $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');
            $('.auto-read-button-wrapper').addClass('p-0');
            globalAutoReadFeature.isAutoPlayEnabled = true;
        } else {
            $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');
            $('.auto-read-button-wrapper').removeClass('p-0');
            globalAutoReadFeature.isAutoPlayEnabled = false;
        }
        //if (changeStatus == false) {

        //    const currentAutoReadStatus = localStorage.getItem('isAutoPlayEnabled');


        //    if (currentAutoReadStatus == 'true') {
        //        $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');
        //        $('.auto-read-button-wrapper').addClass('p-0');
        //    } else {
        //        $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');
        //        $('.auto-read-button-wrapper').removeClass('p-0');
        //    }

        //} else {
        //    if (autoReadStatusImage.indexOf('auto-read-on.svg') >= 0) {
        //        $('#autoReadImage').attr('src', '../Content/Images/auto-read-off.svg');

        //        $('.auto-read-button-wrapper').removeClass('p-0');
        //        localStorage.setItem('isAutoPlayEnabled', false);
        //    } else {
        //        $('#autoReadImage').attr('src', '../Content/Images/auto-read-on.svg');

        //        localStorage.setItem('isAutoPlayEnabled', true);
        //        // Add "p-0" class
        //        $('.auto-read-button-wrapper').addClass('p-0');
        //    }
        //}
    }

    window.globalAutoReadFeature = {
        setAutoReadStatus,
        selectedVoice,
        isAutoPlayEnabled,
        isVoiceSelected
    }
})();
