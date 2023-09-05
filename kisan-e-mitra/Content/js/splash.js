(function () {
    $(document).ready(function () {
        setTimeout(function () {

            var url = $("#RedirectFromSplash").val();
            window.location.href = url;
        }, 3000);
    });
})();