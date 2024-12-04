document.addEventListener('DOMContentLoaded', function () {
    function initializeScrollArrows(scrollConfigs) {
        scrollConfigs.forEach(config => {
            const scrollContainer = document.getElementById(config.scrollContainerId);
            const scrollLeftButton = document.getElementById(config.scrollLeftButtonId);
            const scrollRightButton = document.getElementById(config.scrollRightButtonId);
            const tolerance = 5; // Tolerance value to handle floating-point precision issues

            function updateArrows() {

                if (scrollContainer.scrollLeft <= tolerance) {
                    scrollLeftButton.disabled = true;
                } else {
                    scrollLeftButton.disabled = false;
                }

                if (scrollContainer.scrollWidth - scrollContainer.clientWidth - scrollContainer.scrollLeft <= tolerance) {
                    scrollRightButton.disabled = true;
                } else {
                    scrollRightButton.disabled = false;
                }

                if (scrollContainer.scrollWidth <= scrollContainer.clientWidth + tolerance) {
                    scrollLeftButton.style.display = 'none';
                    scrollRightButton.style.display = 'none';
                } else {
                    scrollLeftButton.style.display = 'block';
                    scrollRightButton.style.display = 'block';
                }
            }

            function scrollLeft() {
                scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
            }

            function scrollRight() {
                scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
            }

            scrollLeftButton.addEventListener('click', scrollLeft);
            scrollRightButton.addEventListener('click', scrollRight);

            scrollContainer.addEventListener('scroll', updateArrows);
            window.addEventListener('resize', updateArrows);

            // Use the load event to ensure all resources are loaded
            window.addEventListener('load', updateArrows);

            // Use MutationObserver to detect changes in the DOM
            const observer = new MutationObserver(updateArrows);
            observer.observe(scrollContainer, { childList: true, subtree: true });

            // Call updateArrows immediately to set the initial state of the arrows
            updateArrows();
        });
    }

    // Example usage: Initialize scroll arrows for multiple scrollable content sections
    initializeScrollArrows([
        { scrollContainerId: 'schemesChildWrapper', scrollLeftButtonId: 'scrollLeft', scrollRightButtonId: 'scrollRight' }
    ]);
});