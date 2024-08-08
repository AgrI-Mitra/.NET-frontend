document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleContentButton');
    const toggleArrowIcon = document.getElementById('toggleArrowIcon');
    const mainContentWrapper = document.getElementById('mainContentWrapper');

    // Ensure the content is shown by default
    mainContentWrapper.classList.add('show');
    toggleArrowIcon.src = '../Content/images/arrow-down.svg';

    toggleButton.addEventListener('click', function () {
        mainContentWrapper.classList.toggle('show');
        if (mainContentWrapper.classList.contains('show')) {
            toggleArrowIcon.src = '../Content/images/arrow-down.svg';
        } else {
            toggleArrowIcon.src = '../Content/images/arrow-up.svg';
        }
    });
});