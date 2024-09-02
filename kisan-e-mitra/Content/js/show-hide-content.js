(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const toggleButton = document.getElementById('toggleContentButton');
        const toggleArrowIcon = document.getElementById('toggleArrowIcon');
        const mainContentWrapper = document.getElementById('popularQuestionsWrapper');

        // Ensure the content is shown by default
        //mainContentWrapper.classList.add('show');
        //toggleArrowIcon.src = '../Content/images/arrow-down.svg';

        toggleButton.addEventListener('click', function (e) {
            mainContentWrapper.classList.toggle('show');
            if (mainContentWrapper.classList.contains('show')) {
                toggleArrowIcon.src = '../Content/images/arrow-down.svg';
            } else {
                toggleArrowIcon.src = '../Content/images/arrow-up.svg';
            }
        });

        function hidePopularQuestions() {
            $('#popularQuestionsWrapper').removeClass('d-flex');
            $('#popularQuestionsWrapper').hide();
            $('#message-list').addClass('without-popular-questions');
            mainContentWrapper.classList.remove('show');
            toggleArrowIcon.src = '../Content/images/arrow-up.svg';
        }

        function showPopularQuestions() {
            $('#popularQuestionsWrapper').addClass('d-flex');
            $('#popularQuestionsWrapper').show();
            $('#message-list').removeClass('without-popular-questions');
            mainContentWrapper.classList.add('show');
            toggleArrowIcon.src = '../Content/images/arrow-down.svg';
        }

        window.showHideContent = {
            hidePopularQuestions,
            showPopularQuestions
        };
    });
})();
