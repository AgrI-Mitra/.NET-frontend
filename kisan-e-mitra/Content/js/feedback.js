(function () {
    var rating = 0;
    var currentParentRoute = "/Home/";

    document.addEventListener('DOMContentLoaded', function() {
        rating = 0;
    });

    function giveRating(img, image) {
        img.src = "/Content/Images/" + image;
        let prevSibling = img.previousElementSibling;
        while (prevSibling) {
            prevSibling.src = "/Content/Images/" + image;
            prevSibling = prevSibling.previousElementSibling;
        }
    }

    function removeRating(img, image) {
        img.src = "/Content/Images/" + image;
        let nextSibling = img.nextElementSibling;
        while (nextSibling) {
            nextSibling.src = "/Content/Images/" + image;
            nextSibling = nextSibling.nextElementSibling;
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll("img").forEach(function(img) {
            img.addEventListener("click", function() {
                removeRating(this, "star-outline.svg");
                giveRating(this, "star.svg");
                rating = parseInt(this.id);
            });
        });
    });

    function submitRating() {
        if (rating > 0) {
            fetch("/Home/SubmitRating", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ rating: rating })
            })
            .then(response => response.json())
            .then(data => {
                toastMessagePopup(data.Text);
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            toastMessagePopup("Please enter rating.");
        }
    }

    function submitReview() {
        var review = document.getElementById('experience-feedback').value;
        fetch("/Home/SubmitReview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ review: review })
        })
        .then(response => response.json())
        .then(data => {
            toastMessagePopup(data.Text);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function toastMessagePopup(message) {
        const toastBody = document.getElementById('toastBody');
        const toastLiveExample = document.getElementById('liveToast');
        toastBody.innerText = message;
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
        toastBootstrap.show();
    }
})();