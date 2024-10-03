(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const toggleButton = document.getElementById('toggleContentButton');
        const toggleArrowIcon = document.getElementById('toggleArrowIcon');
        const mainContentWrapper = document.getElementById('popularQuestionsWrapper');

        toggleButton.addEventListener('click', function (e) {
            mainContentWrapper.classList.toggle('show');
            if (mainContentWrapper.classList.contains('show')) {
                toggleArrowIcon.src = '../Content/images/arrow-down.svg';
            } else {
                toggleArrowIcon.src = '../Content/images/arrow-up.svg';
            }
        });

        function hidePopularQuestions() {
            mainContentWrapper.classList.remove('d-flex');
            mainContentWrapper.style.display = 'none';
            document.getElementById('message-list').classList.add('without-popular-questions');
            mainContentWrapper.classList.remove('show');
            toggleArrowIcon.src = '../Content/images/arrow-up.svg';
        }

        function showPopularQuestions() {
            mainContentWrapper.classList.add('d-flex');
            mainContentWrapper.style.display = 'block';
            document.getElementById('message-list').classList.remove('without-popular-questions');
            mainContentWrapper.classList.add('show');
            toggleArrowIcon.src = '../Content/images/arrow-down.svg';
        }

        window.showHideContent = {
            hidePopularQuestions,
            showPopularQuestions
        };
    });
})();