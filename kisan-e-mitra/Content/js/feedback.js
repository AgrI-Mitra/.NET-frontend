(function () {
    var rating = 0;

    $(document).ready(function () {
        rating = 0;
    });

    function giveRating(img, image) {
        img.attr("src", "/Content/Images/" + image)
            .prevAll("img").attr("src", "/Content/Images/" + image);
    }

    function removeRating(img, image) {
        img.attr("src", "/Content/Images/" + image)
            .nextAll("img").attr("src", "/Content/Images/" + image);
    }

    $(function () {

        $("img").click(function () {
            removeRating($(this), "star-outline.svg");
            giveRating($(this), "star.svg");

            rating = parseInt($(this).attr("id"));
        });
    });

    function submitRating() {

        if (rating > 0) {
            $.ajax({
                type: "POST",
                url: "/Home/SubmitRating",
                dataType: "json",
                data: { rating: rating },
                success: function (data) {
                    toastMessagePopup(data.Text);
                },
                failure: function (data) {
                }
            });
        } else {
            toastMessagePopup("Please enter rating.");
        }
    }

    function submitReview() {
        var review = $('#experience-feedback').val();
        console.log('review: ', review);
        $.ajax({
            type: "POST",
            url: "/Home/SubmitReview",
            dataType: "json",
            data: { review: review },
            success: function (data) {
                toastMessagePopup(data.Text);
            },
            failure: function (data) {
            }
        });
    }

    var toastMessagePopup = function (message) {
        const toastBody = document.getElementById('toastBody');
        const toastLiveExample = document.getElementById('liveToast');
        toastBody.innerText = message;
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
        toastBootstrap.show();
    }
})();