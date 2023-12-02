(async function () {

    var apiUrlConfig = {
        chatbotApiBaseUrl: "https://bff.agrimitra.samagra.io/", // Staging
        userApiBaseEndPoint: "user/",
        generateUserId: "user/generateUserId",
        Prompt: "prompt",
        ChatHistory: "history",
        ApiVersion: "/3",
        Message: "user/message/",
        MatricsIncrement: "custom/metrics/increment"
    };

    var currentParentRoute = "/Test/";

    var sessionAutoRestartTimeoutId;

    var isChangeLanguageRequestInProgress = null;

    var isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;

    var isGetTextToSpeechFromBhashiniRequestInProgress = null;

    var translations = [];

    var currentUserId = null;
    var previousUserId = null;

    var chatbotConfirmationModalId = "chatbotConfirmationModal";
    var maintenanceModeModalId = "maintenanceModeModal";

    var userQuestionTextBox = "#userQuestionTextBox"; // This variable is used to listen any events on user question text box where user will type the question

    var startAudioImagePath = "../Content/images/start-audio.svg";
    var stopAudioImagePath = "../Content/images/stop-audio.svg";
    var thumbDislikeImagePath = "../Content/images/hand-thumbs-down.svg";
    var thumbDislikeHighlightImagePath =
        "../Content/images/hand-thumbs-down-fill.svg";
    var thumbLikeImagePath = "../Content/images/hand-thumbs-up.svg";
    var thumbLikeHighlightImagePath = "../Content/images/hand-thumbs-up-fill.svg";
    var chatbotLogoImagePath = "../Content/images/chatbot.png";//"../Content/images/MOA_logo.png";

    // Voice Recording button related variables - To Apply animation, change icon images etc. - START
    var voiceRecordButtonId = "#voiceRecordButtonId"; // This variable is used to listen events regarding voice recording button.
    var voiceRecordingImageId = "#recordingImage";// This variable is used to update voice recording image
    var stopVoiceRecordingImagePath = "../Content/images/stop-recording.svg";
    var startVoiceRecordingImagePath = "../Content/images/start-recording.svg";
    var voiceRecordMicCircleId = "#voiceRecordMicCircle";
    var voiceRecordingStartBgColorClass = "voice-start-recording-border-color";
    var voiceRecordingStopBgColorClass = "voice-stop-recording-border-color";
    // Voice Recording button related variables - To Apply animation, change icon images etc. - END

    var sendTextButtonId = "#sendTextButton";

    var gumStream; //stream from getUserMedia()
    var rec; //Recorder.js object
    var input; //MediaStreamAudioSourceNode we'll be recording
    var mediaRecorder;

    // shim for AudioContext when it's not avb.
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext; //audio context to help us record
    var isMessagePlaying = false; // To maintain state of message is being played or not
    var previousPlayingMessageId = ""; // To maintain previous playing message id. So when user tries to play another message in middle of current playing message
    var lastUserTypedMessageId = "";
    // We need to stop current playing message.
    var isUserTypedQuestion = false;
    var isSampleQueryUsed = false;


    const chatbotConfirmationModalElement = document.getElementById(chatbotConfirmationModalId);

    const modalOptions = {
        backdrop: 'static',
        keyboard: false
    };


    var chatbotConfirmationModal;

    // When browser tab is about to close
    window.onbeforeunload = function () {

        if (chatbotConfirmationModal) {
            chatbotConfirmationModal.hide();
        }

        // abort any on going request to server
        // As it will block the restarting of the page
        if (isChangeLanguageRequestInProgress) {
            isChangeLanguageRequestInProgress.abort();
        }

        if (isGetTextToSpeechFromBhashiniRequestInProgress) {
            isGetTextToSpeechFromBhashiniRequestInProgress.abort();
        }

        if (isGetWelcomeGreetingsTextToSpeechRequestInProgress) {
            isGetWelcomeGreetingsTextToSpeechRequestInProgress.abort();
        }

        restartSession();
    };

    onstorage = (event) => {

        onFingerPrintIdCreated();
    };

    function onFingerPrintIdCreated() {
        let fingerPrintId = sessionStorage.getItem("fingerPrintId");

        if (fingerPrintId != null || fingerPrintId != undefined) {

            createSession(fingerPrintId);
        }
    }

    function createSession(fingerPrintId) {

        const currentDate = new Date();

        fingerPrintId += currentDate.getTime().toString();

        const apiUrl = apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.generateUserId + "/" + fingerPrintId;

        return new Promise((resolve, reject) => {

            makeRequestRetry("POST", apiUrl).then(apiResponse => {

                currentUserId = apiResponse;
                resolve();
            }).catch(apiError => {
                handleError(apiError);

                reject();
            });
        });
    }

    /**
     * This method is used to make http api request with retry options
     * @param {any} requestType
     * @param {any} apiUrl
     * @param {any} requestPayload
     * @param {any} headers
     * @param {any} maxRetry
     * @param {any} retryDelay
     * @returns
     */
    function makeRequestRetry(requestType, apiUrl, headers, requestPayload, maxRetry = 0, retryDelay = 3000) {
        let retryCnt = 0;

        function delay(t) {
            return new Promise(resolve => {
                setTimeout(resolve, t);
            });
        }

        function run() {
            return makeApiRequest(requestType, apiUrl, headers, requestPayload).catch(function (err) {


                if (retryCnt >= maxRetry) {

                    console.error('Max retries exceeded. There was an error!', err.statusText);
                    return new Promise((_resolve, reject) => {
                        reject(err);
                    });
                }

                console.error('Retry #' + retryCnt + ' after error', err.statusText);
                retryCnt++;

                // call ourselves again after a short delay to do the retry
                // add to the promise chain so still linked to the originally returned promise
                return delay(retryDelay).then(run);
            });
        }
        return run();
    }

    const makeApiRequest = async (requestType, apiUrl, headers, requestPayload) => {

        return new Promise((resolve, reject) => {

            let body = null;

            if (requestPayload != null || requestPayload != undefined) {

                // If headers are null, create new headres
                // Else append content type headers
                if (!headers) {
                    headers = new Headers();
                }

                headers.append("Content-Type", "application/json");

                body = typeof (requestPayload) == String ? requestPayload : JSON.stringify(requestPayload);
            }

            fetch(apiUrl, {
                method: requestType,
                body: body, // string or object
                headers: headers,

            }).then(result => {

                if (result.status == 201 || result.status == 200) {
                    result.text().then(textResult => {

                        resolve(textResult);
                    }).catch(textError => {

                        reject(textError);
                    });
                } else {

                    reject(result);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }

    // This method is used to show an indicator that chatbot response is in progress
    function chatLoader() {
        let chatMessageWrapperStartingDivHtmlContent =
            getChatMessageWrapperStartingDivHtmlContent(true, "responseLoader", "conversationsWrapper"); // Main chat message wrapper
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

    // This method is used to hide the chatbot response in progress indicator
    function hideChatLoader() {
        $("#chatbotMessageWrapper-responseLoader").remove();
    }

    /**
     * This method is used to enable/disable send button
     * Button will be enabled if there is a value entered by user, else it will remain disabled.
     * @param {any} textValue
     */
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

    //Reusable methods to set html content to show chat messages by user as well as chatbot - START
    /**
     * This method is used to get html content for chat message wrapper
     * @param {any} isSystemMessage
     * @param {any} customId
     * @returns
     */
    function getChatMessageWrapperStartingDivHtmlContent(
        isSystemMessage,
        customId,
        customClass
    ) {
        var systemMessageBackgroundClass =
            isSystemMessage == true ? "system-msg-bg" : "";
        var customChatMessageWrapperId =
            customId != null || customId != undefined ? "id='" + "chatbotMessageWrapper-" + customId + "'" : "";

        var customChatMessageWrapperClass = customClass != null || customClass != undefined ? (customClass + " ") : " ";

        return (
            "<div class='my-msg-content chatbot-message-wrapper " + customChatMessageWrapperClass +
            systemMessageBackgroundClass +
            "'" +
            customChatMessageWrapperId +
            ">"
        );
    }

    /**
     * This method is used to get closing div html content
     * @returns
     */
    function getClosingDivHtmlContent() {
        return "</div>";
    }

    /**
     * This method is used to get starting span tag html content
     * @returns
     */
    function getStartingSpanHtmlContent() {
        return "<span>";
    }

    /**
     * This method is used to get closing span tag html content
     * @returns
     */
    function getClosingSpanHtmlContent() {
        return "</span>";
    }

    /**
     * This method is used to get chat message wrapper column 2 part html content.
     * Message text will be showing inside this div in html
     * @returns
     */
    function getChatMessageWrapperColumnTwoStartingDivHtmlContent() {
        return "<div class='chatbot-message-wrapper-column-two'>";
    }

    /**
     * This method is used to get chat message wrapper column 3 html content
     * which will be used to show action buttons such as message play as audio icon, like dislike buttons.
     * @returns
     */
    function getChatMessageWrapperColumnThreeStartingDivHtmlContent() {
        return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three me-md-2'>";
    }

    function getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent() {
        return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three-part-two me-md-2'>";
    }

    /**
     * This method is used to get html content for chatbot logo
     * @returns
     */
    function getChatbotLogoHtmlContent() {

        return "<img src='" + chatbotLogoImagePath + "' class='chatbot-message-wrapper-column-one'>";
    }

    /**
     * This method is used to get html content for user logo
     * @returns
     */
    function getUserLogoHtmlContent() {
        return "<img src='../Content/images/user.svg' class='chat-dp-img-width user-avatar-img rounded-circle chatbot-message-wrapper-column-one'>";
    }

    /**
     * This method is used to get html content for audio message image icon
     * @param {any} audioId
     * @returns
     */
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

    /**
     * This method is used to get html content for displaying feedback action buttons
     * @param {any} messageId
     * @returns
     */
    function getFeedbackButtonsHtmlContent(messageId) {
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

    /**
     * This method is used to get html content to display chatbot typing indicator
     * @returns
     */
    function getChatbotRespondingIndicatorHtmlContent() {
        return "<div class='ms-2 dot-flashing'></div>";
    }

    /**
     * This method is used to get html content to display popular question
     * @param {any} popularQuestion
     * @returns
     */
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
    let chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent =
        getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(); // Third column inside chat message wrapper
    let spanStartingHtmlContent = getStartingSpanHtmlContent();
    let spanClosingHtmlContent = getClosingSpanHtmlContent();
    let closingDivHtmlContent = getClosingDivHtmlContent();

    /**
     * This method is used to update the translation in ui whenever language is changed
     * @param {any} translationsToUpdate
     */
    function updateTranslations(translationsToUpdate) {

        translations = translationsToUpdate;

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
            {
                translationKey: "message_resend_otp",
                htmlElementKeyName: "resend-otp-translation",
                htmlElementKeyAttributeType: "#",
                htmlElementValueAttributeType: "value",
            },
            {
                translationKey: "error_default_message",
                htmlElementKeyName: "default-chatbot-error-message",
                htmlElementKeyAttributeType: "#",
                htmlElementValueAttributeType: "value",
            },
            {
                translationKey: "message_ask_ur_question",
                htmlElementKeyName: "default-placeholder-message",
                htmlElementKeyAttributeType: "#",
                htmlElementValueAttributeType: "value",
            },
            {
                translationKey: "message_confirmation",
                htmlElementKeyName: "message-confirmation",
                htmlElementKeyAttributeType: "#",
                htmlElementValueAttributeType: "text",
            },
            {
                translationKey: "message_session_restart_confirmation_message",
                htmlElementKeyName: "chatbot-restart-session-confirmation-message",
                htmlElementKeyAttributeType: "#",
                htmlElementValueAttributeType: "text",
            },
            {
                translationKey: "label_yes",
                htmlElementKeyName: "yesLabel",
                htmlElementKeyAttributeType: ".",
                htmlElementValueAttributeType: "text",
            },
            {
                translationKey: "label_no",
                htmlElementKeyName: "noLabel",
                htmlElementKeyAttributeType: ".",
                htmlElementValueAttributeType: "text",
            }

        ];

        for (var i = 0; i < translationsToUpdate.length; i++) {
            // Get the current translation's html element related details from "translationsMappingIds" so we can know which html element we need to update for the translations
            let currentTranslation = translationsToUpdate[i];

            let currentTranslationMappingDetails = translationsMappingIds.find(
                (f) => f.translationKey == currentTranslation.Key
            );

            if (currentTranslationMappingDetails) {

                // Update page title
                if (currentTranslationMappingDetails.translationKey == "label_title") {
                    document.title = currentTranslation.Value;
                }

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

    /**
     * This method is used to listen langugage change event
     */
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

    /**
     * This method is used to listen popular question click event, 
     * It will copy clicked question to user question text box
     */
    function popularQuestionClickListener() {
        $("#popularQuestion").click(function (event) {
            event.stopPropagation()
            let popularQuestion = $(this).data("popular-question");
            copyPopularQuestionInTextBox(popularQuestion);
        });
    }

    /**
     * This method is used to listen restart session button click event
     */
    function restartSessionButtonOnClickListener() {
        $("#restartSessionButton").click(function (e) {
            restartSession(true);
        });
    }

    /**
     * This method is used to listen action button click events 
     * Actions like, play message as audio, like, dislike or unlike chatbot response
     */
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
    }

    function chatbotConfirmationModalCloseEventListener() {
        $(document).on("click", "#chatbotConfirmationModalSaveButton", function (ev) {
            let modalType = $(this).data("modal-type");

            //chatbotConfirmationModal.hide();

            if (modalType == "restart-session") {
                restartSession();
            }

        });
    }

    function userQuestionTextBoxOnKeyPressListener() {
        $(userQuestionTextBox).keypress(function (event) {
            if (event.keyCode == 13 || event.key == "Enter") {
                event.stopPropagation();
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

        const controller = new AbortController();
        const signal = controller.signal;

        languageChangeListener();
        popularQuestionClickListener();
        userQuestionTextBoxOnKeyPressListener();
        chatbotMessageActionButtonsOnClickListener();
        restartSessionButtonOnClickListener();
        resendOtpOnClickListener();
        popularQuestionsOnClickListener();
        initAutoSizeInputBox();
        chatbotConfirmationModalCloseEventListener();

        // Check if maintenance mode is on or not
        // If on, we need to show maintenance mode modal
        // And disable all the functionalities
        const isMaintenanceModeOn = $("#isMaintenanceModeOn").val();
        if (isMaintenanceModeOn == "True") {
            showMaintenanceModeModal();
        }
    }

    function showMaintenanceModeModal() {
        maintenanceModeModal = new bootstrap.Modal('#' + maintenanceModeModalId, modalOptions);

        //$("#chatbot-restart-session-confirmation-message").append(confirmationMessage);
        maintenanceModeModal.show();
    }

    function initAutoSizeInputBox() {
        autosize($(userQuestionTextBox));
    }

    function updateChatMessagesList(
        message,
        messageId,
        messageType,
        isMessageFromBot,
        showAudioOption
    ) {
        if (message != "") {
            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(isMessageFromBot, messageId, "conversationsWrapper"); // Main chat message wrapper

            let chatMessageAudioImageHtmlContent = showAudioOption == true ?
                getChatMessageAudioImageHtmlContent(messageId) : null; // Audio icon inside third column

            let feedbackOptionHtmlContent = getFeedbackButtonsHtmlContent(messageId);

            var response =
                chatMessageWrapperStartingDivHtmlContent +
                chatbotLogoHtmlContent +
                chatMessageWrapperColumnTwoStartingDivHtmlContent +
                spanStartingHtmlContent +
                message +
                spanClosingHtmlContent +
                closingDivHtmlContent +
                (showAudioOption == true ?
                    (chatMessageWrapperColumnThreeStartingDivHtmlContent +
                        chatMessageAudioImageHtmlContent +
                        closingDivHtmlContent) : "") +

                (messageType == "final_response" && isMessageFromBot == true ?
                    (chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent +
                        feedbackOptionHtmlContent +
                        closingDivHtmlContent) : "") +

                closingDivHtmlContent;


            // Format message if it is from chatbot
            if (isMessageFromBot == true) {
                response = formatChatbotResponse(response);
            }

            $("#message-list").append(response.replace(/\n/g, "<br>"));

            if (messageType == "final_response") {
                sessionStorage.setItem("final_response", true);
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

        getTextToSpeechFromBhashini();

        enableDisableSendButton();

        $(userQuestionTextBox).on("change paste keyup", function (event) {

            if (event.type == "keyup" && (isSampleQueryUsed == false && event?.originalEvent?.key != "Enter")) {
                isUserTypedQuestion = true;
            } else {
                isUserTypedQuestion = false;
            }
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

        // To listen click event on send user question button
        $(function () {
            $("body").on("click", sendTextButtonId, function (e) {
                e.preventDefault();
                let questionInput = $(userQuestionTextBox).val();

                var questionInputContent = $("<div />").text(questionInput).html();
                if (questionInputContent) {
                    let chatMessageWrapperStartingDivHtmlContent =
                        getChatMessageWrapperStartingDivHtmlContent(false, null, "conversationsWrapper"); // Main chat message wrapper

                    let chatMessageAudioImageHtmlContent =
                        getChatMessageAudioImageHtmlContent(lastUserTypedMessageId); // Audio icon inside third column

                    var userQuery = "";

                    userQuery =
                        chatMessageWrapperStartingDivHtmlContent +
                        userLogoHtmlContent +
                        chatMessageWrapperColumnTwoStartingDivHtmlContent +
                        spanStartingHtmlContent +
                        questionInputContent +
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

                askQuestions(questionInputContent, "text");
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
        isSampleQueryUsed = true;
    }

    /**
     * This method is used to process the chat bot response, 
     * We need to format it, show it in UI, Check whether it is invalid OTP related message or not then show it in different format
     * @param {any} message
     * @param {any} messageId
     * @param {any} messageType
     * @param {any} textInEnglish
     */
    function processChatBotResponse(
        message,
        messageId,
        messageType,
        textInEnglish,
        showAudioOption
    ) {
        if (message != "") {
            updateChatMessagesList(message, messageId, messageType, true, showAudioOption);
        }

        if (
            String(textInEnglish)
                .toLowerCase()
                .indexOf("one time password is wrong") >= 0
        ) {
            var resendOtpTranslation = $("#resend-otp-translation").val();

            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(true, "resendOtp", "conversationsWrapper"); // Main chat message wrapper

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

    function resendOTP(element) {
        $("#chatbotMessageWrapper-resendOtp").remove();
        askQuestions("resend OTP", "text");
    }

    /**
     * This method is used to foramt the chat bot response, 
     * We need to display aadhar information in different format.
     * If there are any texts with *anyword*, we need to display those words in bold letters.
     * All such formatting will happen inside this method.
     * @param {any} response
     * @returns
     */
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

    function addMatricsCount(matricsType) {

        const apiUrl = apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.MatricsIncrement;
        const headers = new Headers();
        headers.append("User-id", currentUserId);

        makeRequestRetry("POST", apiUrl, headers, matricsType).then(apiResponse => {

        }).catch(apiError => {

        });
    }

    function handleError(error) {
        hideChatLoader();

        if (error?.status == 502) {

            addMatricsCount("badGateway");
        } else if (error?.status == 504) {

            addMatricsCount("gatewayTimeoutCount");
        } else {
            addMatricsCount("internalServerError");
        }

        var defaultChatbotErrorMessage = $("#default-chatbot-error-message").val();

        const currentDateTime = new Date().getTime().toString();

        processChatBotResponse(defaultChatbotErrorMessage, currentDateTime);

        scrollToBottom();
    }

    function askQuestions(input, category, blob) {

        let isFinalResponseReceived = false;

        if (category == "text") {

            clearSessionRestartAutoTimeout();

            let finalResponse = sessionStorage.getItem("final_response");

            if (finalResponse != undefined && finalResponse != null) {
                isFinalResponseReceived = true;
            }

            sessionStorage.removeItem("final_response");

            if (isUserTypedQuestion == true) {
                addMatricsCount("directMessageTypedCount");
                isUserTypedQuestion = false;
            } else if (isSampleQueryUsed == true) {
                addMatricsCount("sampleQueryUsedCount");
            }

            $(userQuestionTextBox).val("");
            $(userQuestionTextBox).trigger("change");
        }

        chatLoader();

        scrollToBottom();

        function prompt() {
            const apiUrl = apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.Prompt + apiUrlConfig.ApiVersion;
            const headers = new Headers();
            headers.append("User-id", currentUserId);


            let currentLanguageCultureCode = $('.language-buttons').data("current-language-culture-code");

            const requestPayload = {
                text: category == "text" ? input : null,
                media: category == "base64audio" ? { category: "base64audio", text: input } : null,
                location: null,
                contactCard: null,
                buttonChoices: null,
                stylingTag: null,
                flow: "",
                mediaCaption: "",
                inputLanguage: currentLanguageCultureCode
            };

            makeRequestRetry("POST", apiUrl, headers, requestPayload).then(apiResponse => {

                hideChatLoader();

                const data = JSON.parse(apiResponse);

                var message = "";

                if (data.error !== null) {

                    // Show default error message
                    var defaultChatbotErrorMessage = $("#default-chatbot-error-message").val();
                    processChatBotResponse(defaultChatbotErrorMessage, data.messageId, data.messageType);
                } else {

                    if (category == "base64audio") {

                        loadAudioPlayer(blob, data.messageId, "right conversationsWrapper");
                        lastUserTypedMessageId = data.messageId;

                        if (data.text) {

                            message = data.text;
                            $(userQuestionTextBox).val(message);
                            $(userQuestionTextBox).focus();
                            $(userQuestionTextBox).trigger("change");
                        }

                    } else {

                        const contentType = "audio/wav";

                        if (data?.audio?.text) {
                            const blob = b64toBlob(data.audio.text, contentType);
                            loadAudioPlayer(blob, data.messageId, "left conversationsWrapper");
                        }

                        if (data.text !== null) {

                            changeInputPlaceholderValue(data.placeholder);

                            if (data.text !== null) {
                                message = data.text;
                                processChatBotResponse(
                                    data.text,
                                    data.messageId,
                                    data.messageType,
                                    data.textInEnglish,
                                    true
                                );
                            }
                        }
                    }
                }

                scrollToBottom();

                if (category == "text") {
                    setSessionAutoRestartTimeout();
                }

            }).catch(apiError => {
                handleError(apiError);
            });
        }

        if (isFinalResponseReceived == true) {
            const fingerPrintId = sessionStorage.getItem("fingerPrintId");

            createSession(fingerPrintId).then((sessionResult) => {
                prompt();
            }).catch((sessionError) => {
                handleError(sessionError);
            });
        } else {
            prompt();
        }
    }

    function likeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var likeButtonSource = $("#thumbLikeButton-" + messageId)[0].src;

        var likeMessageApiEndPoint = "like";
        var likeImageToReplace = thumbLikeHighlightImagePath;

        var isLikeHighlight = false;

        if (likeButtonSource.indexOf("fill") >= 0) {
            isLikeHighlight = true;

            likeMessageApiEndPoint = "removelike";
            likeImageToReplace = thumbLikeImagePath;
        }

        const apiUrl = apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.Message + likeMessageApiEndPoint + "/" + messageId;
        const headers = new Headers();
        headers.append("User-id", currentUserId);

        makeRequestRetry("GET", apiUrl, headers).then(apiResponse => {
            hideChatLoader();
            const data = JSON.parse(apiResponse);

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

        }).catch(apiError => {
            handleError(apiError);
        });
    }

    function dislikeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var dislikeButtonSource = $("#thumbDislikeButton-" + messageId)[0].src;

        var dislikeMessageApiEndPoint = "dislike";
        var dislikeImageToReplace = thumbDislikeHighlightImagePath;
        var isDislikeHighlight = false;
        if (dislikeButtonSource.indexOf("fill") >= 0) {
            isDislikeHighlight = true;

            dislikeMessageApiEndPoint = "removelike";
            dislikeImageToReplace = thumbDislikeImagePath;
        }

        const apiUrl = apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.Message + dislikeMessageApiEndPoint + "/" + messageId;

        const headers = new Headers();
        headers.append("User-id", currentUserId);

        makeRequestRetry("GET", apiUrl, headers).then(apiResponse => {
            hideChatLoader();

            const data = JSON.parse(apiResponse);

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

        }).catch(apiError => {

            handleError(apiError);
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

    async function startRecording() {

        // Record matrics
        addMatricsCount("micUsedCount");

        var chunks = [];
        var arrayBufferData;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then(stream => {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.start();

                mediaRecorder.ondataavailable = async (e) => {

                    arrayBufferData = await e.data.arrayBuffer();

                    chunks.push(e.data);

                    const blob = new Blob(chunks);

                    const encodedBlob = await getWaveBlob(blob, false, arrayBufferData);

                    createDownloadLink(encodedBlob);

                    chunks = [];
                }

                mediaRecorder.onstop = async (e) => {
                }
            }).catch(error => {
                handleError(error);

            })
        }
    }

    async function stopRecording() {
        mediaRecorder.stop();
    }

    function createDownloadLink(blob) {
        var reader = new window.FileReader();

        reader.readAsDataURL(blob);

        reader.onloadend = async function () {

            base64 = reader.result;

            base64 = base64.split(",")[1];
            scrollToBottom();

            askQuestions(base64, "base64audio", blob);
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

        playAudio("language-labels-" + LanguageEnglishLabel + "-audio");

        isChangeLanguageRequestInProgress = $.ajax({
            type: "POST",
            url: currentParentRoute + "ChangeLanguage",
            dataType: "json",
            data: { lang: languageCultureCode },
            success: function (data) {

                //If language is changed after session refresh was done,
                //Add metric count for it

                if (currentUserId != previousUserId) {
                    addMatricsCount("stage2Count");
                }

                isChangeLanguageRequestInProgress = null;

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
                    true,
                    true
                );

                // Update selected language buttons and labels to update the selected language in UI.
                updateSelectedLanguageInUI(languageCultureCode, languageCultureLabel);

                updateTranslations(data.Data.Translations);

                updatePopularQuestionsTranslations(data.Data.PopularQuestions);
                showUserRecordedMessageInTextBox("");

                previousUserId = currentUserId;

            },
            failure: function (data) {
                isChangeLanguageRequestInProgress = null;
                alert("oops something went wrong");
            },
        });
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
        isGetWelcomeGreetingsTextToSpeechRequestInProgress = $.ajax({
            type: "POST",
            url: currentParentRoute + "GetWelcomeGreetingsTextToSpeech",
            dataType: "json",
            success: function (data) {
                isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;
                initWelcomeGreetingAudioConfig(data.Data, isLanguageChanged);
            },
            failure: function (data) {
                isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;
                alert("oops something went wrong");
            },
        });
    }

    function getTextToSpeechFromBhashini() {
        isGetTextToSpeechFromBhashiniRequestInProgress = $.ajax({
            type: "POST",
            url: currentParentRoute + "GetTextToSpeechFromBhashini",
            dataType: "json",
            success: function (data) {
                isGetTextToSpeechFromBhashiniRequestInProgress = null;
                initGeneralAudioConfig(data.Data);
            },
            failure: function (data) {
                isGetTextToSpeechFromBhashiniRequestInProgress = null;
                alert("oops something went wrong");
            },
        });
    }

    function initGeneralAudioConfig(data) {
        // Get welcoome note and language greeting text audio
        var textsToGetSpeech = [];

        for (var i = 0; i < data.length; i++) {
            let currentData = data[i];

            textsToGetSpeech.push({
                id: currentData.Key + "-audio",
                value: currentData.Value,
            });
        }

        const contentType = "audio/wav";

        if (textsToGetSpeech.length > 0) {
            for (var i = 0; i < textsToGetSpeech.length; i++) {
                var currentBase64String = textsToGetSpeech[i];
                const blob = b64toBlob(currentBase64String.value, contentType);

                loadAudioPlayer(blob, currentBase64String.id, "left");
            }
        }
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

        if (currentAudioIdElement.paused == false) {
            currentAudioIdElement.pause();

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
    function restartSession(showConfirmation) {

        function proceedForSessionRestart() {
            scrollToBottom();
            clearChatHistory();
            const fingerPrintId = sessionStorage.getItem("fingerPrintId");

            createSession(fingerPrintId).then((sessionResult) => {
            }).catch((sessionError) => {
                handleError(sessionError);
            });
        }
        if (showConfirmation == true) {
            const confirmationMessage = $("#chatbot-restart-session-confirmation-message").val();
            showChatbotConfirmationModal('restart-session', confirmationMessage, (data => {

            }));
        } else {
            proceedForSessionRestart();
        }
    }

    function clearChatHistory() {
        $('.conversationsWrapper').remove();
        var defaultPlaceholderMessage = $("#default-placeholder-message").val();
        changeInputPlaceholderValue(defaultPlaceholderMessage);
        showPopularQuestions();
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

    function changeInputPlaceholderValue(valuetoChange) {
        $(userQuestionTextBox).attr(
            "placeholder",
            valuetoChange != undefined ? valuetoChange : "Ask your question"
        );
    }

    function showChatbotConfirmationModal(type, confirmationMessage, closeCallback) {

        $('#chatbotConfirmationModalSaveButton').data("modal-type", type);

        chatbotConfirmationModal = new bootstrap.Modal('#' + chatbotConfirmationModalId, modalOptions);

        $("#chatbot-restart-session-confirmation-message").append(confirmationMessage);
        chatbotConfirmationModal.show();

        chatbotConfirmationModalElement.addEventListener('hidden.bs.modal', event => {
            closeCallback(event);
            // do something...
        })
    }

    function setSessionAutoRestartTimeout() {
        sessionAutoRestartTimeoutId = setTimeout(() => {
            restartSession(false);
        }, 10000 * 300);
    }

    function clearSessionRestartAutoTimeout() {
        if (sessionAutoRestartTimeoutId) {
            clearTimeout(sessionAutoRestartTimeoutId);
            sessionAutoRestartTimeoutId = null;
        }
    }
})();
