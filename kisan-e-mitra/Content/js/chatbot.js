(async function () {


    var apiUrlConfig = {
        //chatbotApiBaseUrl: "https://apichatbot.pmkisan.gov.in/", // Live //https://bff.agrimitra.samagra.io/
        chatbotApiBaseUrl: 'https://bff.agrimitra.samagra.io/', // Stage //
        userApiBaseEndPoint: 'user/',
        generateUserId: 'user/generateUserId',
        Prompt: 'prompt',
        ChatHistory: 'history',
        ApiVersion: '/3',
        Message: 'user/message/',
        MetricsIncrement: 'custom/metrics/increment',
        ConversationFeedback: 'conversation/feedback',
    };

    var allLanguagesTranslations = [
        {
            language: 'english',
            languageLabel: 'English',
            languageCode: 'en',
            translations: null
        },
        {
            language: 'bangla',
            languageLabel: 'Bangla',
            languageCode: 'bn',
            translations: null
        },
        {
            language: 'gujarati',
            languageLabel: 'Gujarati',
            languageCode: 'gu',
            translations: null
        },
        {
            language: 'hindi',
            languageLabel: 'Hindi',
            languageCode: 'hi',
            translations: null
        },
        {
            language: 'kannada',
            languageLabel: 'Kannada',
            languageCode: 'kn',
            translations: null
        },
        {
            language: 'malayalam',
            languageLabel: 'Malayalam',
            languageCode: 'ml',
            translations: null
        },
        {
            language: 'marathi',
            languageLabel: 'Marathi',
            languageCode: 'mr',
            translations: null
        },
        {
            language: 'odia',
            languageLabel: 'Odia',
            languageCode: 'or',
            translations: null
        },
        {
            language: 'punjabi',
            languageLabel: 'Punjabi',
            languageCode: 'pa',
            translations: null
        },
        {
            language: 'tamil',
            languageLabel: 'Tamil',
            languageCode: 'ta',
            translations: null
        },
        {
            language: 'telugu',
            languageLabel: 'Telugu',
            languageCode: 'te',
            translations: null
        }

    ];

    marked.use({
        breaks: true,
        gfm: true
    });

    let latitude;
    let longitude;

    var currentParentRoute = "/Home/";

    var isRecording = false;
    var tour;

    var sessionAutoRestartTimeoutId;

    var isChangeLanguageRequestInProgress = null;

    var isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;

    var isGetTextToSpeechFromBhashiniRequestInProgress = null;

    var translations = [];
    let currentLanguageInfo = {
        currentLanguageCode: '',
        language: '',
        translations: {
            errors: {},
            lables: {},
            messages: {},
            schemes: {},
            toasts: {}
        }
    };

    var currentUserId = null;
    var previousUserId = null;
    var sessionId = null;
    var previousSessionId = null;
    var currentConversationId = null;

    var chatbotConfirmationModalId = 'chatbotConfirmationModal';
    var maintenanceModeModalId = 'maintenanceModeModal';
    var submitFeedbackModalId = 'submitFeedbackModal';
    var submitFeedbackModal;
    const feedbackModalOptions = {
        backdrop: true,
        keyboard: false,
    };
    submitFeedbackModal = new bootstrap.Modal(
        '#' + submitFeedbackModalId,
        feedbackModalOptions
    );

    var userQuestionTextBox = '#userQuestionTextBox'; // This variable is used to listen any events on user question text box where user will type the question
    var userQuestionTextBoxClass = '.userQuestionTextBoxClass';

    var startAudioImagePath = '../Content/images/start-audio.svg';
    var stopAudioImagePath = '../Content/images/stop-audio.svg';
    var thumbDislikeImagePath = '../Content/images/hand-thumbs-down.svg';
    var thumbDislikeHighlightImagePath =
        '../Content/images/hand-thumbs-down-fill.svg';
    var thumbLikeImagePath = '../Content/images/hand-thumbs-up.svg';
    var thumbLikeHighlightImagePath = '../Content/images/hand-thumbs-up-fill.svg';
    var chatbotLogoImagePath = '../Content/images/chatbot.png'; //"../Content/images/MOA_logo.png";

    // Voice Recording button related variables - To Apply animation, change icon images etc. - START
    var voiceRecordButtonClass = '.voiceRecordButtonClass';
    var voiceRecordingImageClass = '.recordingImageClass';
    var stopVoiceRecordingImagePath = '../Content/images/stop-recording.svg';
    var startVoiceRecordingImagePath = '../Content/images/start-recording.svg';
    var voiceRecordMicCircleClass = '.voiceRecordMicCircleClass';
    var voiceRecordingStartBgColorClass = 'voice-start-recording-border-color';
    var voiceRecordingStopBgColorClass = 'voice-stop-recording-border-color';
    // Voice Recording button related variables - To Apply animation, change icon images etc. - END

    var sendTextButtonId = '#sendTextButton';
    var mediaRecorder;

    // shim for AudioContext when it's not avb.
    var previousPlayingMessageId = ''; // To maintain previous playing message id. So when user tries to play another message in middle of current playing message
    var lastUserTypedMessageId = '';
    // We need to stop current playing message.
    var isUserTypedQuestion = false;
    var isSampleQueryUsed = false;

    const chatbotConfirmationModalElement = document.getElementById(
        chatbotConfirmationModalId
    );
    const submitFeedbackModalElement = document.getElementById(
        submitFeedbackModalId
    );

    const modalOptions = {
        backdrop: 'static',
        keyboard: false,
    };
    var selectedLanguageCultureCodeTemplateVarId =
        '{{selectedLanguageCultureCode}}';
    var welcomeGreetingMessageBase64StringName =
        'welcome-greeting-message-base64-{{selectedLanguageCultureCode}}-audio';

    var chatbotConfirmationModal;
    var currentConversationId;

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

        if (isGetUITranslationsRequestInProgress) {
            isGetUITranslationsRequestInProgress.abort();
        }

        restartSession();
    };

    onstorage = (event) => {
        onFingerPrintIdCreated();
    };

    function onFingerPrintIdCreated() {
        let fingerPrintId = sessionStorage.getItem('fingerPrintId');

        if (fingerPrintId != null || fingerPrintId != undefined) {
            createSession(fingerPrintId, true);
        }
    }

    // Generate a UUID using timestamp and random numbers
    /**
     * function generates a unique identifier (UUID) using a combination of the current timestamp and a random number.
     * The function gets the current timestamp using new Date().getTime().
     * It generates a random number between 0 and 16 using Math.random() * 16.
     * It calculates the remainder of the random number divided by 16 using the modulo operator %.
     * It converts the remainder to an integer using the bitwise OR operator | and the 0x3 and 0x8 hexadecimal values.
     * It converts the integer to a hexadecimal string using the toString(16) method.
     * It replaces the 'x' and 'y' characters in the UUID template with the generated hexadecimal string.
     * It returns the generated UUID.
     * @returns  string representing a unique identifier (UUID).
     */
    function generateUUID() {

        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    /**
     * Creates a session for the given fingerprint ID.
     *
     * @param {string} fingerPrintId - The fingerprint ID used to create the session.
     * @returns {Promise} - A promise that resolves when the session is created.
     */
    function createSession(fingerPrintId, shouldGenerateUserId) {

        sessionId = generateUUID();

        const apiUrl =
            apiUrlConfig.chatbotApiBaseUrl +
            apiUrlConfig.generateUserId +
            '/' +
            fingerPrintId;

        return new Promise((resolve, reject) => {

            if (shouldGenerateUserId) {
                makeRequestRetry('POST', apiUrl)
                    .then((apiResponse) => {
                        currentUserId = apiResponse;



                        resolve();
                    })
                    .catch((apiError) => {
                        handleError(apiError);

                        reject();
                    });
            } else {
                resolve();
            }
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
    function makeRequestRetry(
        requestType,
        apiUrl,
        headers,
        requestPayload,
        maxRetry = 0,
        retryDelay = 3000
    ) {
        let retryCnt = 0;

        function delay(t) {
            return new Promise((resolve) => {
                setTimeout(resolve, t);
            });
        }

        function run() {
            return makeApiRequest(requestType, apiUrl, headers, requestPayload).catch(
                function (err) {
                    if (retryCnt >= maxRetry) {
                        console.error(
                            'Max retries exceeded. There was an error!',
                            err.statusText
                        );
                        return new Promise((_resolve, reject) => {
                            reject(err);
                        });
                    }

                    console.error('Retry #' + retryCnt + ' after error', err.statusText);
                    retryCnt++;

                    // call ourselves again after a short delay to do the retry
                    // add to the promise chain so still linked to the originally returned promise
                    return delay(retryDelay).then(run);
                }
            );
        }
        return run();
    }

    /**
     * Makes an API request using the Fetch API.
     * @param {string} requestType - The type of the API request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
     * @param {string} apiUrl - The URL of the API endpoint.
     * @param {Headers} headers - The headers to be included in the API request.
     * @param {string|object} requestPayload - The payload to be sent with the API request.
     * @returns {Promise} - Resolves with the response text if the API request is successful, or rejects with the response object if the API request fails.
     */
    const makeApiRequest = async (
        requestType,
        apiUrl,
        headers,
        requestPayload
    ) => {
        return new Promise((resolve, reject) => {
            let body = null;

            if (requestPayload != null || requestPayload != undefined) {
                // If headers are null, create new headers
                // Else append content type headers
                if (!headers) {
                    headers = new Headers();
                }

                headers.append('Content-Type', 'application/json');

                body =
                    typeof requestPayload == String
                        ? requestPayload
                        : JSON.stringify(requestPayload);
            }

            fetch(apiUrl, {
                method: requestType,
                body: body, // string or object
                headers: headers,
                cache: 'no-cache'
            })
                .then((result) => {
                    if (result.status == 201 || result.status == 200) {
                        result
                            .text()
                            .then((textResult) => {
                                resolve(textResult);
                            })
                            .catch((textError) => {
                                reject(textError);
                            });
                    } else {
                        reject(result);
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    // This method is used to show an indicator that chatbot response is in progress
    function chatLoader() {
        let chatMessageWrapperStartingDivHtmlContent =
            getChatMessageWrapperStartingDivHtmlContent(
                true,
                'responseLoader',
                'conversationsWrapper'
            ); // Main chat message wrapper
        let chatbotRespondingHtmlContent =
            getChatbotRespondingIndicatorHtmlContent();

        const responseLoader =
            chatMessageWrapperStartingDivHtmlContent +
            chatMessageWrapperColumnTwoStartingDivHtmlContent +
            startingDivHtmlContent +
            chatbotLogoHtmlContent +
            spanStartingHtmlContent +
            chatbotRespondingHtmlContent +
            spanClosingHtmlContent +
            closingDivHtmlContent +
            closingDivHtmlContent +
            closingDivHtmlContent +
            chatMessageWrapperColumnThreeStartingDivHtmlContent +
            closingDivHtmlContent +
            closingDivHtmlContent;

        $('#message-list').append(responseLoader);
    }

    // This method is used to hide the chatbot response in progress indicator
    function hideChatLoader() {
        $('#chatbotMessageWrapper-responseLoader').remove();
    }

    /**
     * This method is used to enable/disable send button
     * Button will be enabled if there is a value entered by user, else it will remain disabled.
     * @param {any} textValue
     */
    function enableDisableSendButton(textValue) {
        let trimmedTextValue = textValue?.trim();

        if (
            trimmedTextValue != undefined &&
            trimmedTextValue != null &&
            trimmedTextValue != ''
        ) {
            $(sendTextButtonId).css({ opacity: 1 });
            $(sendTextButtonId).prop('disabled', false);
        } else {
            $(sendTextButtonId).css({ opacity: 0.4 });
            $(sendTextButtonId).prop('disabled', true);

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
            isSystemMessage == true ? 'system-msg-bg' : '';
        var customChatMessageWrapperId =
            customId != null || customId != undefined
                ? "id='" + 'chatbotMessageWrapper-' + customId + "'"
                : '';

        var customChatMessageWrapperClass =
            customClass != null || customClass != undefined ? customClass + ' ' : ' ';

        return (
            "<div class='my-msg-content chatbot-message-wrapper " +
            customChatMessageWrapperClass +
            systemMessageBackgroundClass +
            "'" +
            customChatMessageWrapperId +
            '>'
        );
    }

    function getStartingDivHtmlContent() {
        return '<div>';
    }
    /**
     * This method is used to get closing div html content
     * @returns
     */
    function getClosingDivHtmlContent() {
        return '</div>';
    }

    /**
     * This method is used to get starting span tag html content
     * @returns
     */
    function getStartingSpanHtmlContent(customId) {
        var customSpanWrapperId =
            customId != null || customId != undefined
                ? "id='" + 'chat-message-span-wrapper-' + customId + "'"
                : '';

        return "<span class='chat-message-span-wrapper'" +
            " " +
            customSpanWrapperId +
            ">";
    }

    /**
     * This method is used to get closing span tag html content
     * @returns
     */
    function getClosingSpanHtmlContent() {
        return '</span>';
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

    function getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(customId, keepHidden) {
        return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three-part-two" + (keepHidden == true ? " d-none'" : "'") + (customId ? "id='chatbot-message-wrapper-column-three-part-two" + customId + "'" : "") + "'me-md-2'>";
    }

    function showChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(customId) {
        $('#chatbot-message-wrapper-column-three-part-two' + customId).removeClass('d-none');
    }

    /**
     * This method is used to get html content for chatbot logo
     * @returns
     */
    function getChatbotLogoHtmlContent() {
        return (
            "<img src='" +
            chatbotLogoImagePath +
            "' class='chatbot-message-wrapper-column-one'>"
        );
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
            "src='" +
            thumbLikeImagePath +
            "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='likeMessage'>" +
            "<img id='thumbDislikeButton-" +
            messageId +
            "'" +
            "data-message-id='" +
            messageId +
            "'" +
            "src='" +
            thumbDislikeImagePath +
            "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='dislikeMessage'>"
        );
    }

    /**
     * This method is used to get html content to display chatbot typing indicator
     * @returns
     */
    function getChatbotRespondingIndicatorHtmlContent() {
        return "<div class='ms-2 dot-flashing'></div>";
    }

    function getPopularQuestionsHtmlContent(popularQuestionsList) {

        let popularQuestionsElementsList = [];
        for (var i = 0; i < popularQuestionsList.length; i++) {
            const currentPopularQuestion = popularQuestionsList[i];

            const popularQuestionElementNode = document.createElement('div');
            popularQuestionElementNode.setAttribute("id", currentPopularQuestion.key);
            popularQuestionElementNode.setAttribute("data-popular-question", currentPopularQuestion.value);
            popularQuestionElementNode.className = "query-msg popularQuestions fade-left";

            const popularQuestionParagrapElementNode = document.createElement('p');
            popularQuestionParagrapElementNode.innerHTML = currentPopularQuestion.value;
            popularQuestionElementNode.appendChild(popularQuestionParagrapElementNode);
            popularQuestionsElementsList.push(popularQuestionElementNode);
        }

        return popularQuestionsElementsList;
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
    let startingDivHtmlContent = getStartingDivHtmlContent();
    let closingDivHtmlContent = getClosingDivHtmlContent();

    /**
     * This method is used to update the translation in ui whenever language is changed
     * @param {any} translationsToUpdate
     */
    function updateTranslations(translationsToUpdate) {
        translations = translationsToUpdate;

        let translationsMappingIds = [
            {
                translationType: 'messages',
                translationKey: 'welcome_greeting',
                htmlElementKeyName: 'messageWelcomeGreeting',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'ask_ur_question',
                htmlElementKeyName: 'messageAskUrQuestion',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'placeholder',
            },
            {
                translationType: 'lables',
                translationKey: 'title',
                htmlElementKeyName: 'labelTitle',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'resend_otp',
                htmlElementKeyName: 'resend-otp-translation',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'value',
            },
            {
                translationType: 'errors',
                translationKey: 'default_message',
                htmlElementKeyName: 'default-chatbot-error-message',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'value',
            },
            {
                translationType: 'messages',
                translationKey: 'ask_ur_question',
                htmlElementKeyName: 'default-placeholder-message',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'value',
            },
            {
                translationType: 'messages',
                translationKey: 'confirmation',
                htmlElementKeyName: 'message-confirmation',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'session_restart_confirmation_message',
                htmlElementKeyName: 'chatbot-restart-session-confirmation-message',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'lables',
                translationKey: 'yes',
                htmlElementKeyName: 'yesLabel',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'lables',
                translationKey: 'no',
                htmlElementKeyName: 'noLabel',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'lables',
                translationKey: 'submit',
                htmlElementKeyName: 'submitLabelTranslation',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'feedback_description',
                htmlElementKeyName: 'feedbackTextArea',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'value',
            },
            {
                translationType: 'messages',
                translationKey: 'chatbot_functionality_feedback',
                htmlElementKeyName: 'chatbotFunctionalityFeedback',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'information_feedback',
                htmlElementKeyName: 'informationFeedback',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'translation_feedback',
                htmlElementKeyName: 'translationsFeedback',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'lables',
                translationKey: 'close',
                htmlElementKeyName: 'closeLabelTranslation',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'feedback_title',
                htmlElementKeyName: 'submitFeedbackModalTitle',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
            },
            {
                translationType: 'messages',
                translationKey: 'pm_kisan_scheme',
                htmlElementKeyName: 'pmkisan',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
                ignore: true
            },
            {
                translationType: 'messages',
                translationKey: 'kcc_scheme',
                htmlElementKeyName: 'kcc',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
                ignore: true
            },
            {
                translationType: 'messages',
                translationKey: 'pmfby_scheme',
                htmlElementKeyName: 'pmfby',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text',
                ignore: true
            }
        ];

        for (var i = 0; i < translationsMappingIds.length; i++) {

            let currentTranslationMappingDetails = translationsMappingIds[i];

            let currentTranslation = currentLanguageInfo.translations[currentTranslationMappingDetails.translationType];

            if (currentTranslation && currentTranslation[currentTranslationMappingDetails.translationKey]) {

                const currentTranslationValue = currentTranslation[currentTranslationMappingDetails.translationKey];
                // Update page title
                if (currentTranslationMappingDetails.translationKey == 'title') {
                    document.title = currentTranslationValue;
                }

                if (
                    currentTranslationMappingDetails.htmlElementValueAttributeType ==
                    'text'
                ) {
                    $(
                        currentTranslationMappingDetails.htmlElementKeyAttributeType +
                        currentTranslationMappingDetails.htmlElementKeyName
                    ).html(currentTranslationValue);
                } else {
                    $(
                        currentTranslationMappingDetails.htmlElementKeyAttributeType +
                        currentTranslationMappingDetails.htmlElementKeyName
                    ).attr(
                        currentTranslationMappingDetails.htmlElementValueAttributeType,
                        currentTranslationValue
                    );
                }
            }
            else {
                console.log('translation missing: ', currentTranslationMappingDetails);
            }
        }

        initAppTour();
    }

    /**
     * This method is used to listen language change event
     */
    function languageChangeListener() {

        $(document).on(
            'click',
            '.languagesLabels',
            function (ev) {
                let languageCultureCode = $(this).data('language-culture-code');
                let languageEnglishLabel = $(this).data('language-english-label');
                let languageCultureLabel = $(this).data('language-culture-label');
                let currentLanguageCultureCode = $(this).data(
                    'current-language-culture-code'
                );


                hideAllThePopovers();
                changeLanguage(
                    languageCultureCode,
                    languageEnglishLabel,
                    languageCultureLabel,
                    currentLanguageCultureCode
                );
            }
        );
    }

    /**
     * This method is used to listen scheme change event
     */
    function schemeChangeListener() {

        $(document).on(
            'click',
            '.schemeEventListener',
            async function (ev) {
                let selectedSchemeId = $(this).data('scheme-id');

                const languageCultureCode = getSetCurrentLanguageCode();

                // Remove previous language changed message
                let previousLanguageChangedMessageId =
                    '#chatbotMessageWrapper-language-change-greeting-message-base64-' +
                    languageCultureCode +
                    '-audio';
                $(previousLanguageChangedMessageId).remove();

                hideAllThePopovers();

                // Proceed ahead only if selected scheme is different than previous one
                if (selectedSchemeId != schemesInfo.currentScheme) {

                    schemesInfo.bindSchemesToDropdown(schemesInfo.list, selectedSchemeId);
                    bindPopularQuestions();



                    // Get current language change message
                    const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.language_changed_greeting;
                    // Add language change message to chat screen
                    updateChatMessagesList(
                        currentLanguageChangeMessage,
                        'language-change-greeting-message-base64-' +
                        languageCultureCode +
                        '-audio',
                        '',
                        true,
                        true
                    );
                }
            }
        );
    }

    function voiceRecorderListener() {

        $(document).on(
            'click',
            voiceRecordButtonClass,
            function (ev) {
                let currentScreenName = $(this).data('screen-name');
                recordAudio(currentScreenName);
            }
        );
    }

    function generalQuestionClickListener() {
        $(document).on(
            'click',
            '.popular-query-card',
            function (event) {
                event.stopPropagation();
                const popularQuestion = $(this).data('popular-question');
                const popularQuestionKey = $(this).attr('id');
                copyPopularQuestionInTextBox(popularQuestion, false, true);
                toggleHamburger();
            }
        );
    }

    /**
     * This method is used to listen restart session button click event
     */
    function restartSessionButtonOnClickListener() {

        $(document).on(
            'click',
            '#restartSessionButton',
            function (ev) {

                restartSession(true);
            }
        );
    }

    function startAppTourButtonOnClickListener() {

        $(document).on(
            'click',
            '#startAppTourButton',
            function (ev) {
                startAppTour();
            }
        );
    }

    function feedbackSubmitButtonOnClickListener() {
        $(document).on('click', '#feedbackSubmitButton', function (ev) {
            let translationFeedback = $(this).data('translation-feedback');
            let informationFeedback = $(this).data('information-feedback');
            let functionalityFeedback = $('#feedbackSubmitButton').data(
                'functionality-feedback'
            );

            let feedbackDetails = $(
                userQuestionTextBoxClass + '[data-screen-name=' + 'feedback' + ']'
            ).val();

            submitFeedback(
                translationFeedback,
                informationFeedback,
                functionalityFeedback,
                feedbackDetails
            );
        });
    }

    /**
     * This method is used to listen action button click events
     * Actions like, play message as audio, like, dislike or unlike chatbot response
     */
    function chatbotMessageActionButtonsOnClickListener() {
        $(document).on('click', '.chatbot-message-action-buttons', function (ev) {
            let actionName = $(this).data('action-name');
            let audioId = $(this).data('audio-id');
            let messageId = $(this).data('message-id');
            let actionType = $(this).data('action-type');

            if (actionName == 'setAutoPlayAudioMessage') {
                setAutoPlayOn(audioId);
            } else if (actionName == 'playAudioMessage') {
                playAudio(audioId);
            } else if (actionType == 'fe') {
                if (actionName == 'likeMessage') {
                    likeMessageFe(messageId);
                } else if (actionName == 'dislikeMessage') {
                    dislikeMessageFe(messageId);
                }
            } else {
                if (actionName == 'likeMessage') {
                    likeMessage(messageId);
                } else if (actionName == 'dislikeMessage') {
                    dislikeMessage(messageId);
                }
            }
        });
    }

    function chatbotConfirmationModalCloseEventListener() {
        $(document).on(
            'click',
            '#chatbotConfirmationModalSaveButton',
            function (ev) {
                let modalType = $(this).data('modal-type');

                if (modalType == 'restart-session') {
                    $(".app_tour_language_selection_description").show();
                    restartSession();
                }
            }
        );
    }

    /**
     * Attaches a keypress event listener to the user question text box.
     * Triggers a click event on the send text button when the Enter key is pressed.
     *
     * @returns {void}
     */
    function userQuestionTextBoxOnKeyPressListener() {
        $(userQuestionTextBox).keypress(function (event) {
            if (event.keyCode == 13 || event.key == 'Enter') {
                event.stopPropagation();
                $(sendTextButtonId).click();
            }
        });
    }

    function resendOtpOnClickListener() {
        $(document).on('click', '.resendOTP', function (ev) {
            resendOTP(this);
        });
    }

    function popularQuestionsOnClickListener() {
        $(document).on('click', '.popularQuestions', function (ev) {
            const popularQuestion = $(this).data('popular-question');
            const popularQuestionKey = $(this).attr('id');
            copyPopularQuestionInTextBox(popularQuestion);

            // Update used popular questions list,
            // So when we display new popular questions, we can exclude used ones and show different questions
            const currentScheme = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
            popularQueriesService.updateUsedQueries(currentScheme, popularQuestionKey);

            // Auto send selected popular question
            $(sendTextButtonId).click();
        });
    }

    function initPopovers() {
        // Instantiate all popovers in docs or StackBlitz
        document.querySelectorAll('[data-bs-toggle="popover"]')
            .forEach(popover => {
                new bootstrap.Popover(popover, {
                    customClass: 'popover-custom',
                    trigger: 'hover'
                })
            })
    }

    function hideAllThePopovers() {
        $('[data-bs-toggle="popover"]').popover('dispose');

        setTimeout(() => {
            initPopovers();
        }, 1000)

    }

    async function initChatBotConfig() {

        // Set parent route
        currentParentRoute = $('#currentParentRoute').val();

        const controller = new AbortController();
        const signal = controller.signal;

        await appConfigConstruct.getAppConfig();

        if (appConfig.showSchemes) {
            await window.schemesInfo.getSchemesList();
        }

        voiceRecorderListener();
        languageChangeListener();
        schemeChangeListener();
        configAppTour();
        generalQuestionClickListener();
        userQuestionTextBoxOnKeyPressListener();
        chatbotMessageActionButtonsOnClickListener();
        feedbackSubmitButtonOnClickListener();
        restartSessionButtonOnClickListener();
        startAppTourButtonOnClickListener();
        resendOtpOnClickListener();
        popularQuestionsOnClickListener();
        initAutoSizeInputBox();
        chatbotConfirmationModalCloseEventListener();
        submitFeedbackModalCloseEventListener();
        await getTranslations();

        initPopovers();
        setLocationInfo();

        // Check if maintenance mode is on or not
        // If on, we need to show maintenance mode modal
        // And disable all the functionalities
        const isMaintenanceModeOn = $('#isMaintenanceModeOn').val();
        if (isMaintenanceModeOn == 'True') {
            showMaintenanceModeModal();
        }

        // Highlight selected scheme
        setTimeout(() => {
            hightlightSelectedLanguage();
            hightlightSelectedScheme();
        }, 1000);
    }

    /**
     * This method is used to hightlight the selected language
     */
    function hightlightSelectedLanguage() {

        const currentLanguageCode = getSetCurrentLanguageCode();

        const scrollElement = document.getElementById('language-button-new-' + currentLanguageCode);
        scrollElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    /**
     * This method is used to highlight the selected scheme. As we might have more than dozens of scheme so
     * it will help user to identify which scheme is currently selected.
     */
    function hightlightSelectedScheme() {
        const currentSelectedSchemeId = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;

        const scrollElement = document.getElementById('scheme-button-' + currentSelectedSchemeId);
        scrollElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    /**
     * 
     * This method is used to get the current selected language code and also set in localstorage if not already set
     * @returns
     */
    function getSetCurrentLanguageCode() {
        let currentLanguageCode = localStorage.getItem("currentLanguageCode");

        if (currentLanguageCode == null || currentLanguageCode == undefined) {
            currentLanguageCode = $('.language-buttons').data('current-language-culture-code');
            localStorage.setItem("currentLanguageCode", currentLanguageCode);
        }

        return currentLanguageCode;
    }

    async function getTranslations() {

        let currentLanguageCode = getSetCurrentLanguageCode();

        await getTranslationFiles(currentLanguageCode).then(translations => {

            // Find the current selected langauge translations
            // And show top 5 popular questions from it
            const currentSelectedSchemeId = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
            currentLanguageInfo = translations.find(f => f.languageCode == currentLanguageCode);

            // Update schemes translations as well
            const translationsList = convertObjectToArray(currentLanguageInfo.translations.lables);

            // Get messages transaltions and convert it into key value array
            const messageTranslationsList = convertObjectToArray(currentLanguageInfo.translations.messages);

            const allTranslations = messageTranslationsList.concat(translationsList);
            updateTranslations(allTranslations);

            // Check if app tour is already displayed or not
            // If not then display it, because it means user is opening the app for the first time.
            const isAppTourDisplayed = localStorage.getItem('isAppTourDisplayed');

            if (!isAppTourDisplayed) {
                startAppTour();
            }

            if (appConfig.showSchemes) {
                schemesInfo.updateSchemesTranslations(translationsList);
            }

            const currentSelectedSChemeTranslations = currentLanguageInfo.translations.schemes.find(f => f.schemeId == currentSelectedSchemeId);

            if (currentSelectedSChemeTranslations) {
                bindPopularQuestions();

            } else {
                console.log('Translations missing');
            }
        });
    }

    function bindPopularQuestions() {
        const numberOfVisiblePopularQueries = appConfig && appConfig.numberOfVisiblePopularQueries ? appConfig.numberOfVisiblePopularQueries : 4;
        // Get already used queries of the current scheme
        // We don't need to display already used queries

        const currentSelectedSchemeId = schemesInfo.currentScheme;
        const currentSelectedSChemeTranslations = currentLanguageInfo.translations.schemes.find(f => f.schemeId == currentSelectedSchemeId);

        const alreadyUsedQueries = popularQueriesService.getUsedQueries(currentSelectedSchemeId);

        const topRandomPopularQuestions = getRandomValues(currentSelectedSChemeTranslations.queries, numberOfVisiblePopularQueries, alreadyUsedQueries.length ? alreadyUsedQueries : undefined);

        const popularQuestionsHtmlContent = getPopularQuestionsHtmlContent(topRandomPopularQuestions);

        $('.query-messages-box').empty();

        for (var i = 0; i < popularQuestionsHtmlContent.length; i++) {
            $('.query-messages-box').append(popularQuestionsHtmlContent[i]);
        }

        showPopularQuestions();
    }

    function configAppTour() {
        tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                cancelIcon: {
                    enabled: true,
                },
                classes: 'shadow-md bg-purple-dark',
                scrollTo: { behavior: 'smooth', block: 'center' },
            },
        });

        tour.on('cancel', function () {
            localStorage.setItem('isAppTourDisplayed', 'true');
        });
    }

    function initAppTour() {
        // First remove the old steps to update the translations when language is changed
        configAppTour();

        let nextButtonTranslation = currentLanguageInfo.translations.lables.next;
        let previousButtonTranslation = currentLanguageInfo.translations.lables.previous;

        let exitButtonTranslation = currentLanguageInfo.translations.messages.app_tour_exit;

        let nextButtonInfo = {
            text: nextButtonTranslation,
            action: tour.next,
            classes: 'app-tour-next-button',
        };

        let previousButtonInfo = {
            text: previousButtonTranslation,
            action: tour.back,
            classes: 'app-tour-next-button',
        };

        let exitButtonInfo = {
            text: exitButtonTranslation,
            action: tour.cancel,
            classes: 'app-tour-next-button',
        };

        let appTourSteps = [];

        let appTourTranslationMappingDetails = [
            {
                id: '',
                translationType: 'messages',
                title: 'app_tour_welcome_header',
                text: 'app_tour_welcome_description',
                showNextButton: true,
                showPreviousButton: false,
            },
            {
                id: 'app_tour_scheme_selection_description',
                translationType: 'messages',
                text: 'app_tour_scheme_selection_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_language_selection_description',
                translationType: 'messages',
                text: 'app_tour_language_selection_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_audio_button_description',
                translationType: 'messages',
                text: 'app_tour_audio_button_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_sample_questions_description',
                translationType: 'messages',
                text: 'app_tour_sample_questions_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_typebox_description',
                translationType: 'messages',
                text: 'app_tour_typebox_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_mic_button_description',
                translationType: 'messages',
                text: 'app_tour_mic_button_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_send_button_description',
                translationType: 'messages',
                text: 'app_tour_send_button_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_refresh_button_description',
                translationType: 'messages',
                text: 'app_tour_refresh_button_description',
                showNextButton: false,
                showPreviousButton: true,
                showExitButton: true,
            }
        ];

        for (var i = 0; i < appTourTranslationMappingDetails.length; i++) {
            let currentTranslationMappingDetails = appTourTranslationMappingDetails[i];



            let appTourStep = {};
            appTourStepButtons = [];

            if (currentTranslationMappingDetails.showPreviousButton) {
                appTourStepButtons.push(previousButtonInfo);
            }

            if (currentTranslationMappingDetails.showNextButton) {
                appTourStepButtons.push(nextButtonInfo);
            }

            if (currentTranslationMappingDetails.showExitButton) {
                appTourStepButtons.push(exitButtonInfo);
            }

            let titleTranslationInfo = currentLanguageInfo.translations[currentTranslationMappingDetails.translationType][currentTranslationMappingDetails.title];

            let textTranslationInfo = currentLanguageInfo.translations[currentTranslationMappingDetails.translationType][currentTranslationMappingDetails.text];

            let attachToInfo = {
                element: '.' + currentTranslationMappingDetails.id,
                on: 'bottom',
            };

            appTourStep = {
                id: currentTranslationMappingDetails.id,
                title: titleTranslationInfo ? titleTranslationInfo : undefined,
                text: textTranslationInfo,
                attachTo: currentTranslationMappingDetails.id
                    ? attachToInfo
                    : undefined,
                classes: 'pm-kisan-chatbot-app-tour-modal-wrapper',
                buttons: appTourStepButtons,
            };

            appTourSteps.push(appTourStep);
        }


        tour.addSteps(appTourSteps);
    }

    function startAppTour() {
        // Check if current translation mapping details app tour step is visible in UI or not
        // Sometimes some ui elements can be hidden as per the user action,
        // So no need to display app tour for it, as it is not visible on the screen
        const appTourStepId = 'app_tour_language_selection_description';
        const appTourUiElementClassName = '.' + appTourStepId;
        const currentAppTourStepUiElement = $(appTourUiElementClassName).css('display');

        if (currentAppTourStepUiElement == "none") {
            tour.removeStep(appTourStepId);
        }

        tour.start();
    }

    function showMaintenanceModeModal() {
        maintenanceModeModal = new bootstrap.Modal(
            '#' + maintenanceModeModalId,
            modalOptions
        );

        maintenanceModeModal.show();
    }

    function submitFeedbackModalCloseEventListener() {
        submitFeedbackModalElement.addEventListener('hidden.bs.modal', (event) => {
            // Show toaster to show thank you message for the feedback
            const toastMessage = currentLanguageInfo.translations.toasts.thank_you_for_feedback;

            const feedbackResponseMessageId =
                'message-thank-for-feedback-' + new Date().getTime();

            updateChatMessagesList(toastMessage, feedbackResponseMessageId, '', true);

            $(this).data('translation-feedback', -1);
            $(this).data('information-feedback', -1);
            $('#feedbackSubmitButton').data('functionality-feedback', -1);

            $(userQuestionTextBoxClass + '[data-screen-name=' + 'feedback' + ']').val(
                ''
            );

            likeMessageFe('translation-feedback', true);
            likeMessageFe('information-feedback', true);
            likeMessageFe('functionality-feedback', true);
            dislikeMessageFe('translation-feedback', true);
            dislikeMessageFe('information-feedback', true);
            dislikeMessageFe('functionality-feedback', true);
        });
    }

    function showFeedbackModal() {
        submitFeedbackModal = new bootstrap.Modal('#' + submitFeedbackModalId);
        submitFeedbackModal.show();
    }

    function initAutoSizeInputBox() {
        autosize($(userQuestionTextBoxClass));
    }

    /**
     * Update the chat messages list.
     *
     * @param {string} message - The message to be added to the chat messages list.
     * @param {string} messageId - The ID of the message.
     * @param {string} messageType - The type of the message.
     * @param {boolean} isMessageFromBot - Indicates whether the message is from the bot or not.
     * @param {boolean} showAudioOption - Indicates whether to show the audio option or not.
     */
    function updateChatMessagesList(
        message,
        messageId,
        messageType,
        isMessageFromBot,
        showAudioOption
    ) {
        if (message != '') {

            if (isMessageFromBot == true) {
                message = formatChatbotResponse(message);
                message = marked.parse(message);
                message = message.replace("<a", "<a target='_blank' rel='noreferrer' ");
            }

            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(
                    isMessageFromBot,
                    messageId,
                    'conversationsWrapper'
                ); // Main chat message wrapper

            let chatMessageAudioImageHtmlContent =
                showAudioOption == true
                    ? getChatMessageAudioImageHtmlContent(messageId)
                    : null; // Audio icon inside third column

            let feedbackOptionHtmlContent = getFeedbackButtonsHtmlContent(messageId);
            let spanStartingHtmlContentWithId = getStartingSpanHtmlContent(messageId);

            chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent = getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(messageId);

            var response =
                chatMessageWrapperStartingDivHtmlContent +

                chatMessageWrapperColumnTwoStartingDivHtmlContent +
                startingDivHtmlContent +
                chatbotLogoHtmlContent +
                spanStartingHtmlContentWithId +
                message +
                spanClosingHtmlContent +
                closingDivHtmlContent +
                closingDivHtmlContent +
                (showAudioOption == true
                    ? chatMessageWrapperColumnThreeStartingDivHtmlContent +
                    chatMessageAudioImageHtmlContent +
                    closingDivHtmlContent
                    : '') +
                (messageType == 'final_response' && isMessageFromBot == true
                    ? chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent +
                    feedbackOptionHtmlContent +
                    closingDivHtmlContent
                    : '') +
                closingDivHtmlContent;
            $('#message-list').append(response);

            if (messageType == 'final_response') {
                sessionStorage.setItem('final_response', true);

                bindPopularQuestions();
            }

            scrollToBottom();
            if (isMessageFromBot == true) {
                autoPlayAudio(messageId);
            }
        }
    }

    function recordAudio(screenName) {
        isRecording = !isRecording;

        if (isRecording) {
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).attr('src', stopVoiceRecordingImagePath);
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).addClass(voiceRecordingStopBgColorClass);
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).removeClass(voiceRecordingStartBgColorClass);
            $(
                voiceRecordMicCircleClass + '[data-screen-name=' + screenName + ']'
            ).show();

            $(sendTextButtonId).attr('disabled', 'disabled');
            startRecording(screenName);
        } else {
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).attr('src', startVoiceRecordingImagePath);
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).addClass(voiceRecordingStartBgColorClass);
            $(
                voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            ).removeClass(voiceRecordingStopBgColorClass);

            $(
                voiceRecordMicCircleClass + '[data-screen-name=' + screenName + ']'
            ).hide();
            $(sendTextButtonId).removeAttr('disabled');
            stopRecording();
        }
    }

    $(document).ready(function () {
        initChatBotConfig();

        $(voiceRecordMicCircleClass).hide();

        createGlobalAudioElement();

        getWelcomeGreetingsAudio(false);

        getLanguageLabelsAudioes();

        enableDisableSendButton();

        $(userQuestionTextBoxClass).on('change paste keyup', function (event) {
            let screenName = $(this).data('screen-name');

            if (screenName == 'conversation') {
                if (
                    event.type == 'keyup' &&
                    isSampleQueryUsed == false &&
                    event?.originalEvent?.key != 'Enter'
                ) {
                    isUserTypedQuestion = true;
                } else {
                    isUserTypedQuestion = false;
                }
            }

            autosize.update($(userQuestionTextBoxClass));

            if (screenName == 'conversation') {
                var textValue = $(this).val();

                // If value is there then only keep the send button enabled else keep it disabled.
                enableDisableSendButton(textValue);
            }
        });

        getLocalStream();
        $(function () {
            $('body').on('click', sendTextButtonId, function (e) {
                e.preventDefault();
                let questionInput = $(userQuestionTextBox).val();

                var questionInputContent = $('<div />').text(questionInput).html();
                if (questionInputContent) {
                    let chatMessageWrapperStartingDivHtmlContent =
                        getChatMessageWrapperStartingDivHtmlContent(
                            false,
                            null,
                            'conversationsWrapper'
                        ); // Main chat message wrapper

                    let chatMessageAudioImageHtmlContent =
                        getChatMessageAudioImageHtmlContent(lastUserTypedMessageId); // Audio icon inside third column

                    var userQuery = '';

                    userQuery =
                        chatMessageWrapperStartingDivHtmlContent +

                        chatMessageWrapperColumnTwoStartingDivHtmlContent +
                        startingDivHtmlContent +
                        userLogoHtmlContent +
                        spanStartingHtmlContent +
                        "<p>" + questionInput + "</p>" +
                        spanClosingHtmlContent +
                        closingDivHtmlContent +
                        closingDivHtmlContent +
                        closingDivHtmlContent +
                        chatMessageWrapperColumnThreeStartingDivHtmlContent +
                        (lastUserTypedMessageId != null && lastUserTypedMessageId != ''
                            ? chatMessageAudioImageHtmlContent
                            : '') +
                        closingDivHtmlContent +
                        closingDivHtmlContent;

                    $('#message-list').append(userQuery.replace(/\n/g, '<br>'));
                    lastUserTypedMessageId = ''; // Clear last user typed messaged Id once it is sent
                }

                askQuestions(questionInputContent, 'text');
            });
        });
    });

    function copyPopularQuestionInTextBox(message, shouldHidePopularQuestions = true, shouldAutoSend) {
        // Hide popular questions now
        if (shouldHidePopularQuestions == true) {
            hidePopularQuestions();
        }

        showUserRecordedMessageInTextBox(message, shouldAutoSend);
    }

    function hidePopularQuestions() {
        $('#popularQuestionsWrapper').removeClass('d-flex');
        $('#popularQuestionsWrapper').hide();
        $('#message-list').addClass('without-popular-questions');
    }

    function showPopularQuestions() {
        $('#popularQuestionsWrapper').addClass('d-flex');
        $('#popularQuestionsWrapper').show();
        $('#message-list').removeClass('without-popular-questions');
    }

    function showUserRecordedMessageInTextBox(message, shouldAutoSend) {
        $(userQuestionTextBox).val(message);
        $(userQuestionTextBox).focus();
        $(userQuestionTextBox).trigger('change');

        if (shouldAutoSend === true) {
            $(sendTextButtonId).trigger('click');
        }
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
        if (message != '') {
            updateChatMessagesList(
                message,
                messageId,
                messageType,
                true,
                showAudioOption
            );
        }

        if (
            String(textInEnglish)
                .toLowerCase()
                .indexOf('one time password is wrong') >= 0
        ) {
            var resendOtpTranslation = currentLanguageInfo.translations.messages.resend_otp;

            let chatMessageWrapperStartingDivHtmlContent =
                getChatMessageWrapperStartingDivHtmlContent(
                    true,
                    'resendOtp',
                    'conversationsWrapper'
                ); // Main chat message wrapper

            var userQuery = '';

            userQuery =
                chatMessageWrapperStartingDivHtmlContent +
                startingDivHtmlContent +
                userLogoHtmlContent +
                chatMessageWrapperColumnTwoStartingDivHtmlContent +
                startingDivHtmlContent +
                "<button class='btn btn-success language-buttons resendOTP'>" +
                resendOtpTranslation +
                '</button>' +
                closingDivHtmlContent +
                closingDivHtmlContent +
                closingDivHtmlContent;

            $('#message-list').append(userQuery);
        }
        $(userQuestionTextBox).val('');

        $(userQuestionTextBox).trigger('change');

        hideChatLoader();
    }

    function resendOTP(element) {
        $('#chatbotMessageWrapper-resendOtp').remove();
        askQuestions('resend OTP', 'text');
    }

    /**
     * This method is used to format the chat bot response,
     * We need to display aadhar information in different format.
     * If there are any texts with *anyword*, we need to display those words in bold letters.
     * All such formatting will happen inside this method.
     * @param {any} response
     * @returns
     */
    function formatChatbotResponse(response) {

        response = response.replaceAll("\\n", "<br>").replaceAll("\n", "<br>").replaceAll("\\t", "\u00A0\u00A0\u00A0\u00A0").replaceAll("\t", "\u00A0\u00A0\u00A0\u00A0");
        response = response.trim();

        // AADHAR Info UI Format START
        // If aadhar info is available in chat response then we need to display it in table format
        // Add bootstrap table class and "table-responsive card" classes as wrapper to beautify the table

        //Remove all the table related element and replace them with div to show aadhar info in a new UI
        if (response.indexOf('"aadhar-table"') >= 0) {
            response = response.replaceAll('"aadhar-table"', "'aadhar-table'");
            response = response.replaceAll('<table', '<div');
            response = response.replaceAll('<tbody', '<div');
            response = response.replaceAll('<tr', '<div class="div-row"');
            response = response.replaceAll('<td', '<div');
            response = response.replaceAll('/table>', '/div>');
            response = response.replaceAll('/tbody>', '/div>');
            response = response.replaceAll('/tr>', '/div>');
            response = response.replaceAll('/td>', '/div>');
        }
        // AADHAR Info UI Format END

        return response;
    }

    function addMetricsCount(metricsType) {
        const apiUrl =
            apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.MetricsIncrement;
        const headers = new Headers();
        headers.append('User-id', currentUserId);

        makeRequestRetry('POST', apiUrl, headers, metricsType)
            .then((apiResponse) => { })
            .catch((apiError) => { });
    }

    function handleError(error) {
        hideChatLoader();

        if (error?.status == 502) {
            addMetricsCount('badGateway');
        } else if (error?.status == 504) {
            addMetricsCount('gatewayTimeoutCount');
        } else {
            addMetricsCount('internalServerError');
        }

        var defaultChatbotErrorMessage = currentLanguageInfo.translations.errors.default_message; //translations.find((f) => f.key == 'error_default_message').value;

        const currentDateTime = new Date().getTime().toString();

        processChatBotResponse(defaultChatbotErrorMessage, currentDateTime);

        scrollToBottom();
    }

    function submitFeedback(
        translation,
        information,
        chatbotFunctionality,
        feedbackDetails
    ) {
        const apiUrl =
            apiUrlConfig.chatbotApiBaseUrl + apiUrlConfig.ConversationFeedback;

        const requestPayload = {
            conversationId: currentConversationId,
            translation: translation,
            information: information,
            chatbotFunctionality: chatbotFunctionality,
            feedback: feedbackDetails,
        };

        const headers = new Headers();
        headers.append('User-id', currentUserId);

        makeRequestRetry('POST', apiUrl, headers, requestPayload)
            .then((apiResponse) => {
                const data = JSON.parse(apiResponse);
                submitFeedbackModal.hide();
            })
            .catch((apiError) => {
                handleError(apiError);
            });
    }

    function askQuestions(input, category, blob, screenName = 'conversation') {
        let isFinalResponseReceived = false;

        if (category == 'text' && screenName == 'conversation') {
            clearSessionRestartAutoTimeout();

            let finalResponse = sessionStorage.getItem('final_response');

            if (finalResponse != undefined && finalResponse != null) {
                isFinalResponseReceived = true;
            }

            sessionStorage.removeItem('final_response');
            sessionStorage.removeItem('isFeedbackModalShown');

            if (isUserTypedQuestion == true) {
                addMetricsCount('directMessageTypedCount');
                isUserTypedQuestion = false;
            } else if (isSampleQueryUsed == true) {
                addMetricsCount('sampleQueryUsedCount');
            }

            $(userQuestionTextBox).val('');
            $(userQuestionTextBox).trigger('change');
        }

        chatLoader();

        scrollToBottom();

        function prompt() {
            const apiUrl =
                apiUrlConfig.chatbotApiBaseUrl +
                apiUrlConfig.Prompt +
                apiUrlConfig.ApiVersion;
            const headers = new Headers();
            headers.append('User-id', currentUserId);
            headers.append('session-id', sessionId);

            let currentLanguageCultureCode = $('.language-buttons').data(
                'current-language-culture-code'
            );

            let schemeName = appConfig.defaultSchemeAPIKey;
            if (appConfig.showSchemes) {
                const currentScheme = schemesInfo.list.find(f => f.id == schemesInfo.currentScheme);

                if (currentScheme) {
                    schemeName = currentScheme.apiKey;
                }
            }

            const requestPayload = {
                text: category == 'text' ? input : null,
                media:
                    category == 'base64audio'
                        ? { category: 'base64audio', text: input }
                        : null,
                location: latitude && longitude ? { lat: latitude, long: longitude } : null,
                contactCard: null,
                buttonChoices: null,
                stylingTag: null,
                flow: '',
                mediaCaption: '',
                inputLanguage: currentLanguageCultureCode,
                schemeName: schemeName
            };

            makeRequestRetry('POST', apiUrl, headers, requestPayload)
                .then((apiResponse) => {
                    hideChatLoader();

                    const data = JSON.parse(apiResponse);

                    var message = '';
                    currentConversationId = data.conversationId;

                    if (data.error !== null) {
                        // Show default error message
                        var defaultChatbotErrorMessage = currentLanguageInfo.translations.errors.default_message; //translations.find((f) => f.key == 'error_default_message').value;

                        processChatBotResponse(
                            defaultChatbotErrorMessage,
                            data.messageId,
                            data.messageType
                        );
                    } else {
                        if (category == 'base64audio') {
                            loadAudioPlayer(
                                blob,
                                data.messageId,
                                'right conversationsWrapper'
                            );
                            lastUserTypedMessageId = data.messageId;

                            if (data.text) {
                                message = data.text;

                                $(
                                    userQuestionTextBoxClass +
                                    '[data-screen-name=' +
                                    screenName +
                                    ']'
                                ).val(message);
                                $(
                                    userQuestionTextBoxClass +
                                    '[data-screen-name=' +
                                    screenName +
                                    ']'
                                ).focus();
                                $(
                                    userQuestionTextBoxClass +
                                    '[data-screen-name=' +
                                    screenName +
                                    ']'
                                ).trigger('change');
                            }
                        } else {
                            if (screenName == 'conversation') {
                                const contentType = 'audio/wav';

                                if (data?.audio?.text) {
                                    const blob = b64toBlob(data.audio.text, contentType);
                                    loadAudioPlayer(
                                        blob,
                                        data.messageId,
                                        'left conversationsWrapper'
                                    );
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
                    }

                    scrollToBottom();

                    if (category == 'text') {
                        setSessionAutoRestartTimeout();
                    }
                })
                .catch((apiError) => {
                    handleError(apiError);
                });
        }

        prompt();
    }

    /**
     * This method is used to set like or unlike reaction on thumb icon for feedback purpose
     * @param {any} messageId
     */
    function likeMessageFe(messageId, shouldReset) {
        if (shouldReset) {
            $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);
        } else {
            // Check the current state of like button whether it is liked or unliked.
            // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
            var likeButtonSource = $('#thumbLikeButton-' + messageId)[0].src;

            var likeImageToReplace = thumbLikeHighlightImagePath; // Highlight thumbLike button
            let likeMessageValue = 1;
            var isLikeHighlight = false;

            if (likeButtonSource.indexOf('fill') >= 0) {
                isLikeHighlight = true;

                likeImageToReplace = thumbLikeImagePath; // Unlike thumbLike button
                likeMessageValue = -1;
            }

            // Set the user selected reaction in data attribute, so later we can use it to send this info to api
            $('#feedbackSubmitButton').data(messageId, likeMessageValue);

            // Highlight the like button
            $('#thumbLikeButton-' + messageId).attr('src', likeImageToReplace);

            // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
            if (isLikeHighlight) {
                $('#thumbLikeButton-' + messageId).removeClass('feedback-animation');
            } else {
                $('#thumbLikeButton-' + messageId).addClass('feedback-animation');
            }

            $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from dislike button, to display animation when user hits the same button again

            $('#thumbDislikeButton-' + messageId).attr('src', thumbDislikeImagePath); // Change image to color less icon for dislike button as user has clicked on like button now
        }
    }

    /**
     * This method is used to set dislike or unlike reaction on thumb icon for feedback purpose
     * @param {any} messageId
     */
    function dislikeMessageFe(messageId, shouldReset) {
        if (shouldReset) {
            $('#thumbDislikeButton-' + messageId).attr('src', thumbDislikeImagePath);
        } else {
            // Check the current state of like button whether it is liked or unliked.
            // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
            var dislikeButtonSource = $('#thumbDislikeButton-' + messageId)[0].src;

            var dislikeImageToReplace = thumbDislikeHighlightImagePath;
            var isDislikeHighlight = false;
            let dislikeMessageValue = 0;
            if (dislikeButtonSource.indexOf('fill') >= 0) {
                isDislikeHighlight = true;

                dislikeImageToReplace = thumbDislikeImagePath;
                dislikeMessageValue = -1;
            }

            $('#feedbackSubmitButton').data(messageId, dislikeMessageValue);

            // Set the user selected reaction in data attribute, so later we can use it to send this info to api

            // Highlight the like button
            $('#thumbDislikeButton-' + messageId).attr('src', dislikeImageToReplace);

            // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
            if (isDislikeHighlight) {
                $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation');
            } else {
                $('#thumbDislikeButton-' + messageId).addClass('feedback-animation');
            }

            $('#thumbLikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from like button, to display animation when user hits the same button again

            $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);
        }
    }

    function likeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var likeButtonSource = $('#thumbLikeButton-' + messageId)[0].src;

        var likeMessageApiEndPoint = 'like';
        var likeImageToReplace = thumbLikeHighlightImagePath;

        var isLikeHighlight = false;

        if (likeButtonSource.indexOf('fill') >= 0) {
            isLikeHighlight = true;

            likeMessageApiEndPoint = 'removelike';
            likeImageToReplace = thumbLikeImagePath;
        }

        const apiUrl =
            apiUrlConfig.chatbotApiBaseUrl +
            apiUrlConfig.Message +
            likeMessageApiEndPoint +
            '/' +
            messageId;
        const headers = new Headers();
        headers.append('User-id', currentUserId);

        makeRequestRetry('GET', apiUrl, headers)
            .then((apiResponse) => {
                hideChatLoader();
                const data = JSON.parse(apiResponse);

                // Highlight the like button
                $('#thumbLikeButton-' + messageId).attr('src', likeImageToReplace);

                // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                if (isLikeHighlight) {
                    $('#thumbLikeButton-' + messageId).removeClass('feedback-animation');
                } else {
                    $('#thumbLikeButton-' + messageId).addClass('feedback-animation');
                }

                $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from dislike button, to display animation when user hits the same button again

                $('#thumbDislikeButton-' + messageId).attr(
                    'src',
                    thumbDislikeImagePath
                ); // Change image to color less icon for dislike button as user has clicked on like button now

                // Check if feedback modal is already shown or not
                // We need to show it only if it is not already shown

                const isFeedbackModalShown = sessionStorage.getItem(
                    'isFeedbackModalShown'
                );

                if (isFeedbackModalShown) {
                } else {
                    showFeedbackModal();
                    sessionStorage.setItem('isFeedbackModalShown', true);
                }
            })
            .catch((apiError) => {
                handleError(apiError);
            });
    }

    function dislikeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        var dislikeButtonSource = $('#thumbDislikeButton-' + messageId)[0].src;

        var dislikeMessageApiEndPoint = 'dislike';
        var dislikeImageToReplace = thumbDislikeHighlightImagePath;
        var isDislikeHighlight = false;
        if (dislikeButtonSource.indexOf('fill') >= 0) {
            isDislikeHighlight = true;

            dislikeMessageApiEndPoint = 'removelike';
            dislikeImageToReplace = thumbDislikeImagePath;
        }

        const apiUrl =
            apiUrlConfig.chatbotApiBaseUrl +
            apiUrlConfig.Message +
            dislikeMessageApiEndPoint +
            '/' +
            messageId;

        const headers = new Headers();
        headers.append('User-id', currentUserId);

        makeRequestRetry('GET', apiUrl, headers)
            .then((apiResponse) => {
                hideChatLoader();

                const data = JSON.parse(apiResponse);

                // Highlight the like button
                $('#thumbDislikeButton-' + messageId).attr(
                    'src',
                    dislikeImageToReplace
                );

                // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                if (isDislikeHighlight) {
                    $('#thumbDislikeButton-' + messageId).removeClass(
                        'feedback-animation'
                    );
                } else {
                    $('#thumbDislikeButton-' + messageId).addClass('feedback-animation');
                }

                $('#thumbLikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from like button, to display animation when user hits the same button again

                $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);

                const isFeedbackModalShown = sessionStorage.getItem(
                    'isFeedbackModalShown'
                );

                if (isFeedbackModalShown) {
                } else {
                    showFeedbackModal();
                    sessionStorage.setItem('isFeedbackModalShown', true);
                }
            })
            .catch((apiError) => {
                handleError(apiError);
            });
    }

    function scrollToBottom() {
        $('#message-list').animate(
            { scrollTop: $('#message-list').prop('scrollHeight') },
            500
        );
    }

    function getLocalStream() {
        window.addEventListener('DOMContentLoaded', () => {
            if ('MediaRecorder' in window) {
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

    async function startRecording(screenName) {
        // Record metrics
        addMetricsCount('micUsedCount');

        var chunks = [];
        var arrayBufferData;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({
                    audio: true,
                })
                .then((stream) => {
                    mediaRecorder = new MediaRecorder(stream);

                    mediaRecorder.start();

                    mediaRecorder.ondataavailable = async (e) => {
                        arrayBufferData = await e.data.arrayBuffer();

                        chunks.push(e.data);

                        const blob = new Blob(chunks);

                        const encodedBlob = await getWaveBlob(blob, false, arrayBufferData);

                        createDownloadLink(encodedBlob, screenName);

                        chunks = [];
                    };

                    mediaRecorder.onstop = async (e) => { };
                })
                .catch((error) => {
                    handleError(error);
                });
        }
    }

    async function stopRecording() {
        mediaRecorder.stop();
    }

    function createDownloadLink(blob, screenName) {
        var reader = new window.FileReader();

        reader.readAsDataURL(blob);

        reader.onloadend = async function () {
            let base64 = reader.result.replace(/^data:.+;base64,/, '');
            scrollToBottom();

            // Check base64 string length is multiply of 4 or not
            // If not add missing number of "=" characters and make it correct
            while (base64.length % 4 != 0) {
                base64 += '=';
            }

            askQuestions(base64, 'base64audio', blob, screenName);
        };
    }

    function loadAudioPlayer(blob, messageId, alignment = 'right') {
        // Remove the existing audio player with the same id if available
        $('#' + messageId).remove();

        const blobUrl = URL.createObjectURL(blob);
        const div = document.createElement('div');
        div.className = 'message ' + alignment;

        // Avatar image
        if (alignment == 'left') {
            div.className += ' system-msg-left';
            const avatarImg = document.createElement('img');
            avatarImg.src = chatbotLogoImagePath;
            avatarImg.alt = 'avatar 1';
            avatarImg.className = 'avatar-img';
            avatarImg.style.width = '45px';
            avatarImg.style.width = '100%';
            div.appendChild(avatarImg);
        } else {
        }

        const audio = document.createElement('audio');
        audio.style.padding = '6px';

        const anchor = document.createElement('a');
        anchor.setAttribute('href', blobUrl);
        const now = new Date();
        anchor.setAttribute(
            'download',
            `recording-${now.getFullYear()}-${(now.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${now.getDay().toString().padStart(2, '0')}--${now
                    .getHours()
                    .toString()
                    .padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now
                        .getSeconds()
                        .toString()
                        .padStart(2, '0')}.webm`
        );
        audio.setAttribute('src', blobUrl);
        audio.setAttribute('controls', 'controls');
        audio.setAttribute('controlsList', 'nodownload');
        audio.setAttribute('id', messageId);

        div.appendChild(audio);
        div.appendChild(anchor);
        div.style.display = 'none'; // Hide audio player as we don't need to display it to the user. It will be played using a audio icon available next to text message
        $('#message-list').append(div);
    }

    const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
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

    function convertObjectToArray(obj) {

        let keys = Object.keys(obj);
        let result = [];

        for (let i = 0; i < keys.length; i++) {

            // Get the key and value
            let key = keys[i];
            let value = obj[key];

            // Add the object to the result array
            result.push({ key: key, value: value });
        }

        return result;
    }

    function getRandomValues(obj, count, valuesToExclude) {
        let keys = Object.keys(obj).filter(key => typeof obj[key] === 'string' && obj[key].length < 100 && (!valuesToExclude || (valuesToExclude && !valuesToExclude.includes(key))));
        let result = [];

        for (let i = 0; i < count; i++) {
            // Get a random index
            let index = Math.floor(Math.random() * keys.length);

            // Get the key and value
            let key = keys[index];
            let value = obj[key];

            // Add the object to the result array
            result.push({ key: key, value: value });

            // Remove the key from the keys array
            keys.splice(index, 1);
        }

        return result;
    }

    async function getTranslationFiles(currentLanguageCode) {

        // Fetch the translations for all the languages
        for (var i = 0; i < allLanguagesTranslations.length; i++) {

            const currentLanguage = allLanguagesTranslations[i];

            if (currentLanguage.languageCode == currentLanguageCode) {
                if (currentLanguage.translations === null) {
                    const response = await fetch('/Content/translations/' + currentLanguage.language + '.json', { cache: 'no-cache' });
                    const translationsInfo = await response.json();

                    allLanguagesTranslations[i].translations = translationsInfo;

                    break;
                }
            }
        }

        return allLanguagesTranslations;
    }

    async function getLanguageLabelsAudioes() {

        const allLanguagesAudioBase64Data = [];

        for (var i = 0; i < allLanguagesTranslations.length; i++) {
            const currentLanguage = allLanguagesTranslations[i];

            const apiResponse = await fetch('/Content/audio/' + currentLanguage.languageCode + '.txt', { cache: 'no-cache' });
            const apiJsonResponse = await apiResponse.text();

            allLanguagesAudioBase64Data.push({
                Key: 'language-labels-' + currentLanguage.languageLabel,
                Value: apiJsonResponse
            });
        }

        initGeneralAudioConfig(allLanguagesAudioBase64Data);
    }

    function changeLanguage(
        languageCultureCode,
        LanguageEnglishLabel,
        languageCultureLabel,
        currentLanguageCultureCode
    ) {
        playAudio('language-labels-' + LanguageEnglishLabel + '-audio');

        isChangeLanguageRequestInProgress = $.ajax({
            type: 'POST',
            url: currentParentRoute + 'ChangeLanguage',
            dataType: 'json',
            data: { lang: languageCultureCode },
            success: async function (data) {

                //If language is changed after session refresh was done,
                //Add metric count for it

                if (sessionId != previousSessionId) {
                    addMetricsCount('stage2Count');
                }

                isChangeLanguageRequestInProgress = null;

                // Remove previous language changed message
                let previousLanguageChangedMessageId =
                    '#chatbotMessageWrapper-language-change-greeting-message-base64-' +
                    currentLanguageCultureCode +
                    '-audio';
                $(previousLanguageChangedMessageId).remove();

                // Update Welcome greeting data id as per the new language
                // So correct audio can be played when Welcome greeting audio icon is clicked after changing the language.
                const currentWelcomeGreetingDataId =
                    welcomeGreetingMessageBase64StringName.replace(
                        selectedLanguageCultureCodeTemplateVarId,
                        currentLanguageCultureCode
                    );
                const newWelcomeGreetingDataId =
                    welcomeGreetingMessageBase64StringName.replace(
                        selectedLanguageCultureCodeTemplateVarId,
                        languageCultureCode
                    );

                $('#playMessageImg-' + currentWelcomeGreetingDataId).data(
                    'audio-id',
                    newWelcomeGreetingDataId
                );

                // We also need to update play icon image id
                // To pass to correctly change the audio id whenever language is changed.
                $('#playMessageImg-' + currentWelcomeGreetingDataId).attr(
                    'id',
                    'playMessageImg-' + newWelcomeGreetingDataId
                );

                // Update selected language buttons and labels to update the selected language in UI.
                updateSelectedLanguageInUI(languageCultureCode, languageCultureLabel);

                getWelcomeGreetingsAudio(true);

                await getTranslations();
                showUserRecordedMessageInTextBox('');

                previousSessionId = sessionId;
            },
            failure: function (data) {
                isChangeLanguageRequestInProgress = null;
                alert('oops something went wrong');
            },
        });
    }

    function updateSelectedLanguageInUI(
        languageCultureCode,
        languageCultureLabel
    ) {

        localStorage.setItem("currentLanguageCode", languageCultureCode);
        $('.language-buttons').removeClass('btn-success');
        $('.language-buttons').addClass('btn-secondary');

        $('.language-buttons').data(
            'current-language-culture-code',
            languageCultureCode
        );
        $('li.languagesLabels a').data(
            'current-language-culture-code',
            languageCultureCode
        );

        $(
            'button[data-language-culture-code="' + languageCultureCode + '"]'
        ).addClass('btn-success');

        $(
            'button[data-language-culture-code="' + languageCultureCode + '"]'
        ).removeClass('btn-secondary');

        $('#selectedLanguageLabel').html(languageCultureLabel);

        $('li.languagesLabels a').removeClass('fw-bold');

        $(
            'li.languagesLabels[data-language-culture-code="' +
            languageCultureCode +
            '"] a'
        ).addClass('fw-bold');
    }

    async function getWelcomeGreetingsAudio(isLanguageChanged) {
        const currentLanguageCode = getSetCurrentLanguageCode();

        // Get current selected language and welcome message
        const languageChangeMessageAPIResponse = await fetch('/Content/audio/language-change-' + currentLanguageCode + '.txt', { cache: 'no-cache' });
        const welcomeMessageAPIResponse = await fetch('/Content/audio/welcome-' + currentLanguageCode + '.txt', { cache: 'no-cache' });

        const languageChangeBase64Data = await languageChangeMessageAPIResponse.text();
        const welcomeMessageBase64Data = await welcomeMessageAPIResponse.text();

        // Add fetched data in an array
        const base64Data =
            [
                {
                    Key: 'welcome-greeting-message-base64-' + currentLanguageCode,
                    Value: welcomeMessageBase64Data
                },
                {
                    Key: 'language-change-greeting-message-base64-' + currentLanguageCode,
                    Value: languageChangeBase64Data
                }
            ];

        initWelcomeGreetingAudioConfig(base64Data, isLanguageChanged);
    }

    function initGeneralAudioConfig(data) {
        // Get welcome note and language greeting text audio
        var textsToGetSpeech = [];

        for (var i = 0; i < data.length; i++) {
            let currentData = data[i];

            textsToGetSpeech.push({
                id: currentData.Key + '-audio',
                value: currentData.Value,
            });
        }

        const contentType = 'audio/wav';

        if (textsToGetSpeech.length > 0) {
            for (var i = 0; i < textsToGetSpeech.length; i++) {
                var currentBase64String = textsToGetSpeech[i];
                const blob = b64toBlob(currentBase64String.value, contentType);

                loadAudioPlayer(blob, currentBase64String.id, 'left');
            }
        }
    }

    function initWelcomeGreetingAudioConfig(data, isLanguageChanged) {
        // Get welcome note and language greeting text audio
        var textsToGetSpeech = [];

        for (var i = 0; i < data.length; i++) {
            let currentData = data[i];

            textsToGetSpeech.push({
                id: currentData.Key + '-audio',
                value: currentData.Value,
            });
        }

        const contentType = 'audio/wav';

        if (textsToGetSpeech.length > 0) {
            for (var i = 0; i < textsToGetSpeech.length; i++) {
                var currentBase64String = textsToGetSpeech[i];
                const blob = b64toBlob(currentBase64String.value, contentType);

                loadAudioPlayer(blob, currentBase64String.id, 'left');
            }
        }

        if (isLanguageChanged == true) {
            autoPlayAudio(textsToGetSpeech[1].id);
        }
    }

    function setAutoPlayOn(audioId) {
        sessionStorage.setItem('isAutoPlayEnabled', true);
        playAudio(audioId);
    }

    function autoPlayAudio(audioId) {
        let isAutoPlayEnabled = sessionStorage.getItem('isAutoPlayEnabled');

        if (isAutoPlayEnabled) {
            playAudio(audioId);
        }
    }

    async function playAudioWithRememberingLastPause(audioId) {
        const currentAudioIdElement = document.getElementById(audioId);

        if (currentAudioIdElement.paused == false) {
            currentAudioIdElement.pause();

            $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);

            var allAudioEls = $('audio');

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != 'globalAudioElement') {
                    a.pause();
                    $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
                }
            });

            if (previousPlayingMessageId != audioId) {
                let currentAudio = document.getElementById(audioId);
                currentAudio.playbackRate = 1.1;
                currentAudio.play();

                previousPlayingMessageId = audioId;

                $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);
                // Show audio progressbar when audio is playing

                currentAudio.onended = function () {
                    previousPlayingMessageId = '';
                    $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
                };
            } else {
                sessionStorage.removeItem('isAutoPlayEnabled');
            }
        } else {
            var allAudioEls = $('audio');

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != 'globalAudioElement') {
                    a.pause();

                    $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
                }
            });

            let currentAudio = document.getElementById(audioId);
            currentAudio.playbackRate = 1.1;
            currentAudio.play();
            previousPlayingMessageId = audioId;

            $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);

            currentAudio.onended = function () {
                previousPlayingMessageId = '';

                $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
            };
        }
    }

    async function playAudio(audioId) {
        playAudioWithRememberingLastPause(audioId);

        return;
        const globalAudioElement = document.getElementById('globalAudioElement');

        if (globalAudioElement.paused == false) {
            globalAudioElement.pause();
            globalAudioElement.currentTime = 0;

            $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);

            var allAudioEls = $('audio');

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != 'globalAudioElement') {
                    a.pause();
                    a.currentTime = 0;
                    $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
                }
            });

            if (previousPlayingMessageId != audioId) {
                globalAudioElement.src = document.getElementById(audioId).src;
                globalAudioElement.playbackRate = 1.1;
                globalAudioElement.play();
                previousPlayingMessageId = audioId;

                $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);
                // Show audio progressbar when audio is playing

                globalAudioElement.onended = function () {
                    previousPlayingMessageId = '';
                    $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
                };
            } else {
                sessionStorage.removeItem('isAutoPlayEnabled');
            }
        } else {
            var allAudioEls = $('audio');

            allAudioEls.each(function () {
                var a = $(this).get(0);

                if (a.id != 'globalAudioElement') {
                    a.pause();
                    a.currentTime = 0;

                    $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
                }
            });

            globalAudioElement.src = document.getElementById(audioId).src;
            globalAudioElement.playbackRate = 1.1;
            globalAudioElement.play();
            previousPlayingMessageId = audioId;

            $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);

            globalAudioElement.onended = function () {
                previousPlayingMessageId = '';

                $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
            };
        }
    }
    function restartSession(showConfirmation) {
        function proceedForSessionRestart() {
            scrollToBottom();
            clearChatHistory();
            const fingerPrintId = sessionStorage.getItem('fingerPrintId');

            createSession(fingerPrintId)
                .then((sessionResult) => {
                    popularQueriesService.resetUsedQueries();
                    getTranslations();
                })
                .catch((sessionError) => {
                    handleError(sessionError);
                });
        }

        if (showConfirmation == true) {

            const confirmationMessage = $(
                '#chatbot-restart-session-confirmation-message'
            ).val();
            showChatbotConfirmationModal(
                'restart-session',
                confirmationMessage,
                (data) => { }
            );
        } else {
            proceedForSessionRestart();
        }
    }

    function clearChatHistory() {
        $('.conversationsWrapper').remove();
        var defaultPlaceholderMessage = currentLanguageInfo.translations.messages.ask_ur_question; //translations.find((f) => f.key == 'ask_ur_question').value;
        changeInputPlaceholderValue(defaultPlaceholderMessage);
    }

    function createGlobalAudioElement() {
        const div = document.createElement('div');
        div.className = 'message left';

        const audio = document.createElement('audio');
        audio.style.padding = '6px';

        audio.setAttribute('controls', 'controls');
        audio.setAttribute('controlsList', 'nodownload');
        audio.setAttribute('id', 'globalAudioElement');

        div.appendChild(audio);
        div.style.display = 'none'; // Hide audio player as we don't need to display it to the user. It will be played using a audio icon available next to text message
        $('#message-list').append(div);
    }

    function changeInputPlaceholderValue(valueToChange) {

        var defaultPlaceholderMessage = currentLanguageInfo.translations.messages.ask_ur_question; //translations.find((f) => f.key == 'ask_ur_question').value;

        $(userQuestionTextBox).attr(
            'placeholder',
            valueToChange != undefined ? valueToChange : defaultPlaceholderMessage
        );

        $(userQuestionTextBox).trigger('keyup');

        autosize.update($(userQuestionTextBox));
    }

    function showChatbotConfirmationModal(
        type,
        confirmationMessage,
        closeCallback
    ) {
        $('#chatbotConfirmationModalSaveButton').data('modal-type', type);

        chatbotConfirmationModal = new bootstrap.Modal(
            '#' + chatbotConfirmationModalId,
            modalOptions
        );

        $('#chatbot-restart-session-confirmation-message').append(
            confirmationMessage
        );
        chatbotConfirmationModal.show();

        chatbotConfirmationModalElement.addEventListener(
            'hidden.bs.modal',
            (event) => {
                closeCallback(event);
                // do something...
            }
        );
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

    function setLocationInfo() {

        function getLocation() {
            navigator.geolocation.getCurrentPosition((position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;

            }, (errorCallback) => {

                console.log('errorCallback: ', errorCallback);
            });
        }

        if (navigator.geolocation) {

            navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
                if (result.state == 'granted') {

                    getLocation();

                } else if (result.state == 'prompt') {
                    getLocation();

                } else if (result.state == 'denied') {
                    // Display instructions to reactivate location sharing in browser settings
                    console.log('User denied the permission');
                }
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
})();
