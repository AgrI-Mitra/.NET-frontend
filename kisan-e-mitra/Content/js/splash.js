(function () {
    document.addEventListener('DOMContentLoaded', function () {
       
        setTimeout(function () {
            const url  = document.querySelector('#RedirectFromSplash').value;
            window.location.href = url;
        }, 3000);
    });
})();