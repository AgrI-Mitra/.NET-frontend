(function () {
    var userQuestionTextBox = "#userQuestionTextBox";
    var voiceRecordButtonId = "#voiceRecordButtonId";
    var voiceRecordingImageId = "#recordingImage";
    var stopVoiceRecordingImagePath = "../Content/images/stop-recording.svg";
    var startVoiceRecordingImagePath = "../Content/images/start-recording.svg";
    var startAudioImagePath = "../Content/images/start-audio.svg";
    var stopAudioImagePath = "../Content/images/stop-audio.svg";
    var thumbDislikeImagePath = "../Content/images/hand-thumbs-down.svg";
    var thumbDislikeHighlightImagePath =
        "../Content/images/hand-thumbs-down-fill.svg";
    var thumbLikeImagePath = "../Content/images/hand-thumbs-up.svg";
    var thumbLikeHighlightImagePath = "../Content/images/hand-thumbs-up-fill.svg";
    var chatbotLogoImagePath = "../Content/images/MOA_logo.png";
    var voiceRecordMicCircleId = "#voiceRecordMicCircle";
    var classesToShowVoiceRecordingAnimation = "voice-recording-animation"; //voice-stop-recording-border-color
    var voiceRecordingStartBgColorClass = "voice-start-recording-border-color";
    var voiceRecordingStopBgColorClass = "voice-stop-recording-border-color";
    var sendTextButtonId = "#sendTextButton";
    let chunks = [];

    var querstionInput = "";

    var gumStream; //stream from getUserMedia()
    var rec; //Recorder.js object
    var input; //MediaStreamAudioSourceNode we'll be recording

    // shim for AudioContext when it's not avb.
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext; //audio context to help us record
    var isMessagePlaying = false; // To maintain state of message is being played or not
    var previousPlayingMessageId = ""; // To maintain previous playing message id. So when user tries to play another message in middle of current playing message
    var lastUserTypedMessageId = "";
    // We need to stop current playing message.

    function copyQuestionToTextBox(message) {
        $(userQuestionTextBox).val(message);
        $(userQuestionTextBox).trigger("change");
    }

    function chatLoader() {
        let chatMessageWrapperStartingDivHtmlContent =
            getChatMessageWrapperStartingDivHtmlContent(true, "responseLoader"); // Main chat message wrapper
        let chatbotRespondingHtmlContent =
            getChatbotRespondingIndicatorHtmlContent();

        const responseLoader =
            chatMessageWrapperStartingDivHtmlContent +
            chatbotLogoHtmlContent +
            chatMessageWrapperColumnTwoStartingDivHtmlContent +
            chatbotRespondingHtmlContent +
            closingDivHtmlContent +
            chatMessageWrapperColumnThreeStartingDivHtmlContent +
            closingDivHtmlContent +
            closingDivHtmlContent;

        $("#message-list").append(responseLoader);
    }

    function hideChatLoader() {
        $("#chatbotMessageWrapper-responseLoader").remove();
    }

    function enableDisableSendButton(textValue) {
        let trimmedTextValue = textValue?.trim();

        if (trimmedTextValue != undefined && trimmedTextValue != null && trimmedTextValue != "") {
            $(sendTextButtonId).css({ opacity: 1 });
            $(sendTextButtonId).prop("disabled", false);

        } else {
            $(sendTextButtonId).css({ opacity: 0.4 });
            $(sendTextButtonId).prop("disabled", true);

            $(userQuestionTextBox)[0].value = null;
        }

        autosize.update($(userQuestionTextBox));
    }

    function getChatMessageWrapperStartingDivHtmlContent(
        isSystemMessage,
        customId
    ) {
        var systemMessageBackgroundClass =
            isSystemMessage == true ? "system-msg-bg" : "";
        var customChatMessageWrapperId =
            customId != null || customId != undefined ? "id='" + "chatbotMessageWrapper-" + customId + "'" : "";

        return (
            "<div class='my-msg-content chatbot-message-wrapper " +
            systemMessageBackgroundClass +
            "'" +
            customChatMessageWrapperId +
            ">"
        );
    }

    function getClosingDivHtmlContent() {
        return "</div>";
    }

    function getStartingSpanHtmlContent() {
        return "<span>";
    }

    function getClosingSpanHtmlContent() {
        return "</span>";
    }

    function getChatMessageWrapperColumnTwoStartingDivHtmlContent() {
        return "<div class='chatbot-message-wrapper-column-two'>";
    }

    function getChatMessageWrapperColumnThreeStartingDivHtmlContent() {
        return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three me-md-2'>";
    }

    function getChatbotLogoHtmlContent() {
        return "<img src='../Content/images/MOA_logo.png' class='chatbot-message-wrapper-column-one'>";
    }

    function getUserLogoHtmlContent() {
        return "<img src='../Content/images/user.svg' class='chat-dp-img-width user-avatar-img rounded-circle chatbot-message-wrapper-column-one'>";
    }

    function getChatMessageAudioImageHtmlContent(audioId) {
        return (
            "<img id='playMessageImg-" +
            audioId +
            "'" +
            "data-audio-id='" +
            audioId +
            "'" +
            "src='../Content/images/start-audio.svg' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='playAudioMessage'>"
        );
    }

    function getFeedbackButtonsHtmlContent(messageId) {
        //return (
        //    "<img id='thumbLikeButton-" +
        //    messageId +
        //    "src='" +
        //    thumbLikeImagePath +
        //    "alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='likeMessage' data-message-id='" +
        //    messageId +
        //    ">" +
        //    "<img id='thumbDislikeButton-" +
        //    messageId +
        //    "src='" +
        //    thumbDislikeImagePath +
        //    "alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='dislikeMessage' data-message-id='" +
        //    messageId +
        //    ">"
        //);
        return (
            "<img id='thumbLikeButton-" +
            messageId +
            "'" +
            "data-message-id='" +
            messageId +
            "'" +
            "src='" + thumbLikeImagePath + "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='likeMessage'>" +

            "<img id='thumbDislikeButton-" +
            messageId +
            "'" +
            "data-message-id='" +
            messageId +
            "'" +
            "src='" + thumbDislikeImagePath + "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='dislikeMessage'>"
        );
    }

    function getChatbotRespondingIndicatorHtmlContent() {
        return "<div class='ms-2 dot-flashing'></div>";
    }

    function getAudioProgressBarHtmlContent(audioId) {
        return (
            "<div id='audioProgressBar-" +
            audioId +
            "'" +
            "class='circle_percent' data-percent='50'><div class='circle_inner'><div class='round_per'></div></div></div>"
        );
    }

    function getPopularQuestionHtmlContent(popularQuestion) {
        return (
            "<div id='popularQuestion' class='query-msg popularQuestions'" +
            "data-popular-question='" +
            popularQuestion +
            "'>" +
            "<p>" +
            popularQuestion +
            "</p>" +
            "</div>"
        );
    }

    let userLogoHtmlContent = getUserLogoHtmlContent();
    let chatbotLogoHtmlContent = getChatbotLogoHtmlContent();
    let chatMessageWrapperColumnTwoStartingDivHtmlContent =
        getChatMessageWrapperColumnTwoStartingDivHtmlContent(); // Second column inside chat message wrapper
    let chatMessageWrapperColumnThreeStartingDivHtmlContent =
        getChatMessageWrapperColumnThreeStartingDivHtmlContent(); // Third column inside chat message wrapper
    let spanStartingHtmlContent = getStartingSpanHtmlContent();
    let spanClosingHtmlContent = getClosingSpanHtmlContent();
    let closingDivHtmlContent = getClosingDivHtmlContent();

    // Wrap the native DOM audio element play function and handle any autoplay errors
    //Audio.prototype.play = (function (play) {
    //    return function () {
    //        var audio = this,
    //            args = arguments,
    //            promise = play.apply(audio, args);
    //        if (promise !== undefined) {
    //            promise.catch(_ => {
    //                // Autoplay was prevented. This is optional, but add a button to start playing.
    //                var el = document.createElement("button");
    //                el.innerHTML = "Play";
    //                el.addEventListener("click", function () { play.apply(audio, args); });
    //                this.parentNode.insertBefore(el, this.nextSibling);
    //            });
    //        }
    //    };
    //})(Audio.prototype.play);

    function updateTranslations(translationsToUpdate) {
        let translationsMappingIds = [
            {
                translationKey: "message_welcome_greeting",
                htmlElementKeyName: "messageWelcomeGreeting",
                htmlElementKeyAttributeType: ".",
                htmlElementValueAttributeType: "text",
            },
            {
                translationKey: "message_ask_ur_question",
                htmlElementKeyName: "messageAskUrQuestion",
                htmlElementKeyAttributeType: ".",
                htmlElementValueAttributeType: "placeholder",
            },
            {
                translationKey: "label_title",
                htmlElementKeyName: "labelTitle",
                htmlElementKeyAttributeType: ".",
                htmlElementValueAttributeType: "text",
            },
        ];

        for (var i = 0; i < translationsToUpdate.length; i++) {
            // Get the current translation's html element related details from "translationsMappingIds" so we can know which html element we need to update for the translations
            let currentTranslation = translationsToUpdate[i];

            let currentTranslationMappingDetails = translationsMappingIds.find(
                (f) => f.translationKey == currentTranslation.Key
            );

            if (currentTranslationMappingDetails) {
                if (
                    currentTranslationMappingDetails.htmlElementValueAttributeType ==
                    "text"
                ) {
                    $(
                        currentTranslationMappingDetails.htmlElementKeyAttributeType +
                        currentTranslationMappingDetails.htmlElementKeyName
                    ).html(currentTranslation.Value);
                } else {
                    $(
                        currentTranslationMappingDetails.htmlElementKeyAttributeType +
                        currentTranslationMappingDetails.htmlElementKeyName
                    ).attr(
                        currentTranslationMappingDetails.htmlElementValueAttributeType,
                        currentTranslation.Value
                    );
                }
            }
        }
    }

    function languageChangeListener() {
        $(".languagesLabels").click(function (e) {
            let languageCultureCode = $(this).data("language-culture-code");
            let languageEnglishLabel = $(this).data("language-english-label");
            let languageCultureLabel = $(this).data("language-culture-label");
            let currentLanguageCultureCode = $(this).data("current-language-culture-code");

            changeLanguage(
                languageCultureCode,
                languageEnglishLabel,
                languageCultureLabel,
                currentLanguageCultureCode
            );
        });
    }

    function popularQuestionClickListener() {
        $("#popularQuestion").click(function (e) {
            let popularQuestion = $(this).data("popular-question");

            copyPopularQuestionInTextBox(popularQuestion);
        });
    }

    function restartSessionButtonOnClickListener() {
        $("#restartSessionButton").click(function (e) {
            restartSession();
        });
    }

    function chatbotMessageActionButtonsOnClickListener() {

        $(document).on("click", ".chatbot-message-action-buttons", function (ev) {
            let actionName = $(this).data("action-name");
            let audioId = $(this).data("audio-id");
            let messageId = $(this).data("message-id");

            if (actionName == "setAutoPlayAudioMessage") {
                setAutoPlayOn(audioId);

            } else if (actionName == "playAudioMessage") {
                playAudio(audioId);

            } else if (actionName == "likeMessage") {
                likeMessage(messageId);

            } else if (actionName == "dislikeMessage") {
                dislikeMessage(messageId);
            }
        });

        //$(".chatbot-message-action-buttons").on('click', function (event) {
        //    event.stopPropagation();
        //    event.stopImmediatePropagation();
        //    let actionName = $(this).data("action-name");

        //    console.log("actionName: ", actionName);
        //    $(this).off();
        //});
    }

    function userFeedbackListener() {
        $(".feedbackLikeButtons").click(function (e) {
            let messageId = $(this).data("message-id");

            likeMessage(messageId);
        });

        $(".feedbackDislikeButtons").click(function (e) {
            let messageId = $(this).data("message-id");

            dislikeMessage(messageId);
        });
    }

    function userQuestionTextBoxOnKeyPressListener() {
        $(userQuestionTextBox).keypress(function (e) {
            if (e.keyCode == 13 || e.key == "Enter") {
                $(sendTextButtonId).click();
            }
        });
    }

    function resendOtpOnClickListener() {
        $(document).on("click", ".resendOTP", function (ev) {
            resendOTP(this);
        });
    }

    function popularQuestionsOnClickListener() {
        $(document).on("click", ".popularQuestions", function (ev) {
            let popularQuestion = $(this).data("popular-question");
            copyPopularQuestionInTextBox(popularQuestion);
        });
    }

    function initChatBotConfig() {
        languageChangeListener();
        popularQuestionClickListener();
        userQuestionTextBoxOnKeyPressListener();
        chatbotMessageActionButtonsOnClickListener();
        restartSessionButtonOnClickListener();
        resendOtpOnClickListener();
        popularQuestionsOnClickListener();
        initAutoSizeInputBox();
    }

    function initAutoSizeInputBox() {
        autosize($(userQuestionTextBox));
    }

    function updateChatMessagesList(
        message,
        messageId,
        messageType,
        isMessageFromBot
    ) {
        if (message != "") {
            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(isMessageFromBot, messageId); // Main chat message wrapper

            let chatMessageAudioImageHtmlContent =
                getChatMessageAudioImageHtmlContent(messageId); // Audio icon inside third column

            let feedbackOptionHtmlContent = getFeedbackButtonsHtmlContent(messageId);

            var response =
                chatMessageWrapperStartingDivHtmlContent +
                chatbotLogoHtmlContent +
                chatMessageWrapperColumnTwoStartingDivHtmlContent +
                spanStartingHtmlContent +
                message +
                spanClosingHtmlContent +
                closingDivHtmlContent +
                chatMessageWrapperColumnThreeStartingDivHtmlContent +
                chatMessageAudioImageHtmlContent +
                (messageType == "final_response" && isMessageFromBot == true
                    ? feedbackOptionHtmlContent
                    : "") +
                closingDivHtmlContent +
                closingDivHtmlContent;


            // Format message if it is from chatbot
            if (isMessageFromBot == true) {
                response = formatChatbotResponse(response);
            }

            $("#message-list").append(response.replace(/\n/g, "<br>"));

            if (messageType == "final_response") {
                showPopularQuestions();
            }

            scrollToBottom();

            if (isMessageFromBot == true) {
                autoPlayAudio(messageId);
            }
        }
    }

    $(document).ready(function () {
        initChatBotConfig();

        $(voiceRecordMicCircleId).hide();

        createGlobalAudioElement();

        getWelcomeGreetingsAudio(false);

        //initWelcomeGreetingAudioConfig();

        // Check if language change message is available, if available we need to show it to the user on page load.
        var languageChangedGreeting = sessionStorage.getItem(
            "languageChangedMessage"
        );
        if (languageChangedGreeting) {
            //let chatMessageWrapperStartingDivHtmlContent = getChatMessageWrapperStartingDivHtmlContent(true); // Main chat message wrapper
            //let chatMessageAudioImageHtmlContent = getChatMessageAudioImageHtmlContent("language-change-greeting-message-base64-audio"); // Audio icon inside third column
            //var response =
            //    chatMessageWrapperStartingDivHtmlContent
            //    + chatbotLogoHtmlContent
            //    + chatMessageWrapperColumnTwoStartingDivHtmlContent
            //    + spanStartingHtmlContent + languageChangedGreeting + spanClosingHtmlContent
            //    + closingDivHtmlContent
            //    + chatMessageWrapperColumnThreeStartingDivHtmlContent
            //    + chatMessageAudioImageHtmlContent
            //    + closingDivHtmlContent
            //    + closingDivHtmlContent;
            //$('#message-list').append(response.replace(/\n/g, "<br>"));
            //sessionStorage.removeItem('languageChangedMessage');
            //autoPlayAudio("language-change-greeting-message-base64-audio");
        }

        enableDisableSendButton();

        $(userQuestionTextBox).on("change paste keyup input", function () {
            autosize.update($(userQuestionTextBox));
            var textValue = $(this).val();

            // If value is there then only keep the send button enabled else keep it disabled.
            enableDisableSendButton(textValue);
        });

        var isRecording = false;
        getLocalStream();

        $(voiceRecordButtonId).click(function () {
            recordAudio();
        });

        function recordAudio() {
            isRecording = !isRecording;

            if (isRecording) {
                $(voiceRecordingImageId).attr("src", stopVoiceRecordingImagePath);
                $(voiceRecordingImageId).addClass(voiceRecordingStopBgColorClass);
                $(voiceRecordingImageId).removeClass(voiceRecordingStartBgColorClass);
                $(voiceRecordMicCircleId).show();

                $(sendTextButtonId).attr("disabled", "disabled");
                startRecording();
            } else {
                $(voiceRecordingImageId).attr("src", startVoiceRecordingImagePath);
                $(voiceRecordingImageId).addClass(voiceRecordingStartBgColorClass);
                $(voiceRecordingImageId).removeClass(voiceRecordingStopBgColorClass);

                $(voiceRecordMicCircleId).hide();
                $(sendTextButtonId).removeAttr("disabled");
                stopRecording();
            }
        }

        $(function () {
            $("body").on("click", sendTextButtonId, function (e) {
                e.preventDefault();
                querstionInput = $(userQuestionTextBox).val();

                var querstionInput = $("<div />").text(querstionInput).html();
                if (querstionInput) {
                    let chatMessageWrapperStartingDivHtmlContent =
                        getChatMessageWrapperStartingDivHtmlContent(false); // Main chat message wrapper

                    let chatMessageAudioImageHtmlContent =
                        getChatMessageAudioImageHtmlContent(lastUserTypedMessageId); // Audio icon inside third column

                    var userQuery = "";

                    userQuery =
                        chatMessageWrapperStartingDivHtmlContent +
                        userLogoHtmlContent +
                        chatMessageWrapperColumnTwoStartingDivHtmlContent +
                        spanStartingHtmlContent +
                        querstionInput +
                        spanClosingHtmlContent +
                        closingDivHtmlContent +
                        chatMessageWrapperColumnThreeStartingDivHtmlContent +
                        (lastUserTypedMessageId != null && lastUserTypedMessageId != ""
                            ? chatMessageAudioImageHtmlContent
                            : "") +
                        closingDivHtmlContent +
                        closingDivHtmlContent;

                    $("#message-list").append(userQuery.replace(/\n/g, "<br>"));
                    lastUserTypedMessageId = ""; // Clear last user typed messaged Id once it is sent
                }

                askQuestions(querstionInput);
            });
        });
    });

    function copyPopularQuestionInTextBox(message) {
        // Hide popular questions now
        hidePopularQuestions();
        showUserRecordedMessageInTextBox(message);
    }

    function hidePopularQuestions() {
        $("#popularQuestionsWrapper").removeClass("d-flex");
        $("#popularQuestionsWrapper").hide();
        $("#message-list").addClass("without-popular-questions");
    }

    function showPopularQuestions() {
        $("#popularQuestionsWrapper").addClass("d-flex");
        $("#popularQuestionsWrapper").show();
        $("#message-list").removeClass("without-popular-questions");
    }

    function showUserRecordedMessageInTextBox(message) {
        $(userQuestionTextBox).val(message);
        $(userQuestionTextBox).focus();
        $(userQuestionTextBox).trigger("change");
    }

    function processChatBotResponse(
        message,
        messageId,
        messageType,
        textInEnglish
    ) {
        chatResponseView(message, messageId, messageType);
        if (
            String(textInEnglish)
                .toLowerCase()
                .indexOf("one time password is wrong") >= 0
        ) {
            var resendOtpTranslation = $("#resend-otp-translation").val();

            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(true, "resendOtp"); // Main chat message wrapper

            //let chatMessageAudioImageHtmlContent = getChatMessageAudioImageHtmlContent(lastUserTypedMessageId); // Audio icon inside third column

            var userQuery = "";

            userQuery =
                chatMessageWrapperStartingDivHtmlContent +
                userLogoHtmlContent +
                chatMessageWrapperColumnTwoStartingDivHtmlContent +
                "<div> <button class='btn btn-success language-buttons resendOTP'>" +
                resendOtpTranslation +
                "</button></div>" +
                closingDivHtmlContent +
                closingDivHtmlContent;

            $("#message-list").append(userQuery);
        }
        $(userQuestionTextBox).val("");
        $(userQuestionTextBox).trigger("change");

        hideChatLoader();
    }

    function onInputBoxKeyPressed(event) {
        if (event.keyCode == 13 || event.key == "Enter") {
            $(sendTextButtonId).click();
        }
    }

    function resendOTP(element) {
        $("#chatbotMessageWrapper-resendOtp").remove();
        askQuestions("resend OTP");
    }

    function formatChatbotResponse(response) {
        //response = '<table class="aadhar-table"><tbody><tr><td>Name :</td><td>Lal Chand</td></tr><tr><td>Father Name :</td><td></td></tr><tr><td>Date Of Birth :</td><td>01/01/1900</td></tr><tr><td>Address :</td><td>Jana (24/46),NAGGAR,Kullu,KULLU,HIMACHAL PRADESH</td></tr><tr><td>Registration Date :</td><td>19/02/2019</td></tr></tbody></table>Dear Lal Chand, I have checked your status and found that you have been marked as a *Landless farmer* by the State. If this information is not correct, I suggest you to kindly visit your nearest district/ block office and get your land details updated on the PM KISAN portal.'
        // Check the chatbot response message, and see if any word is given between 2 starts *word*
        // If there is any such word, we need to display it in bold font.
        var myRegexp = /\*(.*?)\*/g;
        var match = myRegexp.exec(response);
        var matchedWords = [];
        while (match != null) {
            matchedWords.push({
                wordToFind: match[0],
                wordToReplace: match[1],
            });

            match = myRegexp.exec(response);
        }

        // Replace matched words with <b></b> tags to display them in bold font
        for (var i = 0; i < matchedWords.length; i++) {
            response = response.replace(
                matchedWords[i].wordToFind,
                "<b>" + matchedWords[i].wordToReplace + "</b>"
            );
        }

        // AADHAR Info UI Format START
        // If aadhar info is available in chat response then we need to display it in table format
        // Add bootstrap table class and "table-responsive card" classes as wrapper to beautify the table

        //Remove all the table related element and replace them with div to show adhar info in a new UI
        if (response.indexOf("aadhar-table") >= 0) {
            response = response.replaceAll("<table", "<div");
            response = response.replaceAll("<tbody", "<div");
            response = response.replaceAll("<tr", '<div class="div-row"');
            response = response.replaceAll("<td", "<div");
            response = response.replaceAll("/table>", "/div>");
            response = response.replaceAll("/tbody>", "/div>");
            response = response.replaceAll("/tr>", "/div>");
            response = response.replaceAll("/td>", "/div>");
        }
        // AADHAR Info UI Format END

        return response;
    }

    function chatResponseView(message, messageId, messageType) {
        if (message != "") {

            updateChatMessagesList(message, messageId, messageType, true);
            //let chatMessageWrapperStartingDivHtmlContent =
            //    getChatMessageWrapperStartingDivHtmlContent(true); // Main chat message wrapper

            //let chatMessageAudioImageHtmlContent =
            //    getChatMessageAudioImageHtmlContent(messageId); // Audio icon inside third column

            //let feedbackOptionHtmlContent = getFeedbackButtonsHtmlContent(messageId);

            //var response =
            //    chatMessageWrapperStartingDivHtmlContent +
            //    chatbotLogoHtmlContent +
            //    chatMessageWrapperColumnTwoStartingDivHtmlContent +
            //    spanStartingHtmlContent +
            //    message +
            //    spanClosingHtmlContent +
            //    closingDivHtmlContent +
            //    chatMessageWrapperColumnThreeStartingDivHtmlContent +
            //    chatMessageAudioImageHtmlContent +
            //    (messageType == "final_response" ? feedbackOptionHtmlContent : "") +
            //    closingDivHtmlContent +
            //    closingDivHtmlContent;

            //response = formatChatbotResponse(response);

            //$("#message-list").append(response.replace(/\n/g, "<br>"));

            //autoPlayAudio(messageId);
        }
    }

    function askQuestions(input) {
        chatLoader();
        $(userQuestionTextBox).val("");
        $(userQuestionTextBox).trigger("change");

        scrollToBottom();
        $.ajax({
            type: "POST",
            url: "/Home/AskQuestions",
            dataType: "json",
            data: { querstion: input },
            success: function (data) {
                hideChatLoader();
                var message = "";

                const contentType = "audio/wav";

                if (data?.audio?.text) {
                    const blob = b64toBlob(data.audio.text, contentType);
                    loadAudioPlayer(blob, data.messageId, "left");
                }

                if (data.Text !== null || data.Error !== null) {
                    changeInputPlaceholderValue(data.placeholder);

                    if (data.Text !== null) {
                        message = data.Text;
                        processChatBotResponse(
                            data.Text,
                            data.messageId,
                            data.messageType,
                            data.textInEnglish
                        );
                    } else if (data.Error !== null) {
                        message = data.Error;
                        processChatBotResponse(message, data.messageId, data.messageType);
                    }
                }

                scrollToBottom();
            },
            failure: function (data) { },
        });
    }

    function likeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var likeButtonSource = $("#thumbLikeButton-" + messageId)[0].src;

        var likeMessageApiEndPoint = "LikeMessage";
        var likeImageToReplace = thumbLikeHighlightImagePath;

        var isLikeHighlight = false;

        if (likeButtonSource.indexOf("fill") >= 0) {
            isLikeHighlight = true;

            likeMessageApiEndPoint = "UnlikeMessage";
            likeImageToReplace = thumbLikeImagePath;
        }

        $.ajax({
            type: "POST",
            url: "/Home/" + likeMessageApiEndPoint,
            dataType: "json",
            data: { messageId: messageId },
            success: function (data) {
                hideChatLoader();

                if (data.IsSuccess == true) {
                    // Highlight the like button
                    $("#thumbLikeButton-" + messageId).attr("src", likeImageToReplace);

                    // If earlier it was already hightlighed it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                    if (isLikeHighlight) {
                        $("#thumbLikeButton-" + messageId).removeClass(
                            "feedback-animation"
                        );
                    } else {
                        $("#thumbLikeButton-" + messageId).addClass("feedback-animation");
                    }

                    $("#thumbDislikeButton-" + messageId).removeClass(
                        "feedback-animation"
                    ); // Remove animation class from dislike button, to display animation when user hits the same button again

                    $("#thumbDislikeButton-" + messageId).attr(
                        "src",
                        thumbDislikeImagePath
                    ); // Change image to color less icon for dislike button as user has clicked on like button now
                }
            },
            failure: function (data) {
                hideChatLoader();
            },
        });
    }

    function dislikeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var dislikeButtonSource = $("#thumbDislikeButton-" + messageId)[0].src;

        var dislikeMessageApiEndPoint = "DislikeMessage";
        var dislikeImageToReplace = thumbDislikeHighlightImagePath;
        var isDislikeHighlight = false;
        if (dislikeButtonSource.indexOf("fill") >= 0) {
            isDislikeHighlight = true;

            dislikeMessageApiEndPoint = "UnlikeMessage";
            dislikeImageToReplace = thumbDislikeImagePath;
        }

        $.ajax({
            type: "POST",
            url: "/Home/" + dislikeMessageApiEndPoint,
            dataType: "json",
            data: { messageId: messageId },
            success: function (data) {
                hideChatLoader();

                if (data.IsSuccess == true) {
                    // Highlight the like button
                    $("#thumbDislikeButton-" + messageId).attr(
                        "src",
                        dislikeImageToReplace
                    );

                    // If earlier it was already hightlighed it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                    if (isDislikeHighlight) {
                        $("#thumbDislikeButton-" + messageId).removeClass(
                            "feedback-animation"
                        );
                    } else {
                        $("#thumbDislikeButton-" + messageId).addClass(
                            "feedback-animation"
                        );
                    }

                    $("#thumbLikeButton-" + messageId).removeClass("feedback-animation"); // Remove animation class from like button, to display animation when user hits the same button again

                    $("#thumbLikeButton-" + messageId).attr("src", thumbLikeImagePath);
                }
            },
            failure: function (data) {
                hideChatLoader();
            },
        });
    }

    function scrollToBottom() {
        $("#message-list").animate(
            { scrollTop: $("#message-list").prop("scrollHeight") },
            500
        );
    }

    function getLocalStream() {
        window.addEventListener("DOMContentLoaded", () => {
            if ("MediaRecorder" in window) {
                navigator.mediaDevices
                    .getUserMedia({ video: false, audio: true })
                    .then((stream) => {
                        window.localStream = stream;
                        window.localAudio.srcObject = stream;
                        window.localAudio.autoplay = true;
                    })
                    .catch((err) => {
                        console.error(`you got an error: ${err}`);
                    });
            }
        });
    }

    function startRecording() {
        var constraints = { audio: true, video: false };
        /*
                    We're using the standard promise based getUserMedia()
                    https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
                */

        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(function (stream) {
                /*
                                create an audio context after getUserMedia is called
                                sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
                                the sampleRate defaults to the one set in your OS for your playback device
                
                            */
                audioContext = new AudioContext();

                /*  assign to gumStream for later use  */
                gumStream = stream;

                /* use the stream */
                input = audioContext.createMediaStreamSource(stream);

                /*
                                Create the Recorder object and configure to record mono sound (1 channel)
                                Recording 2 channels  will double the file size
                            */
                rec = new Recorder(input, { numChannels: 1 });

                //start the recording process
                rec.record();
            })
            .catch(function (err) {
                console.log("stream error: ", err);
            });
    }

    function stopRecording() {
        //tell the recorder to stop the recording
        rec.stop();

        //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        //create the wav blob and pass it on to createDownloadLink
        rec.exportWAV(createDownloadLink);
    }

    function createDownloadLink(blob) {
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);

        reader.onloadend = function () {
            base64 = reader.result;
            base64 = base64.split(",")[1];
            chatLoader();
            scrollToBottom();
            $.ajax({
                type: "POST",
                url: "/Home/AskAudioQuestions",
                dataType: "json",
                data: { base64Question: base64 },
                success: function (data) {
                    var message = "";
                    hideChatLoader();

                    loadAudioPlayer(blob, data.messageId);
                    lastUserTypedMessageId = data.messageId;
                    if (data.Text) {
                        showUserRecordedMessageInTextBox(data.Text);
                    } else if (data.Text !== null || data.Error !== null) {
                        if (data.Text !== null) {
                            message = data.Text;
                            $(userQuestionTextBox).val(message);
                            processChatBotResponse(
                                data.Text,
                                data.messgaeId,
                                data.messageType,
                                data.textInEnglish
                            );
                        } else if (data.Error !== null) {
                            message = data.Error;
                            processChatBotResponse(message, data.messageId, data.messageType);
                        }
                    }

                    scrollToBottom();
                },
                failure: function (data) {
                    hideChatLoader();
                },
            });
        };
    }

    function loadAudioPlayer(blob, messageId, alignment = "right") {
        // Remove the existing audio player with the same id if available
        $("#" + messageId).remove();

        const blobUrl = URL.createObjectURL(blob);
        const div = document.createElement("div");
        div.className = "message " + alignment;

        // Avatar image
        if (alignment == "left") {
            div.className += " system-msg-left";
            const avatarImg = document.createElement("img");
            avatarImg.src = chatbotLogoImagePath;
            avatarImg.alt = "avatar 1";
            avatarImg.className = "avatar-img";
            avatarImg.style.width = "45px";
            avatarImg.style.width = "100%";
            div.appendChild(avatarImg);
        } else {
        }

        const audio = document.createElement("audio");
        audio.style.padding = "6px";

        const anchor = document.createElement("a");
        anchor.setAttribute("href", blobUrl);
        const now = new Date();
        anchor.setAttribute(
            "download",
            `recording-${now.getFullYear()}-${(now.getMonth() + 1)
                .toString()
                .padStart(2, "0")}-${now.getDay().toString().padStart(2, "0")}--${now
                    .getHours()
                    .toString()
                    .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}-${now
                        .getSeconds()
                        .toString()
                        .padStart(2, "0")}.webm`
        );
        audio.setAttribute("src", blobUrl);
        audio.setAttribute("controls", "controls");
        audio.setAttribute("controlsList", "nodownload");
        audio.setAttribute("id", messageId);

        div.appendChild(audio);
        div.appendChild(anchor);
        div.style.display = "none"; // Hide audio player as we don't need to display it to the user. It will be played using a audio icon available next to text message
        $("#message-list").append(div);
    }

    const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };

    function changeLanguage(
        languageCultureCode,
        LanguageEnglishLabel,
        languageCultureLabel,
        currentLanguageCultureCode
    ) {
        textToSpeech(LanguageEnglishLabel, changeLanguageApiCall);
        function changeLanguageApiCall() {
            $.ajax({
                type: "POST",
                url: "/Home/ChangeLanguage",
                dataType: "json",
                data: { lang: languageCultureCode },
                success: function (data) {
                    getWelcomeGreetingsAudio(true);

                    sessionStorage.setItem("languageChangedMessage", data.Message);

                    // Remove previous language changed message
                    let previousLanguageChangedMessageId = "#chatbotMessageWrapper-language-change-greeting-message-base64-" + currentLanguageCultureCode + "-audio";
                    $(previousLanguageChangedMessageId).remove();

                    // Add language change messgae to chat screen
                    updateChatMessagesList(
                        data.Message,
                        "language-change-greeting-message-base64-" +
                        languageCultureCode +
                        "-audio",
                        "",
                        false
                    );

                    // Update selected language buttons and labels to update the selected language in UI.
                    updateSelectedLanguageInUI(languageCultureCode, languageCultureLabel);

                    updateTranslations(data.Data.Translations);

                    updatePopularQuestionsTranslations(data.Data.PopularQuestions);
                    showUserRecordedMessageInTextBox("")
                    
                },
                failure: function (data) {
                    alert("oops something went wrong");
                },
            });
        }
    }

    function updatePopularQuestionsTranslations(popularQuestions) {
        $(".query-messages-box").empty();

        for (var i = 0; i < popularQuestions.length; i++) {
            let currentPopularQuestion = popularQuestions[i];

            let currentPopularQuestionHtmlContent = getPopularQuestionHtmlContent(
                currentPopularQuestion.PopularQuestionValue
            );

            $(".query-messages-box").append(currentPopularQuestionHtmlContent);
        }

        showPopularQuestions();
    }

    function updateSelectedLanguageInUI(
        languageCultureCode,
        languageCultureLabel
    ) {
        $(".language-buttons").removeClass("btn-success");
        $(".language-buttons").addClass("btn-secondary");

        $('.language-buttons').data("current-language-culture-code", languageCultureCode);
        $("li.languagesLabels a").data("current-language-culture-code", languageCultureCode);

        $('button[data-language-culture-code="' + languageCultureCode + '"]'
        ).addClass("btn-success");

        $('button[data-language-culture-code="' + languageCultureCode + '"]'
        ).removeClass("btn-secondary");

        $("#selectedLanguageLabel").html(languageCultureLabel);

        $("li.languagesLabels a").removeClass("fw-bold");

        $('li.languagesLabels[data-language-culture-code="' +
            languageCultureCode +
            '"] a'
        ).addClass("fw-bold");
    }

    function getWelcomeGreetingsAudio(isLanguageChanged) {
        $.ajax({
            type: "POST",
            url: "/Home/GetWelcomeGreetingsTextToSpeech",
            dataType: "json",
            success: function (data) {
                let welcomeGreetingIdsList = [
                    "welcome-greeting-message-base64",
                    "language-change-greeting-message-base64",
                ];

                for (var i = 0; i < data.Data.length; i++) {
                    let currentData = data.Data[i];

                    //let hiddenInputElement = $("#" + welcomeGreetingIdsList[i]).val();
                    //console.log("hiddenInputElement: ", hiddenInputElement);

                    //if (hiddenInputElement) {
                    //    $("#" + welcomeGreetingIdsList[i]).val(currentData);
                    //} else {
                    //    let inputElement = document.createElement("input");

                    //    inputElement.id = welcomeGreetingIdsList[i];
                    //    inputElement.value = currentData;
                    //    inputElement.style.display = "none";

                    //    $('#message-list').append(inputElement);
                    //}

                    //$("#" + currentData.Key).remove();

                    //let inputElement = document.createElement("input");

                    //inputElement.id = currentData.Key;
                    //inputElement.value = currentData.Value;
                    //inputElement.style.display = "none";

                    //$('#message-list').append(inputElement);
                }

                initWelcomeGreetingAudioConfig(data.Data, isLanguageChanged);
            },
            failure: function (data) {
                alert("oops something went wrong");
            },
        });
    }

    function initWelcomeGreetingAudioConfig(data, isLanguageChanged) {
        // Get welcoome note and language greeting text audio
        var textsToGetSpeech = [];

        for (var i = 0; i < data.length; i++) {
            let currentData = data[i];

            textsToGetSpeech.push({
                id: currentData.Key + "-audio",
                value: currentData.Value,
            });
        }
        //textsToGetSpeech.push({
        //    id: "welcome-greeting-message-base64-audio",
        //    value: $("#welcome-greeting-message-base64").val()
        //});

        //textsToGetSpeech.push({
        //    id: "language-change-greeting-message-base64-audio",
        //    value: $("#language-change-greeting-message-base64").val()
        //});
        const contentType = "audio/wav";

        if (textsToGetSpeech.length > 0) {
            for (var i = 0; i < textsToGetSpeech.length; i++) {
                var currentBase64String = textsToGetSpeech[i];
                const blob = b64toBlob(currentBase64String.value, contentType);

                loadAudioPlayer(blob, currentBase64String.id, "left");
            }
        }

        if (isLanguageChanged == true) {
            autoPlayAudio(textsToGetSpeech[1].id);
        }
    }

    function setAutoPlayOn(audioId) {
        sessionStorage.setItem("isAutoPlayEnabled", true);
        playAudio(audioId);
    }

    function autoPlayAudio(audioId) {
        let isAutoPlayEnabled = sessionStorage.getItem("isAutoPlayEnabled");

        if (isAutoPlayEnabled) {
            playAudio(audioId);
        }
    }

    async function playAudioWithRememberingLastPause(audioId) {

        const currentAudioIdElement = document.getElementById(audioId);
        console.log('currentAudioIdElement: ', currentAudioIdElement);

        //const globalAudioElement = document.getElementById("globalAudioElement");

        if (currentAudioIdElement.paused == false) {
            currentAudioIdElement.pause();
            //globalAudioElement.currentTime = 0;

            $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);

            var allAudioEls = $("audio");

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != "globalAudioElement") {
                    a.pause();
                    //a.currentTime = 0;
                    $("#playMessageImg-" + a.id).attr("src", startAudioImagePath);
                }
            });

            if (previousPlayingMessageId != audioId) {

                let currentAudio = document.getElementById(audioId);
                currentAudio.playbackRate = 1.1;
                currentAudio.play();

                //globalAudioElement.src = document.getElementById(audioId).src;
                //globalAudioElement.playbackRate = 1.1;
                //globalAudioElement.play();
                previousPlayingMessageId = audioId;

                $("#playMessageImg-" + audioId).attr("src", stopAudioImagePath);
                // Show audio progressbar when audio is playing

                currentAudio.onended = function () {
                    previousPlayingMessageId = "";
                    $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);
                };
            } else {
                sessionStorage.removeItem("isAutoPlayEnabled");
            }
        } else {
            var allAudioEls = $("audio");

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != "globalAudioElement") {
                    a.pause();
                    //a.currentTime = 0;

                    $("#playMessageImg-" + a.id).attr("src", startAudioImagePath);
                }
            });

            let currentAudio = document.getElementById(audioId);
            currentAudio.playbackRate = 1.1;
            currentAudio.play();
            previousPlayingMessageId = audioId;

            $("#playMessageImg-" + audioId).attr("src", stopAudioImagePath);

            currentAudio.onended = function () {
                previousPlayingMessageId = "";

                $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);
            };
        }
    }

    async function playAudio(audioId) {

        const currentAudioIdElement = document.getElementById(audioId);
        console.log('currentAudioIdElement: ', currentAudioIdElement);
        playAudioWithRememberingLastPause(audioId);

        return;
        const globalAudioElement = document.getElementById("globalAudioElement");

        if (globalAudioElement.paused == false) {
            globalAudioElement.pause();
            globalAudioElement.currentTime = 0;

            $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);

            var allAudioEls = $("audio");

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != "globalAudioElement") {
                    a.pause();
                    a.currentTime = 0;
                    $("#playMessageImg-" + a.id).attr("src", startAudioImagePath);
                }
            });

            if (previousPlayingMessageId != audioId) {
                globalAudioElement.src = document.getElementById(audioId).src;
                globalAudioElement.playbackRate = 1.1;
                globalAudioElement.play();
                previousPlayingMessageId = audioId;

                $("#playMessageImg-" + audioId).attr("src", stopAudioImagePath);
                // Show audio progressbar when audio is playing

                globalAudioElement.onended = function () {
                    previousPlayingMessageId = "";
                    $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);
                };
            } else {
                sessionStorage.removeItem("isAutoPlayEnabled");
            }
        } else {
            var allAudioEls = $("audio");

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != "globalAudioElement") {
                    a.pause();
                    a.currentTime = 0;

                    $("#playMessageImg-" + a.id).attr("src", startAudioImagePath);
                }
            });

            globalAudioElement.src = document.getElementById(audioId).src;
            globalAudioElement.playbackRate = 1.1;
            globalAudioElement.play();
            previousPlayingMessageId = audioId;

            $("#playMessageImg-" + audioId).attr("src", stopAudioImagePath);

            globalAudioElement.onended = function () {
                previousPlayingMessageId = "";

                $("#playMessageImg-" + audioId).attr("src", startAudioImagePath);
            };
        }
    }

    /**
        This messgae is used to change icon of play/pause audio.
         */
    function changePlayPauseMessageImg(messageId, showPlayIcon) {
        const messgaeElementId = "#" + messageId;
        if (showPlayIcon) {
            $(messgaeElementId).attr("src", startAudioImagePath);
        } else {
            $(messgaeElementId).attr("src", stopAudioImagePath);
        }
    }

    function restartSession() {
        scrollToBottom();
        $.ajax({
            type: "POST",
            url: "/Home/Logout",
            dataType: "json",
            data: null,
            success: function (data) {
            },
            failure: function (data) { },
        });
    }

    function createGlobalAudioElement() {
        const div = document.createElement("div");
        div.className = "message left";

        const audio = document.createElement("audio");
        audio.style.padding = "6px";

        audio.setAttribute("controls", "controls");
        audio.setAttribute("controlsList", "nodownload");
        audio.setAttribute("id", "globalAudioElement");

        div.appendChild(audio);
        div.style.display = "none"; // Hide audio player as we don't need to display it to the user. It will be played using a audio icon available next to text message
        $("#message-list").append(div);
    }

    function textToSpeech(textToSpeack, myCallBack) {
        setTimeout(() => {
            let speech = new SpeechSynthesisUtterance();
            speech.lang = "en-IN";
            speech.text = textToSpeack;
            speech.rate = 0.6;
            speech.onend = function (event) {
                myCallBack();
            };
            window.speechSynthesis.speak(speech);
        }, 500);
    }

    function changeInputPlaceholderValue(valuetoChange) {
        $(userQuestionTextBox).attr(
            "placeholder",
            valuetoChange != undefined ? valuetoChange : "Ask your question"
        );
    }
})();
