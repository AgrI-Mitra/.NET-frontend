(async function () {

    var apiUrlConfig = {
        chatbotApiBaseUrl: document.getElementById('apiUrl').getAttribute('value'),
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

    var rawAllLanguagesTranslations = JSON.parse(JSON.stringify(allLanguagesTranslations)); // Deep copy allLanguagesTranslations;

    var translationsKeyValues;
    marked.use({
        breaks: true,
        gfm: true
    });

    let latitude;
    let longitude;
    let isLanguageDetected = false;
    let isWelcomeMessageAutoPlayed = false;

    var currentParentRoute = "/Home/";

    var isRecording = false;
    var tour;

    var sessionAutoRestartTimeoutId;

    var isChangeLanguageRequestInProgress = null;

    var isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;

    var isGetTextToSpeechFromBhashiniRequestInProgress = null;

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
    let rawCurrentLanguageInfo;

    var currentUserId = null;
    var sessionId = null;
    var previousSessionId = null;
    var currentConversationId = null;

    var hasConversationLimitReached = false;
    let lastReponseProvider = '';
    let wadhwaniResponseCounter = 0;
    var chatbotConfirmationModalId = 'chatbotConfirmationModal';
    var startNewConversationModalId = 'startNewConversationModal';
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
    var imagesRootPath = '../Content/images/';
    var startAudioImagePath = '../Content/images/start-audio.svg';
    var stopAudioImagePath = '../Content/images/stop-audio.svg';
    var thumbDislikeImagePath = '../Content/images/hand-thumbs-down.svg';
    var thumbDislikeHighlightImagePath =
        '../Content/images/hand-thumbs-down-fill.svg';
    const thumbLikeImagePath = '../Content/images/hand-thumbs-up.svg';
    const thumbLikeHighlightImagePath = '../Content/images/hand-thumbs-up-fill.svg';
    var chatbotLogoImagePath = '../Content/images/chatbot.png'; //"../Content/images/MOA_logo.png";

    // Voice Recording button related variables - To Apply animation, change icon images etc. - START
    var voiceRecordButtonClass = '.voiceRecordButtonClass';
    const voiceRecordButtonContainer = document.querySelectorAll(voiceRecordButtonClass); //document.getElementsByClassName('voiceRecordButtonClass');
    var voiceRecordingImageClass = '.recordingImageClass';
    var stopVoiceRecordingImagePath = '../Content/images/stop-recording.svg';
    var startVoiceRecordingImagePath = '../Content/images/start-recording.svg';
    var voiceRecordMicCircleClass = '.voiceRecordMicCircleClass';
    var voiceRecordingStartBgColorClass = 'voice-start-recording-border-color';
    var voiceRecordingStopBgColorClass = 'voice-stop-recording-border-color';
    let currentScreenName;
    // Voice Recording button related variables - To Apply animation, change icon images etc. - END

    var sendTextButtonId = '#sendTextButton';
    var mediaRecorder;

    // shim for AudioContext when it's not avb.
    var previousPlayingMessageId = ''; // To maintain previous playing message id. So when user tries to play another message in middle of current playing message
    var lastUserAudioMessageId = '';
    // We need to stop current playing message.
    var isUserTypedQuestion = false;
    var isSampleQueryUsed = false;

    const chatbotConfirmationModalElement = document.getElementById(
        chatbotConfirmationModalId
    );
    const submitFeedbackModalElement = document.getElementById(
        submitFeedbackModalId
    );

    const startNewConversationModalElement = document.getElementById(
        startNewConversationModalId
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
    var startNewConversationModal;
    var currentConversationId;
    const voiceSelectionChannel = new BroadcastChannel('voice_selection');
    let recordTimeout = null;
    voiceSelectionChannel.onmessage = async function (event) {
        await getWelcomeGreetingsAudio();
    };

    // When browser tab is about to close
    window.onbeforeunload = function () {
        if (chatbotConfirmationModal) {
            chatbotConfirmationModal.hide();
        }

        if (startNewConversationModal) {
            startNewConversationModal.hide();
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

        //if (isGetUITranslationsRequestInProgress) {
        //    isGetUITranslationsRequestInProgress.abort();
        //}

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
    //function chatLoader(category) {

    //    if (category == 'base64audio') {

    //        //audioVisualizer.startAutoVisualizer();
    //        visualizerControl.startIdleAnimation();
    //    } else {
    //        let chatMessageWrapperStartingDivHtmlContent =
    //            getChatMessageWrapperStartingDivHtmlContent(
    //                true,
    //                'responseLoader',
    //                'conversationsWrapper'
    //            ); // Main chat message wrapper
    //        let chatbotRespondingHtmlContent =
    //            getChatbotRespondingIndicatorHtmlContent();

    //        const responseLoader =
    //            chatMessageWrapperStartingDivHtmlContent +
    //            chatMessageWrapperColumnTwoStartingDivHtmlContent +
    //            startingDivHtmlContent +
    //            chatbotLogoHtmlContent +
    //            spanStartingHtmlContent +
    //            chatbotRespondingHtmlContent +
    //            spanClosingHtmlContent +
    //            closingDivHtmlContent +
    //            closingDivHtmlContent +
    //            closingDivHtmlContent;

    //        // $('#message-list').append(responseLoader);
    //        const messageList = document.getElementById('message-list');
    //        messageList.appendChild(responseLoader);
    //    }
    //}
    function chatLoader(category) {
        if (category == 'base64audio') {
            // audioVisualizer.startAutoVisualizer();
            visualizerControl.startIdleAnimation(currentScreenName);
        } else {
            // Main chat message wrapper
            let chatMessageWrapperElement = getChatMessageWrapperStartingDivHtmlContent(true, 'responseLoader', 'conversationsWrapper');
            let chatbotRespondingElement = getChatbotRespondingIndicatorHtmlContent();

            // Assuming the variables contain HTML elements instead of strings
            const chatMessageColumnTwoElement = getChatMessageWrapperColumnTwoStartingDivHtmlContent(); //chatMessageWrapperColumnTwoStartingDivHtmlContent;
            const userDivElement = getStartingDivHtmlContent();//startingDivHtmlContent;
            const chatbotLogoElement = getChatbotLogoHtmlContent();//chatbotLogoHtmlContent;
            const messageSpanElement = getStartingSpanHtmlContent();//spanStartingHtmlContent;

            // Append the chatbot responding indicator to the span element
            messageSpanElement.appendChild(chatbotRespondingElement);

            // Append the elements to their respective parents
            userDivElement.appendChild(chatbotLogoElement);
            userDivElement.appendChild(messageSpanElement);
            chatMessageColumnTwoElement.appendChild(userDivElement);
            chatMessageWrapperElement.appendChild(chatMessageColumnTwoElement);

            // Append the response loader to the message list
            const messageList = document.getElementById('message-list');
            messageList.appendChild(chatMessageWrapperElement);
        }
    }

    // This method is used to hide the chatbot response in progress indicator
    function hideChatLoader(category) {
        //$('#chatbotMessageWrapper-responseLoader').remove();
        let responseLoaderElement = document.getElementById('chatbotMessageWrapper-responseLoader');
        if (responseLoaderElement) {
            responseLoaderElement.remove();
        }

        if (category == 'base64audio') {
            //audioVisualizer.stopAutoVisualizer();
            visualizerControl.stopIdleAnimation(currentScreenName);
        }
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
            document.querySelector(sendTextButtonId).style.opacity = 1;
            document.querySelector(sendTextButtonId).disabled = false;
        } else {
            document.querySelector(sendTextButtonId).style.opacity = 0.4;
            document.querySelector(sendTextButtonId).disabled = true;

            document.querySelector(userQuestionTextBox).value = null;
        }

        autosize.update(document.querySelector(userQuestionTextBox));
        //$(userQuestionTextBox)[0].value = null;
        //autosize.update($(userQuestionTextBox));

    }

    //Reusable methods to set html content to show chat messages by user as well as chatbot - START
    /**
     * This method is used to get html content for chat message wrapper
     * @param {any} isSystemMessage
     * @param {any} customId
     * @returns
     */
    // function getChatMessageWrapperStartingDivHtmlContent(
    //     isSystemMessage,
    //     customId,
    //     customClass
    // ) {
    //     var systemMessageBackgroundClass =
    //         isSystemMessage == true ? 'system-msg-bg' : '';
    //     var customChatMessageWrapperId =
    //         customId != null || customId != undefined
    //             ? "id='" + 'chatbotMessageWrapper-' + customId + "'"
    //             : '';

    //     var customChatMessageWrapperClass =
    //         customClass != null || customClass != undefined ? customClass + ' ' : ' ';

    //     return (
    //         "<div class='msg-content chatbot-message-wrapper " +
    //         customChatMessageWrapperClass +
    //         systemMessageBackgroundClass +
    //         "'" +
    //         customChatMessageWrapperId +
    //         '>'
    //     );
    // }
    function getChatMessageWrapperStartingDivHtmlContent(
        isSystemMessage,
        customId,
        customClass
    ) {
        // Create a div element
        var div = document.createElement('div');

        // Add common classes
        div.classList.add('msg-content', 'chatbot-message-wrapper');

        // Add system message background class if applicable
        if (!isSystemMessage) {
            div.classList.add('user-mesg-content');
        }

        // Add custom ID if provided
        if (customId != null && customId != undefined) {
            div.id = 'chatbotMessageWrapper-' + customId;
        }

        // Add custom classes if provided
        if (customClass != null && customClass != undefined) {
            customClass.split(' ').forEach(cls => div.classList.add(cls));
        }

        return div;
    }

    // function getStartingDivHtmlContent() {
    //     return '<div>';
    // }
    function getStartingDivHtmlContent() {
        // Create a div element
        var div = document.createElement('div');
        return div;
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
    //function getStartingSpanHtmlContent(customId) {
    //    var customSpanWrapperId =
    //        customId != null || customId != undefined
    //            ? "id='" + 'chat-message-span-wrapper-' + customId + "'"
    //            : '';

    //    return "<span class='chat-message-span-wrapper'" +
    //        " " +
    //        customSpanWrapperId +
    //        ">";
    //}
    function getStartingSpanHtmlContent(customId) {
        // Create a span element
        var span = document.createElement('span');

        // Add common class
        span.classList.add('chat-message-span-wrapper');

        // Add custom ID if provided
        if (customId != null && customId != undefined) {
            span.id = 'chat-message-span-wrapper-' + customId;
        }

        return span;
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
    //function getChatMessageWrapperColumnTwoStartingDivHtmlContent() {
    //    return "<div class='chatbot-message-wrapper-column-two'>";
    //}
    function getChatMessageWrapperColumnTwoStartingDivHtmlContent() {
        // Create a div element
        var div = document.createElement('div');

        // Add the specific class
        div.classList.add('chatbot-message-wrapper-column-two');

        return div;
    }

    /**
     * This method is used to get chat message wrapper column 3 html content
     * which will be used to show action buttons such as message play as audio icon, like dislike buttons.
     * @returns
     */
    //function getChatMessageWrapperColumnThreeStartingDivHtmlContent() {
    //    return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three me-md-2'>";
    //}
    function getChatMessageWrapperColumnThreeStartingDivHtmlContent() {
        // Create a div element
        var div = document.createElement('div');

        // Add the specific classes
        div.classList.add('d-flex', 'align-self-start', 'chatbot-message-wrapper-column-three', 'me-md-2');

        return div;
    }

    //function getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(customId, keepHidden) {
    //    return "<div class='d-flex align-self-start chatbot-message-wrapper-column-three-part-two" + (keepHidden == true ? " d-none'" : "'") + (customId ? "id='chatbot-message-wrapper-column-three-part-two" + customId + "'" : "") + "'me-md-2'>";
    //}
    function getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(customId, keepHidden) {
        // Create a div element
        var div = document.createElement('div');

        // Add the specific classes
        div.classList.add('d-flex', 'align-self-start', 'chatbot-message-wrapper-column-three-part-two', 'me-md-2');

        // Add the 'd-none' class if keepHidden is true
        if (keepHidden === true) {
            div.classList.add('d-none');
        }

        // Add custom ID if provided
        if (customId) {
            div.id = 'chatbot-message-wrapper-column-three-part-two' + customId;
        }

        return div;
    }

    function showChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(customId) {
        //$('#chatbot-message-wrapper-column-three-part-two' + customId).removeClass('d-none');
        var chatbotMessageWrapperColumnThreePartTwo = document.getElementById('chatbot-message-wrapper-column-three-part-two' + customId);
        if (chatbotMessageWrapperColumnThreePartTwo) {
            chatbotMessageWrapperColumnThreePartTwo.classList.remove('d-none');
        }
    }

    /**
     * This method is used to get html content for chatbot logo
     * @returns
     */
    //function getChatbotLogoHtmlContent() {
    //    return (
    //        "<img src='" +
    //        chatbotLogoImagePath +
    //        "' class='chatbot-message-wrapper-column-one'>"
    //    );
    //}
    function getChatbotLogoHtmlContent() {
        // Create an img element
        var img = document.createElement('img');

        // Set the src attribute
        img.src = chatbotLogoImagePath;

        // Add the specific class
        img.classList.add('chatbot-message-wrapper-column-one');

        return img;
    }

    /**
     * This method is used to get html content for user logo
     * @returns
     */
    //function getUserLogoHtmlContent() {
    //    return "<img src='../Content/images/user.svg' class='chat-dp-img-width user-avatar-img rounded-circle chatbot-message-wrapper-column-one'>";
    //}
    function getUserLogoHtmlContent() {
        // Create an img element
        var img = document.createElement('img');

        // Set the src attribute
        img.src = '../Content/images/user.svg';

        // Add the specific classes
        img.classList.add('chat-dp-img-width', 'user-avatar-img', 'rounded-circle', 'chatbot-message-wrapper-column-one');

        return img;
    }

    /**
     * This method is used to get html content for audio message image icon
     * @param {any} audioId
     * @returns
     */
    //function getChatMessageAudioImageHtmlContent(audioId) {
    //    return (
    //        "<img id='playMessageImg-" +
    //        audioId +
    //        "'" +
    //        "data-audio-id='" +
    //        audioId +
    //        "'" +
    //        "src='../Content/images/start-audio.svg' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='playAudioMessage'>"
    //    );
    //}
    function getChatMessageAudioImageHtmlContent(audioId) {
        // Create an img element
        var img = document.createElement('img');

        // Set the id attribute
        img.id = 'playMessageImg-' + audioId;

        // Set the data-audio-id attribute
        img.setAttribute('data-audio-id', audioId);

        // Set the src attribute
        img.src = '../Content/images/start-audio.svg';

        // Set the alt attribute
        img.alt = 'avatar 1';

        // Add the specific class
        img.classList.add('chatbot-message-action-buttons');

        // Set the data-action-name attribute
        img.setAttribute('data-action-name', 'playAudioMessage');

        return img;
    }

    /**
     * This method is used to get html content for displaying feedback action buttons
     * @param {any} messageId
     * @returns
     */
    //function getFeedbackButtonsHtmlContent(messageId) {
    //    return (
    //        "<img id='thumbLikeButton-" +
    //        messageId +
    //        "'" +
    //        "data-message-id='" +
    //        messageId +
    //        "'" +
    //        "src='" +
    //        thumbLikeImagePath +
    //        "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='likeMessage'>" +
    //        "<img id='thumbDislikeButton-" +
    //        messageId +
    //        "'" +
    //        "data-message-id='" +
    //        messageId +
    //        "'" +
    //        "src='" +
    //        thumbDislikeImagePath +
    //        "' alt='avatar 1' class='chatbot-message-action-buttons' data-action-name='dislikeMessage'>"
    //    );
    //}
    function getFeedbackButtonsHtmlContent(messageId) {
        // Create a fragment to hold the buttons
        var fragment = document.createDocumentFragment();

        // Create the like button
        var likeButton = document.createElement('img');
        likeButton.id = 'thumbLikeButton-' + messageId;
        likeButton.setAttribute('data-message-id', messageId);
        likeButton.src = thumbLikeImagePath;
        likeButton.alt = 'avatar 1';
        likeButton.classList.add('chatbot-message-action-buttons');
        likeButton.setAttribute('data-action-name', 'likeMessage');

        // Create the dislike button
        var dislikeButton = document.createElement('img');
        dislikeButton.id = 'thumbDislikeButton-' + messageId;
        dislikeButton.setAttribute('data-message-id', messageId);
        dislikeButton.src = thumbDislikeImagePath;
        dislikeButton.alt = 'avatar 1';
        dislikeButton.classList.add('chatbot-message-action-buttons');
        dislikeButton.setAttribute('data-action-name', 'dislikeMessage');

        // Append buttons to the fragment
        fragment.appendChild(likeButton);
        fragment.appendChild(dislikeButton);

        return fragment;
    }

    /**
     * This method is used to get html content to display chatbot typing indicator
     * @returns
     */
    //function getChatbotRespondingIndicatorHtmlContent() {
    //    return "<div class='ms-2 dot-flashing'></div>";
    //}
    function getChatbotRespondingIndicatorHtmlContent() {
        // Create a div element
        var div = document.createElement('div');

        // Add the specific classes
        div.classList.add('ms-2', 'dot-flashing');

        return div;
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

    const userLogoHtmlContent = getUserLogoHtmlContent();
    const chatbotLogoHtmlContent = getChatbotLogoHtmlContent();
    const chatMessageWrapperColumnTwoStartingDivHtmlContent =
        getChatMessageWrapperColumnTwoStartingDivHtmlContent(); // Second column inside chat message wrapper
    const chatMessageWrapperColumnThreeStartingDivHtmlContent =
        getChatMessageWrapperColumnThreeStartingDivHtmlContent(); // Third column inside chat message wrapper
    const chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent =
        getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(); // Third column inside chat message wrapper
    //let spanStartingHtmlContent = getStartingSpanHtmlContent();
    let spanClosingHtmlContent = getClosingSpanHtmlContent();
    let startingDivHtmlContent = getStartingDivHtmlContent();
    let closingDivHtmlContent = getClosingDivHtmlContent();

    /**
     * This method is used to update the translation in ui whenever language is changed
     * @param {any} translationsToUpdate
     */
    function updateTranslations(translationsToUpdate, keysToUpdate) {
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
            },
            {
                translationType: 'messages',
                translationKey: 'confirmation',
                htmlElementKeyName: 'message_confirmation',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
                ignore: true
            },
            {
                translationType: 'messages',
                translationKey: 'session_restart_confirmation_message',
                htmlElementKeyName: 'message_session_restart_confirmation_message',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text',
                ignore: true
            },
            {
                translationType: 'messages',
                translationKey: 'maintenance_mode_header',
                htmlElementKeyName: 'message_maintenance_mode_header',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text'
            },
            {
                translationType: 'messages',
                translationKey: 'maintenance_mode_body',
                htmlElementKeyName: 'message_maintenance_mode_body',
                htmlElementKeyAttributeType: '.',
                htmlElementValueAttributeType: 'text'
            },
            //{
            //    translationType: 'lables',
            //    translationKey: 'tutorial',
            //    htmlElementKeyName: 'startAppTourButton',
            //    htmlElementKeyAttributeType: '#',
            //    htmlElementValueAttributeType: 'text'
            //},
            {
                translationType: 'lables',
                translationKey: 'male',
                htmlElementKeyName: 'maleVoice',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text'
            }, {
                translationType: 'lables',
                translationKey: 'female',
                htmlElementKeyName: 'femaleVoice',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text'
            }, {
                translationType: 'messages',
                translationKey: 'select_voice',
                htmlElementKeyName: 'voiceSelectionTitle',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text'
            },
            {
                translationType: 'lables',
                translationKey: 'start_new_chat',
                htmlElementKeyName: 'startNewChat',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text'
            },
            {
                translationType: 'messages',
                translationKey: 'chat_limit_reached',
                htmlElementKeyName: 'conversationLimitReachedMessage',
                htmlElementKeyAttributeType: '#',
                htmlElementValueAttributeType: 'text'
            }
        ];

        for (var i = 0; i < translationsMappingIds.length; i++) {

            let currentTranslationMappingDetails = translationsMappingIds[i];

            if (keysToUpdate) {
                // Find the keys to update and only update these translations
                if (keysToUpdate.indexOf(currentTranslationMappingDetails.translationKey) < 0) {
                    continue;
                } else {
                    mapTranslations(currentTranslationMappingDetails);
                }
            } else {
                //let currentTranslation = currentLanguageInfo.translations[currentTranslationMappingDetails.translationType];

                mapTranslations(currentTranslationMappingDetails);
            }


        }

        if (!keysToUpdate) {
            initAppTour();
        }
    }

    function mapTranslations(currentTranslationMappingDetails) {
        let currentTranslation = currentLanguageInfo.translations[currentTranslationMappingDetails.translationType];

        if (currentTranslation && currentTranslation[currentTranslationMappingDetails.translationKey]) {

            const currentTranslationValue = currentTranslation[currentTranslationMappingDetails.translationKey];
            // Update page title
            if (currentTranslationMappingDetails.translationKey == 'title') {
                document.title = currentTranslationValue;
            }

            /*
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
            */
            const htmlElement = document.querySelector(
                currentTranslationMappingDetails.htmlElementKeyAttributeType +
                currentTranslationMappingDetails.htmlElementKeyName
            );

            if (htmlElement) {
                if (
                    currentTranslationMappingDetails.htmlElementValueAttributeType ===
                    'text'
                ) {
                    htmlElement.innerHTML = currentTranslationValue;
                } else {
                    htmlElement.setAttribute(
                        currentTranslationMappingDetails.htmlElementValueAttributeType,
                        currentTranslationValue
                    );
                }
            }
        }
        else {
            console.log('translation missing: ', currentTranslationMappingDetails);
        }
    }

    /**
     * This method is used to listen language change event
     */
    function languageChangeListener() {

        /*
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
        */

        //const languageLabels = document.querySelectorAll('.languagesLabels');

        //languageLabels.forEach(languageLabel => {
        //    languageLabel.addEventListener('click', function (ev) {
        //        const languageCultureCode = this.dataset.languageCultureCode;
        //        const languageEnglishLabel = this.dataset.languageEnglishLabel;
        //        const languageCultureLabel = this.dataset.languageCultureLabel;
        //        const currentLanguageCultureCode = this.dataset.currentLanguageCultureCode;

        //        hideAllThePopovers();
        //        changeLanguage(
        //            languageCultureCode,
        //            languageEnglishLabel,
        //            languageCultureLabel,
        //            currentLanguageCultureCode
        //        );
        //    });
        //});
        document.addEventListener('click', function (ev) {

            const languageLabel = (ev.target).closest('.languagesLabels');
            if (languageLabel) {
                const languageCultureCode = languageLabel.getAttribute('data-language-culture-code');
                const languageEnglishLabel = languageLabel.getAttribute('data-language-english-label');
                const languageCultureLabel = languageLabel.getAttribute('data-language-culture-label');
                const currentLanguageCultureCode = languageLabel.getAttribute('data-current-language-culture-code');

                hideAllThePopovers();

                changeLanguage(languageCultureCode, languageEnglishLabel, languageCultureLabel, currentLanguageCultureCode);
            }
        });
    }

    /**
     * This method is used to listen scheme change event
     */
    function schemeChangeListener() {

        /*
        $(document).on(
            'click',
            '.scheme-label-wrapper',
            async function (ev) {
                let selectedSchemeId = this.dataset.schemeId; //$(this).data('scheme-id');

                const languageCultureCode = getSetCurrentLanguageCode();

                removePreviousWelcomeGreetingMessage(languageCultureCode);

                hideAllThePopovers();

                // Proceed ahead only if selected scheme is different than previous one
                if (selectedSchemeId != schemesInfo.currentScheme) {

                    schemesInfo.bindSchemesToDropdown(schemesInfo.list, selectedSchemeId);
                    //bindPopularQuestions();

                    // Get current scheme change message
                    currentLanguageInfo = GetDynamicTranslations();
                    //await getWelcomeGreetingsAudio();
                    const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.welcome_greeting;
                    //updateTranslations([], ["welcome_greeting"]);
                    //updateWelcomeGreetingMessage();
                    const uniqueMessageId = 'welcome-greeting-message-base64-' + languageCultureCode + '-audio';

                    //Add welcome greeting change message to chat screen
                    updateChatMessagesList(
                        currentLanguageChangeMessage, uniqueMessageId,
                        '',
                        true,
                        true,
                        true
                    );
                }
            }
        );
        */
        //const schemeLabelWrappers = document.querySelectorAll('.scheme-label-wrapper');

        //schemeLabelWrappers.forEach(schemeLabelWrapper => {
        //    schemeLabelWrapper.addEventListener('click', async function (ev) {
        //        let selectedSchemeId = this.dataset.schemeId; //$(this).data('scheme-id');

        //        const languageCultureCode = getSetCurrentLanguageCode();

        //        removePreviousWelcomeGreetingMessage(languageCultureCode);

        //        hideAllThePopovers();

        //        // Proceed ahead only if selected scheme is different than previous one
        //        if (selectedSchemeId != schemesInfo.currentScheme) {

        //            schemesInfo.bindSchemesToDropdown(schemesInfo.list, selectedSchemeId);
        //            //bindPopularQuestions();

        //            // Get current scheme change message
        //            currentLanguageInfo = GetDynamicTranslations();
        //            //await getWelcomeGreetingsAudio();
        //            const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.welcome_greeting;
        //            //updateTranslations([], ["welcome_greeting"]);
        //            //updateWelcomeGreetingMessage();
        //            const uniqueMessageId = 'welcome-greeting-message-base64-' + languageCultureCode + '-audio';

        //            //Add welcome greeting change message to chat screen
        //            updateChatMessagesList(
        //                currentLanguageChangeMessage, uniqueMessageId,
        //                '',
        //                true,
        //                true,
        //                true
        //            );
        //        }
        //    });
        //});

        document.addEventListener('click', async function (ev) {
            const schemeLabelWrapper = (ev.target).closest('.scheme-label-wrapper');

            if (schemeLabelWrapper) {
                let selectedSchemeId = schemeLabelWrapper.dataset.schemeId;

                const languageCultureCode = getSetCurrentLanguageCode();

                removePreviousWelcomeGreetingMessage(languageCultureCode);

                hideAllThePopovers();

                // Proceed ahead only if selected scheme is different than previous one
                if (selectedSchemeId !== schemesInfo.currentScheme) {
                    schemesInfo.bindSchemesToDropdown(schemesInfo.list, selectedSchemeId);

                    // Get current scheme change message
                    let currentLanguageInfo = GetDynamicTranslations();
                    const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.welcome_greeting;
                    const uniqueMessageId = 'welcome-greeting-message-base64-' + languageCultureCode + '-audio';

                    // Add welcome greeting change message to chat screen
                    updateChatMessagesList(
                        currentLanguageChangeMessage,
                        uniqueMessageId,
                        '',
                        true,
                        true,
                        true
                    );
                }
            }
        });
    }

    //function voiceRecorderListener() {

    //    $(document).on(
    //        'mousedown mouseup touchstart touchend',
    //        voiceRecordButtonClass,
    //        function (ev) {
    //            console.log('voiceRecorderListener', ev.type);
    //            let currentScreenName = $(this).data('screen-name');

    //            let isRecordedStarted = false;
    //            if (ev.type === 'mousedown' || ev.type === 'touchstart') {
    //                isRecordedStarted = true;

    //                // Add recording class to voice record button
    //                $(this).addClass('recording');
    //                //micButtonContainer.classList.add('recording');
    //            } else {
    //                // Remove recording class from voice record button
    //                $(this).removeClass('recording');
    //                //micButtonContainer.classList.remove('recording');
    //            }
    //            recordAudio(currentScreenName, isRecordedStarted);
    //        }
    //    );
    //}

    // function voiceRecorderListener() {

    //     let isRecordedStarted = false;

    //     $(document).on(
    //         'mousedown touchstart mouseup touchend',
    //         voiceRecordButtonClass,
    //         function (ev) {

    //             currentScreenName = $(this).data('screen-name');

    //             if (ev.type === 'mousedown' || ev.type === 'touchstart') {
    //                 isRecordedStarted = true;
    //                 //$(this).addClass('recording');

    //                 // For each element in voiceRecordButtonContainer, add recording class
    //                 voiceRecordButtonContainer.forEach(function () {
    //                     $(this).addClass('recording');
    //                 });

    //                 //voiceRecordButtonContainer.classList.add('recording');

    //                 // Start a timeout to call recordAudio after 1 second
    //                 recordTimeout = window.setTimeout(() => {
    //                     recordAudio(currentScreenName, isRecordedStarted);
    //                 }, 200);
    //             } else if (ev.type === 'mouseup' || ev.type === 'touchend') {
    //                 isRecordedStarted = false;
    //                 //$(this).removeClass('recording');
    //                 //voiceRecordButtonContainer.classList.remove('recording');

    //                 // For each element in voiceRecordButtonContainer, remove recording class
    //                 voiceRecordButtonContainer.forEach(function () {
    //                     $(this).removeClass('recording');
    //                 });

    //                 // If the button is released before 1 second, clear the timeout
    //                 if (recordTimeout) {
    //                     clearTimeout(recordTimeout);
    //                     recordTimeout = null;
    //                 } else {
    //                     // If the button was held for more than 1 second, stop recording

    //                 }

    //                 recordAudio(currentScreenName, isRecordedStarted);
    //             }
    //         }
    //     );
    // }

    //function voiceRecorderListener() {
    //    let isRecordedStarted = false;

    //    // Function to handle the start of recording
    //    function startRecordingHandler(ev) {
    //        currentScreenName = ev.target.getAttribute('data-screen-name');
    //        isRecordedStarted = true;

    //        // Add recording class to each element in voiceRecordButtonContainer
    //        voiceRecordButtonContainer.forEach(function (element) {
    //            element.classList.add('recording');
    //        });

    //        // Start a timeout to call recordAudio after 200 milliseconds
    //        recordTimeout = window.setTimeout(() => {
    //            recordAudio(currentScreenName, isRecordedStarted);
    //        }, 200);
    //    }

    //    // Function to handle the end of recording
    //    function stopRecordingHandler(ev) {
    //        isRecordedStarted = false;

    //        // Remove recording class from each element in voiceRecordButtonContainer
    //        voiceRecordButtonContainer.forEach(function (element) {
    //            element.classList.remove('recording');
    //        });

    //        // If the button is released before 200 milliseconds, clear the timeout
    //        if (recordTimeout) {
    //            clearTimeout(recordTimeout);
    //            recordTimeout = null;
    //        } else {
    //            // If the button was held for more than 200 milliseconds, stop recording
    //            recordAudio(currentScreenName, isRecordedStarted);
    //        }
    //    }

    //    // Attach event listeners to elements matching voiceRecordButtonClass
    //    document.querySelectorAll(voiceRecordButtonClass).forEach(function (element) {
    //        element.addEventListener('mousedown', startRecordingHandler);
    //        element.addEventListener('touchstart', startRecordingHandler);
    //        element.addEventListener('mouseup', stopRecordingHandler);
    //        element.addEventListener('touchend', stopRecordingHandler);
    //    });
    //}

    function voiceRecorderListener() {
        let isRecordedStarted = false;

        document.addEventListener('mousedown', handleEvent);
        document.addEventListener('touchstart', handleEvent);
        document.addEventListener('mouseup', handleEvent);
        document.addEventListener('touchend', handleEvent);

        function handleEvent(ev) {
            const target = ev.target.closest(voiceRecordButtonClass);
            if (!target) return;

            currentScreenName = target.getAttribute('data-screen-name');

            if (ev.type === 'mousedown' || ev.type === 'touchstart') {
                isRecordedStarted = true;

                // Add 'recording' class to each element in voiceRecordButtonContainer
                voiceRecordButtonContainer.forEach(element => {

                    if (element.hasAttribute('data-screen-name') && element.getAttribute('data-screen-name') === currentScreenName) {
                        element.classList.add('recording');
                    }
                });

                // Start a timeout to call recordAudio after 1 second
                recordTimeout = window.setTimeout(() => {
                    recordAudio(currentScreenName, isRecordedStarted);
                }, 200);
            } else if (ev.type === 'mouseup' || ev.type === 'touchend') {
                isRecordedStarted = false;

                // Remove 'recording' class from each element in voiceRecordButtonContainer
                voiceRecordButtonContainer.forEach(element => {
                    element.classList.remove('recording');
                });

                // If the button is released before 1 second, clear the timeout
                if (recordTimeout) {
                    clearTimeout(recordTimeout);
                    recordTimeout = null;
                } else {
                    // If the button was held for more than 1 second, stop recording
                }

                recordAudio(currentScreenName, isRecordedStarted);
            }
        }
    }
    function generalQuestionClickListener() {

        document.addEventListener('click', function (event) {
            const element = event.target;
            if (element.classList.contains('popular-query-card')) {
                event.stopPropagation();
                const popularQuestion = card.dataset.popularQuestion;
                const popularQuestionKey = card.id;
                copyPopularQuestionInTextBox(popularQuestion, false, true);
                toggleHamburger();
            }
        });

        //const popularQueryCards = document.querySelectorAll('.popular-query-card');

        //popularQueryCards.forEach(card => {
        //    card.addEventListener('click', function (event) {
        //        event.stopPropagation();
        //        const popularQuestion = card.dataset.popularQuestion;
        //        const popularQuestionKey = card.id;
        //        copyPopularQuestionInTextBox(popularQuestion, false, true);
        //        toggleHamburger();
        //    });
        //});
    }

    /**
     * This method is used to listen restart session button click event
     */
    // function restartSessionButtonOnClickListener() {

    //     $(document).on(
    //         'click',
    //         '#restartSessionButton',
    //         function (ev) {

    //             restartSession(true);
    //         }
    //     );
    // }
    function restartSessionButtonOnClickListener() {
        const restartButton = document.querySelector('#restartSessionButton');
        if (restartButton) {
            restartButton.addEventListener('click', function () {
                restartSession(true);
            });
        }
    }

    function startNewConversationButtonOnClickListener() {

        // $(document).on(
        //     'click',
        //     '#startNewChat',
        //     function (ev) {

        //         startNewConversation();
        //     }
        // );

        const startNewConversationButton = document.querySelector('#startNewChat');
        if (startNewConversationButton) {
            startNewConversationButton.addEventListener('click', function () {
                startNewConversation();
            });
        }
    }

    function startAppTourButtonOnClickListener() {

        // $(document).on(
        //     'click',
        //     '#startAppTourButton',
        //     function (ev) {
        //         startAppTour();
        //     }
        // );

        const startAppTourButton = document.querySelector('#startAppTourButton');
        if (startAppTourButton) {
            startAppTourButton.addEventListener('click', function () {
                startAppTour();
            });
        }
    }

    function feedbackSubmitButtonOnClickListener() {
        // $(document).on('click', '#feedbackSubmitButton', function (ev) {
        //     let translationFeedback = $(this).data('translation-feedback');
        //     let informationFeedback = $(this).data('information-feedback');
        //     let functionalityFeedback = $('#feedbackSubmitButton').data(
        //         'functionality-feedback'
        //     );

        //     let feedbackDetails = $(
        //         userQuestionTextBoxClass + '[data-screen-name=' + 'feedback' + ']'
        //     ).val();

        //     submitFeedback(
        //         translationFeedback,
        //         informationFeedback,
        //         functionalityFeedback,
        //         feedbackDetails
        //     );
        // });

        document.querySelector('#feedbackSubmitButton').addEventListener('click', function (ev) {
            let translationFeedback = ev.target.getAttribute('data-translation-feedback');
            let informationFeedback = ev.target.getAttribute('data-information-feedback');
            let functionalityFeedback = ev.target.getAttribute('data-functionality-feedback');

            let feedbackDetails = document.querySelector(userQuestionTextBoxClass + '[data-screen-name="feedback"]').value;

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
        // $(document).on('click', '.chatbot-message-action-buttons', function (ev) {
        //     let actionName = $(this).data('action-name');
        //     let audioId = $(this).data('audio-id');
        //     let messageId = $(this).data('message-id');
        //     let actionType = $(this).data('action-type');

        //     if (actionName == 'setAutoPlayAudioMessage') {
        //         setAutoPlayOn(audioId);
        //     } else if (actionName == 'playAudioMessage') {
        //         playAudio(audioId);
        //     } else if (actionType == 'fe') {
        //         if (actionName == 'likeMessage') {
        //             likeMessageFe(messageId);
        //         } else if (actionName == 'dislikeMessage') {
        //             dislikeMessageFe(messageId);
        //         }
        //     } else {
        //         if (actionName == 'likeMessage') {
        //             likeMessage(messageId);
        //         } else if (actionName == 'dislikeMessage') {
        //             dislikeMessage(messageId);
        //         }
        //     }
        // });
        //document.querySelectorAll('.chatbot-message-action-buttons').forEach(function (element) {
        //    element.addEventListener('click', function (ev) {
        //        console.log('ev in chatrbotMessageActionButtonsOnClickListener', ev);
        //        let actionName = ev.target.getAttribute('data-action-name');
        //        let audioId = ev.target.getAttribute('data-audio-id');
        //        let messageId = ev.target.getAttribute('data-message-id');
        //        let actionType = ev.target.getAttribute('data-action-type');

        //        if (actionName === 'setAutoPlayAudioMessage') {
        //            setAutoPlayOn(audioId);
        //        } else if (actionName === 'playAudioMessage') {
        //            playAudio(audioId);
        //        } else if (actionType === 'fe') {
        //            if (actionName === 'likeMessage') {
        //                likeMessageFe(messageId);
        //            } else if (actionName === 'dislikeMessage') {
        //                dislikeMessageFe(messageId);
        //            }
        //        } else {
        //            if (actionName === 'likeMessage') {
        //                likeMessage(messageId);
        //            } else if (actionName === 'dislikeMessage') {
        //                dislikeMessage(messageId);
        //            }
        //        }
        //    });
        //});
        document.addEventListener('click', function (ev) {
            const element = ev.target;

            if (element.classList.contains('chatbot-message-action-buttons')) {
                let actionName = element.getAttribute('data-action-name');
                let audioId = element.getAttribute('data-audio-id');
                let messageId = element.getAttribute('data-message-id');
                let actionType = element.getAttribute('data-action-type');

                if (actionName === 'setAutoPlayAudioMessage') {
                    setAutoPlayOn(audioId);
                } else if (actionName === 'playAudioMessage') {
                    playAudio(audioId);
                } else if (actionType === 'fe') {
                    if (actionName === 'likeMessage') {
                        likeMessageFe(messageId);
                    } else if (actionName === 'dislikeMessage') {
                        dislikeMessageFe(messageId);
                    }
                } else {
                    if (actionName === 'likeMessage') {
                        likeMessage(messageId);
                    } else if (actionName === 'dislikeMessage') {
                        dislikeMessage(messageId);
                    }
                }
            }
        });
    }

    // function chatbotConfirmationModalCloseEventListener() {
    //     $(document).on(
    //         'click',
    //         '#chatbotConfirmationModalSaveButton',
    //         function (ev) {
    //             let modalType = $(this).data('modal-type');

    //             if (modalType == 'restart-session') {
    //                 $(".app_tour_language_selection_description").show();
    //                 restartSession();
    //             }
    //         }
    //     );
    // }

    function chatbotConfirmationModalCloseEventListener() {
        document.querySelector('#chatbotConfirmationModalSaveButton').addEventListener('click', function (ev) {
            let modalType = ev.target.getAttribute('data-modal-type');

            if (modalType === 'restart-session') {
                document.querySelectorAll('.app_tour_language_selection_description').forEach(function (element) {
                    element.style.display = 'block';
                });
                restartSession();
            }
        });
    }

    /**
     * Attaches a keypress event listener to the user question text box.
     * Triggers a click event on the send text button when the Enter key is pressed.
     *
     * @returns {void}
     */
    // function userQuestionTextBoxOnKeyPressListener() {
    //     $(userQuestionTextBox).keypress(function (event) {
    //         if (event.keyCode == 13 || event.key == 'Enter') {
    //             event.stopPropagation();
    //             $(sendTextButtonId).click();
    //         }
    //     });
    // }
    function userQuestionTextBoxOnKeyPressListener() {
        document.querySelector(userQuestionTextBox).addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.key === 'Enter') {
                event.stopPropagation();
                document.querySelector(sendTextButtonId).click();
            }
        });
    }

    function resendOtpOnClickListener() {
        // $(document).on('click', '.resendOTP', function (ev) {
        //     resendOTP(this);
        // });

        //document.querySelectorAll('.resendOTP').forEach(function (element) {
        //    element.addEventListener('click', function (ev) {
        //        resendOTP(element);
        //    });
        //});
        // Attach a single event listener to the document
        document.addEventListener('click', function (ev) {
            const element = (ev.target).closest('.resendOTP');

            if (element) {
                resendOTP(element);
            }
        });
    }

    function autoReadOnClickListener() {
        // $(document).on('click', '.auto-read-button-wrapper', function (ev) {

        //     globalAutoReadFeature.setAutoReadStatus(true);
        // });

        //document.querySelectorAll('.auto-read-button-wrapper').forEach(function (element) {
        //    element.addEventListener('click', function (ev) {

        //        globalAutoReadFeature.setAutoReadStatus(true);
        //    })
        //});

        document.addEventListener('click', function (ev) {
            const element = (ev.target).closest('.auto-read-button-wrapper');

            if (element) {
                globalAutoReadFeature.setAutoReadStatus(true);
            }
        });

        //globalAutoReadFeature.setAutoReadStatus(false);
    }

    function popularQuestionsOnClickListener() {
        // $(document).on('click', '.popularQuestions', function (ev) {
        //     const popularQuestion = $(this).data('popular-question');
        //     const popularQuestionKey = $(this).attr('id');
        //     copyPopularQuestionInTextBox(popularQuestion, true, true);

        //     // Update used popular questions list,
        //     // So when we display new popular questions, we can exclude used ones and show different questions
        //     const currentScheme = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
        //     popularQueriesService.updateUsedQueries(currentScheme, popularQuestionKey);
        // });

        //document.querySelectorAll('.popularQuestions').forEach(function (element) {
        //    element.addEventListener('click', function (ev) {
        //        const popularQuestion = element.getAttribute('data-popular-question');
        //        const popularQuestionKey = element.getAttribute('id');
        //        copyPopularQuestionInTextBox(popularQuestion, true, true);

        //        // Update used popular questions list,
        //        // So when we display new popular questions, we can exclude used ones and show different questions
        //        const currentScheme = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
        //        popularQueriesService.updateUsedQueries(currentScheme, popularQuestionKey);
        //    });
        //});
        document.addEventListener('click', function (ev) {
            const element = (ev.target).closest('.popularQuestions');

            if (element) {
                const popularQuestion = element.getAttribute('data-popular-question');
                const popularQuestionKey = element.getAttribute('id');
                copyPopularQuestionInTextBox(popularQuestion, true, true);

                // Update used popular questions list,
                // So when we display new popular questions, we can exclude used ones and show different questions
                const currentScheme = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
                popularQueriesService.updateUsedQueries(currentScheme, popularQuestionKey);
            }
        });
    }

    function initPopovers() {
        document.querySelectorAll('[data-bs-toggle="popover"]')
            .forEach(popover => {
                new bootstrap.Popover(popover, {
                    customClass: 'popover-custom',
                    trigger: 'hover'
                })
            })
    }

    // function hideAllThePopovers() {
    //     $('[data-bs-toggle="popover"]').popover('dispose');

    //     setTimeout(() => {
    //         initPopovers();
    //     }, 1000)

    // }
    function hideAllThePopovers() {
        document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (element) {
            // Assuming you have a way to dispose of the popover in your internal library
            if (element.popoverInstance) {
                element.popoverInstance.dispose();
            }
        });

        setTimeout(() => {
            initPopovers();
        }, 1000);
    }

    async function initChatBotConfig() {

        // Set parent route
        //currentParentRoute = $('#currentParentRoute').val();
        currentParentRoute = document.querySelector('#currentParentRoute').value;

        const controller = new AbortController();
        const signal = controller.signal;

        await appConfigConstruct.getAppConfig();

        if (appConfig.showSchemes) {
            await window.schemesInfo.getSchemesList();
        }

        voiceRecorderListener();
        languageChangeListener();
        schemeChangeListener();
        generalQuestionClickListener();
        userQuestionTextBoxOnKeyPressListener();
        chatbotMessageActionButtonsOnClickListener();
        feedbackSubmitButtonOnClickListener();
        restartSessionButtonOnClickListener();
        //startNewConversationButtonOnClickListener();
        startAppTourButtonOnClickListener();
        resendOtpOnClickListener();
        autoReadOnClickListener();
        popularQuestionsOnClickListener();
        initAutoSizeInputBox("conversation");
        chatbotConfirmationModalCloseEventListener();
        submitFeedbackModalCloseEventListener();
        await getTranslations();

        initPopovers();
        setLocationInfo();

        // Check if maintenance mode is on or not
        // If on, we need to show maintenance mode modal
        // And disable all the functionalities
        const isMaintenanceModeOn = document.querySelector('#isMaintenanceModeOn').value; //$('#isMaintenanceModeOn').val();
        if (isMaintenanceModeOn == 'True') {
            showMaintenanceModeModal();
        }

        // Highlight selected scheme
        setTimeout(() => {
            //hightlightSelectedLanguage();
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

        if (scrollElement) {
            scrollElement.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }

    }

    /**
     *
     * This method is used to get the current selected language code and also set in localstorage if not already set
     * @returns
     */
    function getSetCurrentLanguageCode() {

        const currentLanguageCodeElement = document.querySelector('[data-current-language-culture-code]');
        //console.log('currentLanguageCodeElement: ', currentLanguageCodeElement.getAttribute('data-current-language-culture-code'));
        //console.log("currentLanguageCode = document.querySelector('.languagesLabels').dataset.currentLanguageCultureCode;", currentLanguageCodeElement.value);
        //let currentLanguageCode = localStorage.getItem("currentLanguageCode");

        //let currentLanguageCode = document.querySelector('.languagesLabels').dataset.currentLanguageCultureCode;
        if (!currentLanguageInfo.currentLanguageCode) {
            currentLanguageInfo.currentLanguageCode = currentLanguageCodeElement.getAttribute('data-current-language-culture-code');
        }

        //currentLanguageInfo.currentLanguageCode = currentLanguageCode;

        //if (currentLanguageCode == null || currentLanguageCode == undefined || !currentLanguageCode) {
        //    //currentLanguageCode = $('.languagesLabels').data('current-language-culture-code');
        //    currentLanguageCode = document.querySelector('.languagesLabels').dataset.currentLanguageCultureCode;
        //    localStorage.setItem("currentLanguageCode", currentLanguageCode);
        //} else {
        //    //$('.languagesLabels').data('current-language-culture-code', currentLanguageCode);
        //    document.querySelector('.languagesLabels').dataset.currentLanguageCultureCode = currentLanguageCode;
        //}

        return currentLanguageInfo.currentLanguageCode;
    }

    async function getTranslations() {

        let currentLanguageCode = getSetCurrentLanguageCode();

        await getTranslationFiles(currentLanguageCode).then(translations => {

            // Find the current selected langauge translations
            // And show top 5 popular questions from it
            const currentSelectedSchemeId = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
            currentLanguageInfo = translations.find(f => f.languageCode == currentLanguageCode);
            rawCurrentLanguageInfo = JSON.parse(JSON.stringify(currentLanguageInfo)); // Deep copy currentLanguageInfo;
            currentLanguageInfo = GetDynamicTranslations();

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

            if (currentSelectedSChemeTranslations || currentSelectedSchemeId == 'general') {
                //bindPopularQuestions();

            } else {
                console.log('Translations missing');
            }
        });
    }

    function GetDynamicTranslations() {

        // Get the dynamic translation info from app config
        const dynamicTranslations = appConfig.dynamicTranslations;

        if (dynamicTranslations) {

            for (var i = 0; i < dynamicTranslations.length; i++) {

                const currentDynamicTranslation = dynamicTranslations[i];

                // Get the messagesToUpdate from current dynamic translation
                const messagesToUpdate = currentDynamicTranslation.messagesToUpdate;

                for (var j = 0; j < messagesToUpdate.length; j++) {
                    const currentMessageToUpdate = messagesToUpdate[j];

                    // Get the translation for the current message
                    const translation = rawCurrentLanguageInfo.translations.messages[currentMessageToUpdate];

                    // Update the translation
                    // Check the dynamic key and find the appropriate value for it
                    if (currentDynamicTranslation.keyToFind === '{{SelectedScheme}}') {

                        // Get the current selected scheme name
                        const currentSelectedSchemeId = schemesInfo.currentScheme ? schemesInfo.currentScheme : appConfig.defaultScheme;
                        const currentSelectedSChemeTranslations = rawCurrentLanguageInfo.translations.lables[currentSelectedSchemeId];
                        currentLanguageInfo.translations.messages[currentMessageToUpdate] = translation.replace(currentDynamicTranslation.keyToFind, currentSelectedSChemeTranslations);
                    }

                }
            }
        }

        return currentLanguageInfo;
    }

    function bindPopularQuestions() {
        const numberOfVisiblePopularQueries = appConfig && appConfig.numberOfVisiblePopularQueries ? appConfig.numberOfVisiblePopularQueries : 4;
        // Get already used queries of the current scheme
        // We don't need to display already used queries

        const currentSelectedSchemeId = schemesInfo.currentScheme;

        let popularQuestionsHtmlContent = []
        // if current selected scheme id is general then combine the popular queries of all the schemes
        if (currentSelectedSchemeId == 'general') {
            const usedQueries = popularQueriesService.getUsedQueries();

            let allSchemesQueries = currentLanguageInfo.translations.schemes.reduce((acc, item) => {
                return { ...acc, ...item.queries };
            }, {});

            const topRandomPopularQuestions = getRandomValues(allSchemesQueries, numberOfVisiblePopularQueries, usedQueries.length ? usedQueries : undefined);
            popularQuestionsHtmlContent = getPopularQuestionsHtmlContent(topRandomPopularQuestions);

        } else {
            const currentSelectedSChemeTranslations = currentLanguageInfo.translations.schemes.find(f => f.schemeId == currentSelectedSchemeId);

            const alreadyUsedQueries = popularQueriesService.getUsedQueries(currentSelectedSchemeId);

            const topRandomPopularQuestions = getRandomValues(currentSelectedSChemeTranslations.queries, numberOfVisiblePopularQueries, alreadyUsedQueries.length ? alreadyUsedQueries : undefined);

            popularQuestionsHtmlContent = getPopularQuestionsHtmlContent(topRandomPopularQuestions);

            showHideContent.showPopularQuestions();
        }


        //$('.query-messages-box').empty();
        document.querySelectorAll('.query-messages-box').forEach(function (element) {
            element.innerHTML = '';
        });

        for (var i = 0; i < popularQuestionsHtmlContent.length; i++) {
            //$('.query-messages-box').append(popularQuestionsHtmlContent[i]);
            document.querySelector('.query-messages-box').innerHTML += popularQuestionsHtmlContent[i];

        }


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

        ['show', 'cancel'].forEach((event) =>
            tour.on(event, (tourEvent) => {

                if (event == 'show' && tourEvent.step?.id === 'app_tour_language_selection_description') {
                    var popoverTrigger = document.getElementById('settingsButton');
                    // Trigger click event on popoverTrigger
                    popoverTrigger.click();
                } else if (event == 'cancel') {
                    localStorage.setItem('isAppTourDisplayed', 'true');
                }
            })
        );
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
                id: 'app_tour_auto_read_description',
                translationType: 'messages',
                text: 'voice_selection',
                showNextButton: true,
                showPreviousButton: true
            },
            {
                id: 'app_tour_language_selection_description',
                translationType: 'messages',
                text: 'app_tour_settings_icon_description',
                showNextButton: true,
                showPreviousButton: true,
            },
            {
                id: 'app_tour_guide_descirption',
                translationType: 'messages',
                text: 'app_tour_guide_descirption',
                showNextButton: true,
                showPreviousButton: true,
            },
            //{
            //    id: 'app_tour_scheme_selection_description',
            //    translationType: 'messages',
            //    text: 'app_tour_scheme_selection_description',
            //    showNextButton: true,
            //    showPreviousButton: true,
            //},
            //{
            //    id: 'app_tour_sample_questions_description',
            //    translationType: 'messages',
            //    text: 'app_tour_sample_questions_description',
            //    showNextButton: true,
            //    showPreviousButton: true,
            //},
            //{
            //    id: 'app_tour_toggle_feature_description',
            //    translationType: 'messages',
            //    text: 'app_tour_toggle_feature_description',
            //    showNextButton: true,
            //    showPreviousButton: true,
            //},
            {
                id: 'app_tour_audio_button_description',
                translationType: 'messages',
                text: 'app_tour_audio_button_description',
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
            },
            {
                id: '',
                translationType: 'messages',
                text: 'app_tour_exit_description',
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
        const currentAppTourStepUiElement = window.getComputedStyle(document.querySelector(appTourUiElementClassName)).display;//$(appTourUiElementClassName).css('display');

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

            // $(this).data('translation-feedback', -1);
            // $(this).data('information-feedback', -1);

            event.target.setAttribute('data-translation-feedback', -1);
            event.target.setAttribute('data-information-feedback', -1);

            // $('#feedbackSubmitButton').data('functionality-feedback', -1);

            event.target.setAttribute('data-functionality-feedback', -1);

            // $(userQuestionTextBoxClass + '[data-screen-name=' + 'feedback' + ']').val(
            //     ''
            // );
            document.querySelector(userQuestionTextBoxClass + '[data-screen-name="feedback"]').value = '';


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

        const userQuestionTextBox = document.querySelector(userQuestionTextBoxClass + '[data-screen-name="feedback"]');
        autosize.update(userQuestionTextBox);
    }

    function initAutoSizeInputBox(screenName) {
        // autosize($(userQuestionTextBoxClass));
        //autosize(document.querySelector(userQuestionTextBoxClass));
        autosize(document.querySelector(userQuestionTextBoxClass + '[data-screen-name="' + screenName + '"]'))
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
    //function updateChatMessagesList(
    //    message,
    //    messageId,
    //    messageType,
    //    isMessageFromBot,
    //    showAudioOption,
    //    shouldNotAutoPlayAudio
    //) {
    //    console.log('message: ', message);
    //    if (message != '' && message != undefined) {

    //        if (isMessageFromBot == true) {
    //            message = formatChatbotResponse(message);
    //            message = marked.parse(message);
    //            message = message.replace("<a", "<a target='_blank' rel='noreferrer' ");
    //        }

    //        let chatMessageWrapperStartingDivHtmlContent =
    //            getChatMessageWrapperStartingDivHtmlContent(
    //                isMessageFromBot,
    //                messageId,
    //                'conversationsWrapper'
    //            ); // Main chat message wrapper

    //        let chatMessageAudioImageHtmlContent =
    //            showAudioOption == true
    //                ? getChatMessageAudioImageHtmlContent(messageId)
    //                : null; // Audio icon inside third column

    //        let feedbackOptionHtmlContent = getFeedbackButtonsHtmlContent(messageId);
    //        let spanStartingHtmlContentWithId = getStartingSpanHtmlContent(messageId);

    //        chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent = getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(messageId);

    //        var response =
    //            chatMessageWrapperStartingDivHtmlContent +

    //            chatMessageWrapperColumnTwoStartingDivHtmlContent +
    //            startingDivHtmlContent +
    //            chatbotLogoHtmlContent +
    //            spanStartingHtmlContentWithId +
    //            message +
    //            spanClosingHtmlContent +
    //            closingDivHtmlContent +
    //            closingDivHtmlContent +
    //            (showAudioOption == true
    //                ? chatMessageWrapperColumnThreeStartingDivHtmlContent +
    //                chatMessageAudioImageHtmlContent +
    //                closingDivHtmlContent
    //                : '') +
    //            (messageType == 'final_response' && isMessageFromBot == true
    //                ? chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent +
    //                feedbackOptionHtmlContent +
    //                closingDivHtmlContent
    //                : '') +
    //            closingDivHtmlContent;

    //        //$('#message-list').append(response);
    //        const messageList = document.getElementById('message-list');
    //        messageList.appendChild(response);

    //        if (messageType == 'final_response') {
    //            sessionStorage.setItem('final_response', true);

    //            //bindPopularQuestions();
    //        }

    //        scrollToBottom();
    //        if (isMessageFromBot == true && !shouldNotAutoPlayAudio) {
    //            autoPlayAudio(messageId);
    //        }
    //    }
    //}

    function updateChatMessagesList(
        message,
        messageId,
        messageType,
        isMessageFromBot,
        showAudioOption,
        shouldNotAutoPlayAudio
    ) {

        if (message != '' && message != undefined) {
            if (isMessageFromBot == true) {
                message = formatChatbotResponse(message);
                message = marked.parse(message);
                message = message.replace("<a", "<a target='_blank' rel='noreferrer' ");
            }

            let chatMessageWrapperElement = getChatMessageWrapperStartingDivHtmlContent(
                isMessageFromBot,
                messageId,
                'conversationsWrapper'
            ); // Main chat message wrapper

            let chatMessageAudioImageElement = showAudioOption == true
                ? getChatMessageAudioImageHtmlContent(messageId)
                : null; // Audio icon inside third column

            let feedbackOptionElement = getFeedbackButtonsHtmlContent(messageId);
            let spanStartingElementWithId = getStartingSpanHtmlContent(messageId);
            let chatMessageColumnThreePartTwoElement = getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent(messageId);

            // Assuming the variables contain HTML elements instead of strings
            const chatMessageColumnTwoElement = getChatMessageWrapperColumnTwoStartingDivHtmlContent(); //chatMessageWrapperColumnTwoStartingDivHtmlContent;
            const userDivElement = getStartingDivHtmlContent();//startingDivHtmlContent;
            const chatbotLogoElement = getChatbotLogoHtmlContent();//chatbotLogoHtmlContent;

            // Append the message to the span element
            const messageParagraph = document.createElement('p');
            messageParagraph.innerHTML = message;
            spanStartingElementWithId.appendChild(messageParagraph);

            // Append the elements to their respective parents
            userDivElement.appendChild(chatbotLogoElement);
            userDivElement.appendChild(spanStartingElementWithId);
            chatMessageColumnTwoElement.appendChild(userDivElement);
            chatMessageWrapperElement.appendChild(chatMessageColumnTwoElement);

            if (showAudioOption == true) {
                const chatMessageColumnThreeElement = getChatMessageWrapperColumnThreeStartingDivHtmlContent();//chatMessageWrapperColumnThreeStartingDivHtmlContent;
                chatMessageColumnThreeElement.appendChild(chatMessageAudioImageElement);
                chatMessageWrapperElement.appendChild(chatMessageColumnThreeElement);
            }

            if (messageType == 'final_response' && isMessageFromBot == true) {
                const chatMessageColumnThreePartTwoElement = getChatMessageWrapperColumnThreePartTwoStartingDivHtmlContent();//chatMessageWrapperColumnThreePartTwoStartingDivHtmlContent;
                chatMessageColumnThreePartTwoElement.appendChild(feedbackOptionElement);
                chatMessageWrapperElement.appendChild(chatMessageColumnThreePartTwoElement);
            }

            //chatMessageWrapperElement.appendChild(closingDivElement);

            // Append the response to the message list
            const messageList = document.getElementById('message-list');
            messageList.appendChild(chatMessageWrapperElement);

            if (messageType == 'final_response') {
                sessionStorage.setItem('final_response', true);
                // bindPopularQuestions();
            }

            scrollToBottom();

            if (isMessageFromBot == true && !shouldNotAutoPlayAudio) {
                autoPlayAudio(messageId);
            }
        }
    }
    function recordAudio(screenName, isRecording) {
        //isRecording = !isRecording;

        if (isRecording) {
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).attr('src', stopVoiceRecordingImagePath);
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).addClass(voiceRecordingStopBgColorClass);
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).removeClass(voiceRecordingStartBgColorClass);
            //$(
            //    voiceRecordMicCircleClass + '[data-screen-name=' + screenName + ']'
            //).show();

            //$(sendTextButtonId).attr('disabled', 'disabled');
            document.querySelector(sendTextButtonId).setAttribute('disabled', 'disabled');
            startRecording(screenName);
        } else {
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).attr('src', startVoiceRecordingImagePath);
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).addClass(voiceRecordingStartBgColorClass);
            //$(
            //    voiceRecordingImageClass + '[data-screen-name=' + screenName + ']'
            //).removeClass(voiceRecordingStopBgColorClass);

            //$(
            //    voiceRecordMicCircleClass + '[data-screen-name=' + screenName + ']'
            //).hide();
            //$(sendTextButtonId).removeAttr('disabled');
            document.querySelector(sendTextButtonId).removeAttribute('disabled', 'disabled');

            stopRecording(screenName);
        }
    }

    document.addEventListener('DOMContentLoaded', async function () {
        await initChatBotConfig();

        //$(voiceRecordMicCircleClass).hide();
        document.querySelector(voiceRecordMicCircleClass).style.display = 'none';

        createGlobalAudioElement();

        getWelcomeGreetingsAudio(false);

        getLanguageLabelsAudioes();

        enableDisableSendButton();

        // $(userQuestionTextBoxClass).on('change paste keyup', function (event) {
        //     let screenName = $(this).data('screen-name');

        //     if (screenName == 'conversation') {
        //         if (
        //             event.type == 'keyup' &&
        //             isSampleQueryUsed == false &&
        //             event?.originalEvent?.key != 'Enter'
        //         ) {
        //             isUserTypedQuestion = true;
        //         } else {
        //             isUserTypedQuestion = false;
        //         }
        //     }

        //     //autosize.update($(userQuestionTextBoxClass));
        //     autosize.update(document.querySelector(userQuestionTextBoxClass));

        //     if (screenName == 'conversation') {
        //         var textValue = $(this).val();

        //         // If value is there then only keep the send button enabled else keep it disabled.
        //         enableDisableSendButton(textValue);
        //     }
        // });
        //const userQuestionTextBox = document.querySelector(userQuestionTextBoxClass);
        const userQuestionTextBox = document.querySelector(userQuestionTextBoxClass + '[data-screen-name="conversation"]');

        ['change', 'paste', 'keyup'].forEach(eventType => {
            userQuestionTextBox.addEventListener(eventType, handleUserQuestionTextBoxEvent);
        });

        function handleUserQuestionTextBoxEvent(event) {
            let screenName = event.target.getAttribute('data-screen-name');

            if (screenName === 'conversation') {
                if (
                    event.type === 'keyup' &&
                    isSampleQueryUsed === false &&
                    event?.originalEvent?.key !== 'Enter'
                ) {
                    isUserTypedQuestion = true;
                } else {
                    isUserTypedQuestion = false;
                }

                autosize.update(userQuestionTextBox);
            } else {
                const userQuestionTextBox = document.querySelector(userQuestionTextBoxClass + '[data-screen-name="feedback"]');
                autosize.update(userQuestionTextBox);
            }

            if (screenName === 'conversation') {
                var textValue = event.target.value;

                // If value is there then only keep the send button enabled else keep it disabled.
                enableDisableSendButton(textValue);
            }
        }

        getLocalStream();

        //(async function () {
        //    document.addEventListener('DOMContentLoaded', function() {

        //    });
        //})();
        document.querySelector(sendTextButtonId).addEventListener('click', function (e) {
            e.preventDefault();

            if (hasConversationLimitReached) {
                showStartNewConversationModal(() => {
                    restartSession();
                });
            } else {

                //console.log('document.getElementById for UserQuestionTextBox: ', document.getElementById(userQuestionTextBox));
                let questionInput = userQuestionTextBox.value; //$(userQuestionTextBox).val();

                const sanitizedInput = sanitizeInput(questionInput);
                if (sanitizedInput) {
                    let chatMessageWrapperStartingDivHtmlContent =
                        getChatMessageWrapperStartingDivHtmlContent(
                            false,
                            null,
                            'conversationsWrapper'
                        ); // Main chat message wrapper

                    let chatMessageAudioImageHtmlContent =
                        getChatMessageAudioImageHtmlContent(lastUserAudioMessageId); // Audio icon inside third column

                    var userQuery = '';

                    ////

                    ////
                    //userQuery =
                    //    chatMessageWrapperStartingDivHtmlContent +

                    //    chatMessageWrapperColumnTwoStartingDivHtmlContent +
                    //    startingDivHtmlContent +
                    //    userLogoHtmlContent +
                    //    spanStartingHtmlContent +
                    //    "<p>" + sanitizedInput + "</p>" +
                    //    spanClosingHtmlContent +
                    //    closingDivHtmlContent +
                    //    closingDivHtmlContent +

                    //    (lastUserAudioMessageId != null && lastUserAudioMessageId != ''
                    //        ? chatMessageWrapperColumnThreeStartingDivHtmlContent +
                    //        chatMessageAudioImageHtmlContent +
                    //        closingDivHtmlContent
                    //        : '') +
                    //    closingDivHtmlContent +
                    //    closingDivHtmlContent;

                    // Assuming the variables contain HTML elements instead of strings
                    const chatMessageWrapperElement = chatMessageWrapperStartingDivHtmlContent;
                    const chatMessageColumnTwoElement = getChatMessageWrapperColumnTwoStartingDivHtmlContent(); //chatMessageWrapperColumnTwoStartingDivHtmlContent;
                    const userDivElement = getStartingDivHtmlContent(); //startingDivHtmlContent;
                    const userLogoElement = getUserLogoHtmlContent();//userLogoHtmlContent;
                    const messageSpanElement = getStartingSpanHtmlContent();
                    const chatMessageColumnThreeElement = getChatMessageWrapperColumnThreeStartingDivHtmlContent();//chatMessageWrapperColumnThreeStartingDivHtmlContent;
                    const audioImageElement = chatMessageAudioImageHtmlContent;

                    // Create the paragraph element for the sanitized input
                    const paragraph = document.createElement('p');
                    paragraph.textContent = sanitizedInput;

                    // Append the paragraph to the span element
                    messageSpanElement.appendChild(paragraph);

                    // Append the elements to their respective parents
                    userDivElement.appendChild(userLogoElement);
                    userDivElement.appendChild(messageSpanElement);
                    chatMessageColumnTwoElement.appendChild(userDivElement);
                    chatMessageWrapperElement.appendChild(chatMessageColumnTwoElement);

                    // Check if there is an audio message
                    if (lastUserAudioMessageId != null && lastUserAudioMessageId != '') {
                        chatMessageColumnThreeElement.appendChild(audioImageElement);
                        chatMessageWrapperElement.appendChild(chatMessageColumnThreeElement);
                    }

                    //$('#message-list').append(userQuery.replace(/\n/g, '<br>'));
                    const messageList = document.getElementById('message-list');
                    //messageList.appendChild(userQuery.replace(/\n/g, '<br>'));//
                    //const userQueryNode = document.createElement('div');
                    //userQueryNode.innerHTML = userQuery.replace(/\n/g, '<br>');
                    //messageList.appendChild(userQueryNode);
                    messageList.appendChild(chatMessageWrapperElement);
                    lastUserAudioMessageId = ''; // Clear last user typed messaged Id once it is sent

                    isWelcomeMessageAutoPlayed = true;
                    askQuestions(sanitizedInput, 'text');
                }
            }
        });
    });

    function copyPopularQuestionInTextBox(message, shouldHidePopularQuestions = true, shouldAutoSend) {
        // Hide popular questions now
        if (shouldHidePopularQuestions == true) {
            showHideContent.hidePopularQuestions();
        }

        showUserRecordedMessageInTextBox(message, shouldAutoSend);
    }

    function hidePopularQuestions() {
        // $('#popularQuestionsWrapper').removeClass('d-flex');
        // $('#popularQuestionsWrapper').hide();
        // $('#message-list').addClass('without-popular-questions');

        document.querySelector('#popularQuestionsWrapper').classList.remove('d-flex');
        document.querySelector('#popularQuestionsWrapper').style.display = 'none';
        document.querySelector('#message-list').classList.add('without-popular-questions');
    }

    function showPopularQuestions() {
        // $('#popularQuestionsWrapper').addClass('d-flex');
        // $('#popularQuestionsWrapper').show();
        // $('#message-list').removeClass('without-popular-questions');

        document.querySelector('#popularQuestionsWrapper').classList.add('d-flex');
        document.querySelector('#popularQuestionsWrapper').style.display = 'block';
        document.querySelector('#message-list').classList.remove('without-popular-questions');
    }

    function showUserRecordedMessageInTextBox(message, shouldAutoSend) {
        // $(userQuestionTextBox).val(message);

        // $(userQuestionTextBox).trigger('change');

        // if (shouldAutoSend === true) {
        //     $(sendTextButtonId).trigger('click');
        // } else {
        //     $(userQuestionTextBox).focus();
        // }

        // Set the value of the user question text box
        document.querySelector(userQuestionTextBox).value = message;

        // Trigger the 'change' event
        const changeEvent = new Event('change');
        document.querySelector(userQuestionTextBox).dispatchEvent(changeEvent);

        if (shouldAutoSend === true) {
            // Trigger the 'click' event on the send button
            const clickEvent = new Event('click');
            document.querySelector(sendTextButtonId).dispatchEvent(clickEvent);
        } else {
            // Focus on the user question text box
            document.querySelector(userQuestionTextBox).focus();
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
    //function processChatBotResponse(
    //    message,
    //    messageId,
    //    messageType,
    //    textInEnglish,
    //    showAudioOption
    //) {
    //    if (message != '') {
    //        updateChatMessagesList(
    //            message,
    //            messageId,
    //            messageType,
    //            true,
    //            showAudioOption
    //        );
    //    }

    //    if (
    //        String(textInEnglish)
    //            .toLowerCase()
    //            .indexOf('one time password is wrong') >= 0
    //    ) {
    //        var resendOtpTranslation = currentLanguageInfo.translations.messages.resend_otp;

    //        let chatMessageWrapperStartingDivHtmlContent =
    //            getChatMessageWrapperStartingDivHtmlContent(
    //                true,
    //                'resendOtp',
    //                'conversationsWrapper'
    //            ); // Main chat message wrapper

    //        var userQuery = '';

    //        userQuery =
    //            chatMessageWrapperStartingDivHtmlContent +

    //            chatMessageWrapperColumnTwoStartingDivHtmlContent +
    //            startingDivHtmlContent +

    //            userLogoHtmlContent +
    //            spanStartingHtmlContent +
    //            "<button class='btn btn-success language-buttons resendOTP mt-0'>" +
    //            resendOtpTranslation +
    //            '</button>' +
    //            spanClosingHtmlContent +
    //            closingDivHtmlContent +
    //            closingDivHtmlContent +
    //            closingDivHtmlContent;

    //        //$('#message-list').append(userQuery);
    //        console.log('Added message', userQuery);
    //        const messageList = document.getElementById('message-list');
    //        messageList.appendChild(userQuery);
    //    }
    //    // $(userQuestionTextBox).val('');

    //    // $(userQuestionTextBox).trigger('change');
    //    document.querySelector(userQuestionTextBox).value = '';
    //    document.querySelector(userQuestionTextBox).dispatchEvent(new Event('change'));

    //    hideChatLoader();
    //}

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

        if (String(textInEnglish).toLowerCase().indexOf('one time password is wrong') >= 0) {
            var resendOtpTranslation = currentLanguageInfo.translations.messages.resend_otp;

            let chatMessageWrapperElement = getChatMessageWrapperStartingDivHtmlContent(
                true,
                'resendOtp',
                'conversationsWrapper'
            ); // Main chat message wrapper

            // Assuming the variables contain HTML elements instead of strings
            const chatMessageColumnTwoElement = getChatMessageWrapperColumnTwoStartingDivHtmlContent(); //chatMessageWrapperColumnTwoStartingDivHtmlContent;
            const userDivElement = getStartingDivHtmlContent();//startingDivHtmlContent;
            const userLogoElement = getUserLogoHtmlContent(); //userLogoHtmlContent;
            const messageSpanElement = getStartingSpanHtmlContent();//spanStartingHtmlContent;

            // Create the button element for resend OTP
            const resendOtpButton = document.createElement('button');
            resendOtpButton.className = 'btn btn-success language-buttons resendOTP mt-0';
            resendOtpButton.textContent = resendOtpTranslation;

            // Append the button to the span element
            messageSpanElement.appendChild(resendOtpButton);

            // Append the elements to their respective parents
            userDivElement.appendChild(userLogoElement);
            userDivElement.appendChild(messageSpanElement);
            chatMessageColumnTwoElement.appendChild(userDivElement);
            chatMessageWrapperElement.appendChild(chatMessageColumnTwoElement);

            // Append the user query to the message list
            const messageList = document.getElementById('message-list');
            messageList.appendChild(chatMessageWrapperElement);
        }

        // Clear and trigger change event on the user question text box
        document.querySelector(userQuestionTextBox).value = '';
        document.querySelector(userQuestionTextBox).dispatchEvent(new Event('change'));

        hideChatLoader();
    }
    function resendOTP(element) {
        // $('#chatbotMessageWrapper-resendOtp').remove();
        document.querySelector('#chatbotMessageWrapper-resendOtp').remove();
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

    function handleError(error, category) {
        hideChatLoader(category);



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
            translation: parseInt(translation),
            information: parseInt(information),
            chatbotFunctionality: parseInt(chatbotFunctionality), // chatbotFunctionality,
            feedback: feedbackDetails,
        };
        return;

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

            // $(userQuestionTextBox).val('');
            // $(userQuestionTextBox).trigger('change');

            document.querySelector(userQuestionTextBox).value = '';
            document.querySelector(userQuestionTextBox).dispatchEvent(new Event('change'));
        }

        chatLoader(category);

        scrollToBottom();

        function prompt() {
            const apiUrl =
                apiUrlConfig.chatbotApiBaseUrl +
                apiUrlConfig.Prompt +
                apiUrlConfig.ApiVersion;
            const headers = new Headers();
            headers.append('User-id', currentUserId);
            headers.append('session-id', sessionId);

            //languagesLabels
            let currentLanguageCultureCode = getSetCurrentLanguageCode();

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
                schemeName: schemeName,
                audioGender: globalAutoReadFeature.selectedVoice ? globalAutoReadFeature.selectedVoice : null
            };

            hasConversationLimitReached = false;

            makeRequestRetry('POST', apiUrl, headers, requestPayload)
                .then((apiResponse) => {
                    hideChatLoader(category);

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
                            lastUserAudioMessageId = data.messageId;

                            if (data.text) {
                                message = data.text;

                                // $(
                                //     userQuestionTextBoxClass +
                                //     '[data-screen-name=' +
                                //     screenName +
                                //     ']'
                                // ).val(message);

                                // $(
                                //     userQuestionTextBoxClass +
                                //     '[data-screen-name=' +
                                //     screenName +
                                //     ']'
                                // ).focus();

                                // $(
                                //     userQuestionTextBoxClass +
                                //     '[data-screen-name=' +
                                //     screenName +
                                //     ']'
                                // ).trigger('change');

                                const userQuestionTextBox = document.querySelector(userQuestionTextBoxClass + '[data-screen-name="' + screenName + '"]');

                                userQuestionTextBox.value = message;
                                userQuestionTextBox.focus();
                                userQuestionTextBox.dispatchEvent(new Event('change'));
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

                        // We need to maintain counter for wadhwani response
                        // When it reaches 5, we will consider it as a conversation limit and user needs to start new conversation by refreshing the session
                        if (data.responseProvider != lastReponseProvider) {
                            wadhwaniResponseCounter = 0;
                        }

                        if (data.responseProvider == "Wadhwani") {
                            wadhwaniResponseCounter++;

                            if (wadhwaniResponseCounter >= 5) {
                                hasConversationLimitReached = true;
                            }
                        }

                        lastReponseProvider = data.responseProvider;
                    }

                    scrollToBottom();

                    if (category == 'text') {
                        setSessionAutoRestartTimeout();
                    }
                })
                .catch((apiError) => {
                    handleError(apiError, category);
                });
        }

        prompt();
    }

    /**
     * This method is used to set like or unlike reaction on thumb icon for feedback purpose
     * @param {any} messageId
     */
    // function likeMessageFe(messageId, shouldReset) {
    //     if (shouldReset) {
    //         $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);
    //     } else {
    //         // Check the current state of like button whether it is liked or unliked.
    //         // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
    //         var likeButtonSource = $('#thumbLikeButton-' + messageId)[0].src;

    //         var likeImageToReplace = thumbLikeHighlightImagePath; // Highlight thumbLike button
    //         let likeMessageValue = 1;
    //         var isLikeHighlight = false;

    //         if (likeButtonSource.indexOf('fill') >= 0) {
    //             isLikeHighlight = true;

    //             likeImageToReplace = thumbLikeImagePath; // Unlike thumbLike button
    //             likeMessageValue = -1;
    //         }

    //         // Set the user selected reaction in data attribute, so later we can use it to send this info to api
    //         $('#feedbackSubmitButton').data(messageId, likeMessageValue);

    //         // Highlight the like button
    //         $('#thumbLikeButton-' + messageId).attr('src', likeImageToReplace);

    //         // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
    //         if (isLikeHighlight) {
    //             $('#thumbLikeButton-' + messageId).removeClass('feedback-animation');
    //         } else {
    //             $('#thumbLikeButton-' + messageId).addClass('feedback-animation');
    //         }

    //         $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from dislike button, to display animation when user hits the same button again

    //         $('#thumbDislikeButton-' + messageId).attr('src', thumbDislikeImagePath); // Change image to color less icon for dislike button as user has clicked on like button now
    //     }
    // }
    function likeMessageFe(messageId, shouldReset) {
        const thumbLikeButton = document.querySelector('#thumbLikeButton-' + messageId);
        const feedbackSubmitButton = document.querySelector('#feedbackSubmitButton');
        const thumbDislikeButton = document.querySelector('#thumbDislikeButton-' + messageId);

        if (shouldReset) {
            thumbLikeButton.setAttribute('src', thumbLikeImagePath);
        } else {
            // Check the current state of like button whether it is liked or unliked.
            // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
            var likeButtonSource = thumbLikeButton.src;

            var likeImageToReplace = thumbLikeHighlightImagePath; // Highlight thumbLike button
            let likeMessageValue = 1;
            var isLikeHighlight = false;

            if (likeButtonSource.indexOf('fill') >= 0) {
                isLikeHighlight = true;

                likeImageToReplace = thumbLikeImagePath; // Unlike thumbLike button
                likeMessageValue = -1;
            }

            // Set the user selected reaction in data attribute, so later we can use it to send this info to api
            feedbackSubmitButton.setAttribute("data-" + messageId, likeMessageValue);

            // Highlight the like button
            thumbLikeButton.setAttribute('src', likeImageToReplace);

            // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
            if (isLikeHighlight) {
                thumbLikeButton.classList.remove('feedback-animation');
            } else {
                thumbLikeButton.classList.add('feedback-animation');
            }

            thumbDislikeButton.classList.remove('feedback-animation'); // Remove animation class from dislike button, to display animation when user hits the same button again

            thumbDislikeButton.setAttribute('src', thumbDislikeImagePath); // Change image to color less icon for dislike button as user has clicked on like button now
        }
    }

    /**
     * This method is used to set dislike or unlike reaction on thumb icon for feedback purpose
     * @param {any} messageId
     */
    // function dislikeMessageFe(messageId, shouldReset) {
    //     if (shouldReset) {
    //         $('#thumbDislikeButton-' + messageId).attr('src', thumbDislikeImagePath);
    //     } else {
    //         // Check the current state of like button whether it is liked or unliked.
    //         // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
    //         var dislikeButtonSource = $('#thumbDislikeButton-' + messageId)[0].src;

    //         var dislikeImageToReplace = thumbDislikeHighlightImagePath;
    //         var isDislikeHighlight = false;
    //         let dislikeMessageValue = 0;
    //         if (dislikeButtonSource.indexOf('fill') >= 0) {
    //             isDislikeHighlight = true;

    //             dislikeImageToReplace = thumbDislikeImagePath;
    //             dislikeMessageValue = -1;
    //         }

    //         $('#feedbackSubmitButton').data(messageId, dislikeMessageValue);

    //         // Set the user selected reaction in data attribute, so later we can use it to send this info to api

    //         // Highlight the like button
    //         $('#thumbDislikeButton-' + messageId).attr('src', dislikeImageToReplace);

    //         // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
    //         if (isDislikeHighlight) {
    //             $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation');
    //         } else {
    //             $('#thumbDislikeButton-' + messageId).addClass('feedback-animation');
    //         }

    //         $('#thumbLikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from like button, to display animation when user hits the same button again

    //         $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);
    //     }
    // }

    function dislikeMessageFe(messageId, shouldReset) {
        const thumbDislikeButton = document.querySelector('#thumbDislikeButton-' + messageId);
        const feedbackSubmitButton = document.querySelector('#feedbackSubmitButton');
        const thumbLikeButton = document.querySelector('#thumbLikeButton-' + messageId);

        if (shouldReset) {
            thumbDislikeButton.setAttribute('src', thumbDislikeImagePath);
        } else {
            // Check the current state of dislike button whether it is disliked or not.
            // If it is already disliked, and user has clicked on it again then we need to remove the dislike, else we need to dislike it
            var dislikeButtonSource = thumbDislikeButton.src;

            var dislikeImageToReplace = thumbDislikeHighlightImagePath;
            var isDislikeHighlight = false;
            let dislikeMessageValue = 0;

            if (dislikeButtonSource.indexOf('fill') >= 0) {
                isDislikeHighlight = true;

                dislikeImageToReplace = thumbDislikeImagePath;
                dislikeMessageValue = -1;
            }

            // Set the user selected reaction in data attribute, so later we can use it to send this info to api
            feedbackSubmitButton.setAttribute("data-" + messageId, dislikeMessageValue);

            // Highlight the dislike button
            thumbDislikeButton.setAttribute('src', dislikeImageToReplace);

            // If earlier it was already highlighted it means, user has un disliked the previous dislike. We need to remove the the animation class. so if user clicks on the same dislike again, then it can show the animation, else animation won't be shown
            if (isDislikeHighlight) {
                thumbDislikeButton.classList.remove('feedback-animation');
            } else {
                thumbDislikeButton.classList.add('feedback-animation');
            }

            thumbLikeButton.classList.remove('feedback-animation'); // Remove animation class from like button, to display animation when user hits the same button again

            thumbLikeButton.setAttribute('src', thumbLikeImagePath); // Change image to color less icon for like button as user has clicked on dislike button now
        }
    }

    function likeMessage(messageId) {
        chatLoader();

        // Check the current state of like button whether it is liked or unliked.
        // If it is already liked, and user has clicked on it again then we need to remove the like, else we need to like it
        // var likeButtonSource = $('#thumbLikeButton-' + messageId)[0].src;
        var likeButtonSource = document.querySelector('#thumbLikeButton-' + messageId).src;

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

                // // Highlight the like button
                // $('#thumbLikeButton-' + messageId).attr('src', likeImageToReplace);

                // // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                // if (isLikeHighlight) {
                //     $('#thumbLikeButton-' + messageId).removeClass('feedback-animation');
                // } else {
                //     $('#thumbLikeButton-' + messageId).addClass('feedback-animation');
                // }

                // $('#thumbDislikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from dislike button, to display animation when user hits the same button again

                // $('#thumbDislikeButton-' + messageId).attr(
                //     'src',
                //     thumbDislikeImagePath
                // ); // Change image to color less icon for dislike button as user has clicked on like button now
                const thumbLikeButton = document.querySelector('#thumbLikeButton-' + messageId);
                const thumbDislikeButton = document.querySelector('#thumbDislikeButton-' + messageId);

                // Highlight the like button
                thumbLikeButton.setAttribute('src', likeImageToReplace);

                // If earlier it was already highlighted it means, user has unliked the previous like.
                // We need to remove the animation class so if the user clicks on the same like again, then it can show the animation, else animation won't be shown
                if (isLikeHighlight) {
                    thumbLikeButton.classList.remove('feedback-animation');
                } else {
                    thumbLikeButton.classList.add('feedback-animation');
                }

                // Remove animation class from dislike button, to display animation when user hits the same button again
                thumbDislikeButton.classList.remove('feedback-animation');

                // Change image to colorless icon for dislike button as user has clicked on like button now
                thumbDislikeButton.setAttribute('src', thumbDislikeImagePath);

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
        //var dislikeButtonSource = $('#thumbDislikeButton-' + messageId)[0].src;
        var dislikeButtonSource = document.querySelector('#thumbDislikeButton-' + messageId).src;

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
                // $('#thumbDislikeButton-' + messageId).attr(
                //     'src',
                //     dislikeImageToReplace
                // );

                // // If earlier it was already highlighted it means, user has un liked the previous like. We need to remove the the animation class. so if user clicks on the same like again, then it can show the animation, else animation won't be shown
                // if (isDislikeHighlight) {
                //     $('#thumbDislikeButton-' + messageId).removeClass(
                //         'feedback-animation'
                //     );
                // } else {
                //     $('#thumbDislikeButton-' + messageId).addClass('feedback-animation');
                // }

                // $('#thumbLikeButton-' + messageId).removeClass('feedback-animation'); // Remove animation class from like button, to display animation when user hits the same button again

                // $('#thumbLikeButton-' + messageId).attr('src', thumbLikeImagePath);

                // Highlight the dislike button
                document.getElementById('thumbDislikeButton-' + messageId).src = dislikeImageToReplace;

                // If earlier it was already highlighted it means, user has unliked the previous like. 
                // We need to remove the animation class so if the user clicks on the same like again, 
                // then it can show the animation, else animation won't be shown
                if (isDislikeHighlight) {
                    document.getElementById('thumbDislikeButton-' + messageId).classList.remove('feedback-animation');
                } else {
                    document.getElementById('thumbDislikeButton-' + messageId).classList.add('feedback-animation');
                }

                // Remove animation class from like button, to display animation when user hits the same button again
                document.getElementById('thumbLikeButton-' + messageId).classList.remove('feedback-animation');

                // Update the like button image
                document.getElementById('thumbLikeButton-' + messageId).src = thumbLikeImagePath;

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
        const messageList = document.getElementById('message-list');
        messageList.scrollTop = messageList.scrollHeight;
        messageList.animate(
            [{ scrollTop: messageList.scrollHeight }],
            {
                duration: 500,
                fill: 'forwards',
            }
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

    window.addEventListener('recordingStopped', (event) => {
        if (event.detail.hasSpoken) {
            createDownloadLink(event.detail.wavBlob, currentScreenName);
        }
    });

    async function startRecording(screenName) {
        // Record metrics
        addMetricsCount('micUsedCount');

        var chunks = [];
        var arrayBufferData;

        visualizerControl.startRecording(screenName);

        //if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        //    navigator.mediaDevices
        //        .getUserMedia({
        //            audio: true,
        //        })
        //        .then((stream) => {

        //            isRecordingStopped = false;
        //            mediaRecorder = new MediaRecorder(stream);
        //            console.log('after mediaRecorder.start()', mediaRecorder);
        //            mediaRecorder.start();


        //            // Show audio recording visualizer
        //            console.log('calling startVisualizer');
        //            audioVisualizer.startVisualizer(stream);
        //            //$('.sendtext').hide();
        //            //showHideMessagePlaceholder(false);

        //            mediaRecorder.ondataavailable = async (e) => {
        //                arrayBufferData = await e.data.arrayBuffer();

        //                chunks.push(e.data);

        //                if (isRecordingStopped) {
        //                    processAudioData();
        //                }

        //                console.log('ondataAvailable:', chunks);

        //                //const blob = new Blob(chunks);

        //                //const encodedBlob = await getWaveBlob(blob, false, arrayBufferData);

        //                //createDownloadLink(encodedBlob, screenName);

        //                //chunks = [];
        //            };

        //            mediaRecorder.onstart = (event) => {
        //                console.log('mediaRecorder.onstart');
        //            };

        //            mediaRecorder.onstop = async (e) => {
        //                isRecordingStopped = true;
        //                console.log('mediaRecorder.onstop', chunks);

        //                if (chunks.length > 0) {

        //                    const blob = new Blob(chunks);

        //                    const encodedBlob = await getWaveBlob(blob, false, arrayBufferData);
        //                    createDownloadLink(encodedBlob);

        //                    //chunks = [];
        //                    processAudioData();
        //                } else {
        //                    console.log('No voice data was recorded.');
        //                }

        //                //let stream = mediaRecorder.stream;
        //                stream.getTracks().forEach(track => track.stop());

        //                console.log('calling stopVisualizer');
        //                //audioVisualizer.stopVisualizer();

        //                //$('.sendtext').show();
        //                //showHideMessagePlaceholder(true);
        //            };


        //            function processAudioData() {
        //                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        //                const audioContext = new AudioContext();
        //                audioBlob.arrayBuffer().then(arrayBuffer => {
        //                    audioContext.decodeAudioData(arrayBuffer).then(audioBuffer => {
        //                        const analyser = audioContext.createAnalyser();
        //                        const source = audioContext.createBufferSource();
        //                        source.buffer = audioBuffer;
        //                        source.connect(analyser);
        //                        analyser.connect(audioContext.destination);

        //                        analyser.fftSize = 256;
        //                        const bufferLength = analyser.frequencyBinCount;
        //                        const dataArray = new Uint8Array(bufferLength);

        //                        source.start();

        //                        function detectSilence() {
        //                            analyser.getByteFrequencyData(dataArray);
        //                            const sum = dataArray.reduce((a, b) => a + b, 0);
        //                            const average = sum / bufferLength;

        //                            if (average < 10) { // Adjust threshold as needed
        //                                console.log("Silence detected");
        //                            } else {
        //                                console.log("Sound detected");
        //                            }

        //                            if (source.playbackState === source.FINISHED_STATE) {
        //                                return;
        //                            }

        //                            requestAnimationFrame(detectSilence);
        //                        }

        //                        detectSilence();
        //                    });
        //                });

        //        })
        //        .catch((error) => {
        //            console.log('error ', error);
        //            //audioVisualizer.stopVisualizer();

        //            //$('.sendtext').show();
        //            //showHideMessagePlaceholder(true);
        //        });
        //}
    }

    async function stopRecording(screenName) {
        //if (mediaRecorder) {
        //    mediaRecorder.stop();
        //}
        visualizerControl.stopRecording(screenName);
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

            chatLoader('base64audio');

            detectAudioLanguage(base64).then((result) => {

                askQuestions(base64, 'base64audio', blob, screenName);
            }).catch((error) => {
                askQuestions(base64, 'base64audio', blob, screenName);
                hideChatLoader('base64audio');
            });
            //askQuestions(base64, 'base64audio', blob, screenName);
        };
    }

    function loadAudioPlayer(blob, messageId, alignment = 'right') {
        // Remove the existing audio player with the same id if available
        const element = document.getElementById(messageId);
        if (element) {
            element.remove();
        }

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
        //$('#message-list').append(div);
        /*document.getElementById('message-list').insertAdjacentHTML('beforeend', div);*/
        const messageList = document.getElementById('message-list');
        messageList.appendChild(div);
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
                    rawAllLanguagesTranslations[i].translations = JSON.parse(JSON.stringify(translationsInfo)); // Deep copy translationsInfo;

                    break;
                } else {
                    allLanguagesTranslations[i] = JSON.parse(JSON.stringify(rawAllLanguagesTranslations[i])); // Deep copy rawAllLanguagesTranslations[i];
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

    function updateWelcomeGreetingMessage(currentLanguageCultureCode, languageCultureCode) {
        // Remove previous language changed message
        let previousLanguageChangedMessageId =
            '#chatbotMessageWrapper-language-change-greeting-message-base64-' +
            currentLanguageCultureCode +
            '-audio';

        const element = document.querySelector(previousLanguageChangedMessageId);
        if (element) {
            element.remove();
        }

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

        // $('#playMessageImg-' + currentWelcomeGreetingDataId).data(
        //     'audio-id',
        //     newWelcomeGreetingDataId
        // );
        document.getElementById('playMessageImg-' + currentWelcomeGreetingDataId).dataset.audioId = newWelcomeGreetingDataId;

        // We also need to update play icon image id
        // To pass to correctly change the audio id whenever language is changed.
        // $('#playMessageImg-' + currentWelcomeGreetingDataId).attr(
        //     'id',
        //     'playMessageImg-' + newWelcomeGreetingDataId
        // );
        document.getElementById('playMessageImg-' + currentWelcomeGreetingDataId).id = 'playMessageImg-' + newWelcomeGreetingDataId;
    }

    /**
     * This functio is used to detect Audio language
     */
    //function detectAudioLanguage(base64Audio) {

    //    // Return promise
    //    return new Promise((resolve, reject) => {
    //        //$.ajax({
    //        //    type: 'POST',
    //        //    url: currentParentRoute + 'DetectAudioLanguage',
    //        //    dataType: 'json',
    //        //    data: { base64Audio: base64Audio },
    //        //    success: function (data) {
    //        //        if (data.Success == true) {

    //        //            isLanguageDetected = true;

    //        //            const currentLanguageCultureCode = getSetCurrentLanguageCode();

    //        //            // Check if current langauge and detected langauge is same or not
    //        //            // If they are different then change the langauge else do nothing
    //        //            if (currentLanguageCultureCode != data.Data.LanguageCultureCode) {

    //        //                changeLanguage(
    //        //                    data.Data.LanguageCultureCode,
    //        //                    data.Data.LanguageEnglishLabel,
    //        //                    data.Data.LanguageCultureLabel,
    //        //                    currentLanguageCultureCode,
    //        //                    false
    //        //                ).then((result) => {
    //        //                    resolve(data);
    //        //                }).catch(error => {
    //        //                    reject(error);
    //        //                });
    //        //            } else {
    //        //                resolve(data);
    //        //            }
    //        //        } else {
    //        //            resolve(data);
    //        //        }
    //        //    },
    //        //    failure: function (data) {
    //        //        reject(data);
    //        //    },
    //        //})

    //    })
    //}

    window.onload = function () {
        sessionStorage.setItem("selectedLanguageCode", "hi");
        sessionStorage.removeItem("isLanguageDetected"); 
    };

    function detectAudioLanguage(base64Audio) {
        return new Promise((resolve, reject) => {

            if (sessionStorage.getItem("isLanguageDetected")) {
                resolve(); 
                return;
            }

            fetch(currentParentRoute + 'DetectAudioLanguage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ base64Audio: base64Audio })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.Success) {
                        
                        sessionStorage.setItem("isLanguageDetected", true);

                        const selectedLanguage = sessionStorage.getItem("selectedLanguageCode");

                        // If detected language differs from selected language, change it
                        if (selectedLanguage !== data.Data.LanguageCultureCode) {
                            changeLanguage(
                                data.Data.LanguageCultureCode,
                                data.Data.LanguageEnglishLabel,
                                data.Data.LanguageCultureLabel,
                                selectedLanguage,
                                false
                            ).then(result => {
                                resolve(data);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            resolve(data);
                        }
                    } else {
                        resolve(data);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
    /**
     *
     * @param {any} languageCultureCode
     * @param {any} LanguageEnglishLabel
     * @param {any} languageCultureLabel
     * @param {any} currentLanguageCultureCode
     */

    //function changeLanguage(
    //    languageCultureCode,
    //    LanguageEnglishLabel,
    //    languageCultureLabel,
    //    currentLanguageCultureCode,
    //    shouldSpeakLanguageName = true
    //) {

    //    if (shouldSpeakLanguageName) {
    //        playAudio('language-labels-' + LanguageEnglishLabel + '-audio');
    //    }


    //    return new Promise((resolve, reject) => {
    //        isChangeLanguageRequestInProgress = $.ajax({
    //            type: 'POST',
    //            url: currentParentRoute + 'ChangeLanguage',
    //            dataType: 'json',
    //            data: { lang: languageCultureCode },
    //            success: async function (data) {
    //                // If language is changed after session refresh was done,
    //                // Add metric count for it
    //                if (sessionId !== previousSessionId) {
    //                    addMetricsCount('stage2Count');
    //                }

    //                // Remove previous language changed message
    //                removePreviousWelcomeGreetingMessage(currentLanguageCultureCode);

    //                isChangeLanguageRequestInProgress = null;


    //                // Update selected language buttons and labels to update the selected language in UI.
    //                updateSelectedLanguageInUI(languageCultureCode, languageCultureLabel);

    //                await getTranslations();

    //                const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.welcome_greeting;
    //                //updateTranslations([], ["welcome_greeting"]);
    //                //updateWelcomeGreetingMessage();
    //                const uniqueMessageId = 'welcome-greeting-message-base64-' + languageCultureCode + '-audio';

    //                //Add welcome greeting change message to chat screen
    //                updateChatMessagesList(
    //                    currentLanguageChangeMessage, uniqueMessageId,
    //                    '',
    //                    true,
    //                    true,
    //                    true
    //                );

    //                getWelcomeGreetingsAudio(true);

    //                //updateWelcomeGreetingMessage(currentLanguageCultureCode, languageCultureCode);

    //                showUserRecordedMessageInTextBox('');

    //                previousSessionId = sessionId;

    //                resolve(data);
    //            },
    //            failure: function (data) {
    //                isChangeLanguageRequestInProgress = null;
    //                alert('oops something went wrong');
    //                reject(data);
    //            }
    //        });
    //    });
    //}
    function changeLanguage(
        languageCultureCode,
        LanguageEnglishLabel,
        languageCultureLabel,
        currentLanguageCultureCode,
        shouldSpeakLanguageName = true
    ) {
        if (shouldSpeakLanguageName) {
            playAudio('language-labels-' + LanguageEnglishLabel + '-audio');
        }

        return new Promise((resolve, reject) => {
            isChangeLanguageRequestInProgress = fetch(currentParentRoute + 'ChangeLanguage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ lang: languageCultureCode })
            })
                .then(response => response.json())
                .then(async data => {
                    // If language is changed after session refresh was done,
                    // Add metric count for it
                    if (sessionId !== previousSessionId) {
                        addMetricsCount('stage2Count');
                    }

                    // Remove previous language changed message
                    removePreviousWelcomeGreetingMessage(currentLanguageCultureCode);

                    isChangeLanguageRequestInProgress = null;
                    currentLanguageInfo.currentLanguageCode = languageCultureCode;

                    // Update selected language buttons and labels to update the selected language in UI.
                    updateSelectedLanguageInUI(languageCultureCode, languageCultureLabel);

                    await getTranslations();

                    const currentLanguageChangeMessage = currentLanguageInfo.translations.messages.welcome_greeting;

                    const uniqueMessageId = 'welcome-greeting-message-base64-' + languageCultureCode + '-audio';

                    // Add welcome greeting change message to chat screen
                    updateChatMessagesList(
                        currentLanguageChangeMessage, uniqueMessageId,
                        '',
                        true,
                        true,
                        true
                    );

                    getWelcomeGreetingsAudio(true);

                    showUserRecordedMessageInTextBox('');

                    previousSessionId = sessionId;

                    resolve(data);
                })
                .catch(error => {
                    isChangeLanguageRequestInProgress = null;
                    //alert('oops something went wrong');
                    reject(error);
                });
        });
    }
    function updateSelectedLanguageInUI(
        languageCultureCode,
        languageCultureLabel
    ) {
        localStorage.setItem("currentLanguageCode", languageCultureCode);
        // $('.language-buttons').removeClass('btn-success');
        // $('.language-buttons').addClass('btn-secondary');

        // $('.language-buttons').data(
        //     'current-language-culture-code',
        //     languageCultureCode
        // );
        // $('li.languagesLabels a').data(
        //     'current-language-culture-code',
        //     languageCultureCode
        // );

        // $(
        //     'button[data-language-culture-code="' + languageCultureCode + '"]'
        // ).addClass('btn-success');

        // $(
        //     'button[data-language-culture-code="' + languageCultureCode + '"]'
        // ).removeClass('btn-secondary');

        // $('#selectedLanguageLabel').html(languageCultureLabel);

        // $('li.languagesLabels a').removeClass('fw-bold');

        // $(
        //     'li.languagesLabels[data-language-culture-code="' +
        //     languageCultureCode +
        //     '"] a'
        // ).addClass('fw-bold');
        // Remove success class and add secondary class to language buttons
        document.querySelectorAll('.language-buttons languagesLabels').forEach(button => {

            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
            button.dataset.currentLanguageCultureCode = languageCultureCode;
        });

        // Set data attribute for current language culture code on language labels
        // Select all elements with the data attribute 'data-current-language-culture-code'
        const elements = document.querySelectorAll('[data-current-language-culture-code]');

        // Iterate over the NodeList and update the value of each element
        elements.forEach(element => {
            element.setAttribute('data-current-language-culture-code', languageCultureCode); // Update the data attribute as neededelement.value = languageCultureCode; // Update the value as needed
        });

        // Add success class and remove secondary class for the selected language button
        const selectedLanguageButton = document.querySelector(`button[data-language-culture-code="${languageCultureCode}"]`);
        if (selectedLanguageButton) {
            selectedLanguageButton.classList.add('btn-success');
            selectedLanguageButton.classList.remove('btn-secondary');
        }

        // Update the selected language label
        document.getElementById('selectedLanguageLabel').innerHTML = languageCultureLabel;

        // Remove bold class from all language labels and add it to the selected one
        document.querySelectorAll('li.languagesLabels a').forEach(label => {
            label.classList.remove('fw-bold');
        });
        const selectedLanguageLabel = document.querySelector(`li.languagesLabels[data-language-culture-code="${languageCultureCode}"] a`);
        if (selectedLanguageLabel) {
            selectedLanguageLabel.classList.add('fw-bold');
        }
    }

    //async function getWelcomeGreetingsAudio(isLanguageChanged) {
    //    const currentLanguageCode = getSetCurrentLanguageCode();

    //    const welcomeMessage = currentLanguageInfo.translations.messages.welcome_greeting;

    //    isGetWelcomeGreetingsTextToSpeechRequestInProgress = $.ajax({
    //        type: "POST",
    //        url: "/Home/GetWelcomeGreetingsTextToSpeech",
    //        dataType: "json",
    //        data: { languageCode: currentLanguageCode, welcomeMessage: welcomeMessage, gender: globalAutoReadFeature.selectedVoice ? globalAutoReadFeature.selectedVoice : null },
    //        success: function (data) {
    //            isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;


    //            initWelcomeGreetingAudioConfig(data.Data, isLanguageChanged);
    //        },
    //        failure: function (data) {
    //            isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;
    //            alert("oops something went wrong");
    //        },
    //    });
    //}
    function getWelcomeGreetingsAudio(isLanguageChanged) {
        const currentLanguageCode = getSetCurrentLanguageCode();
        const welcomeMessage = currentLanguageInfo.translations.messages.welcome_greeting;

        return new Promise((resolve, reject) => {
            isGetWelcomeGreetingsTextToSpeechRequestInProgress = fetch('/Home/GetWelcomeGreetingsTextToSpeech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    languageCode: currentLanguageCode,
                    welcomeMessage: welcomeMessage,
                    gender: globalAutoReadFeature.selectedVoice ? globalAutoReadFeature.selectedVoice : null
                })
            })
                .then(response => response.json())
                .then(data => {
                    isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;
                    initWelcomeGreetingAudioConfig(data.Data, isLanguageChanged);
                    resolve(data);
                })
                .catch(error => {
                    isGetWelcomeGreetingsTextToSpeechRequestInProgress = null;
                    //alert("oops something went wrong");
                    reject(error);
                });
        });
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

        //if (isLanguageChanged == true) {
        //    autoPlayAudio(textsToGetSpeech[0].id);
        //}

        if (globalAutoReadFeature.isAutoPlayEnabled == true && isWelcomeMessageAutoPlayed == false) {
            autoPlayAudio(textsToGetSpeech[0].id);

            isWelcomeMessageAutoPlayed = true;
        }
    }

    function setAutoPlayOn(audioId) {
        //localStorage.setItem('isAutoPlayEnabled', true);
        playAudio(audioId);
    }

    function autoPlayAudio(audioId) {
        let isAutoPlayEnabled = globalAutoReadFeature.isAutoPlayEnabled;

        if (isAutoPlayEnabled == true) {
            playAudio(audioId);
        }
    }

    // async function playAudioWithRememberingLastPause(audioId) {
    //     const currentAudioIdElement = document.getElementById(audioId);

    //     if (currentAudioIdElement.paused == false) {
    //         currentAudioIdElement.pause();

    //         $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);

    //         var allAudioEls = $('audio');

    //         allAudioEls.each(function () {
    //             var a = $(this).get(0);

    //             if (a.id != 'globalAudioElement') {
    //                 a.pause();
    //                 $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
    //             }
    //         });

    //         if (previousPlayingMessageId != audioId) {
    //             let currentAudio = document.getElementById(audioId);
    //             currentAudio.playbackRate = 1.1;
    //             currentAudio.play();

    //             previousPlayingMessageId = audioId;

    //             $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);
    //             // Show audio progressbar when audio is playing

    //             currentAudio.onended = function () {
    //                 previousPlayingMessageId = '';
    //                 $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
    //             };
    //         } else {
    //             //sessionStorage.removeItem('isAutoPlayEnabled');
    //         }
    //     } else {
    //         var allAudioEls = $('audio');

    //         allAudioEls.each(function () {
    //             var a = $(this).get(0);

    //             if (a.id != 'globalAudioElement') {
    //                 a.pause();

    //                 $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
    //             }
    //         });

    //         let currentAudio = document.getElementById(audioId);
    //         currentAudio.playbackRate = 1.1;
    //         currentAudio.play();
    //         previousPlayingMessageId = audioId;

    //         $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);

    //         currentAudio.onended = function () {
    //             previousPlayingMessageId = '';

    //             $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
    //         };
    //     }
    // }
    async function playAudioWithRememberingLastPause(audioId) {
        const currentAudioIdElement = document.getElementById(audioId);

        if (!currentAudioIdElement.paused) {
            currentAudioIdElement.pause();

            document.getElementById('playMessageImg-' + audioId).src = startAudioImagePath;

            const allAudioEls = document.querySelectorAll('audio');

            allAudioEls.forEach(audio => {
                if (audio.id !== 'globalAudioElement') {
                    //audio.pause();
                    //document.getElementById('playMessageImg-' + audio.id).src = startAudioImagePath;

                    if (audio.paused == false) {
                        audio.pause();

                        const playMessageImg = document.getElementById('playMessageImg-' + audio.id);
                        if (playMessageImg) {
                            playMessageImg.src = startAudioImagePath;
                        }
                    }
                }
            });

            if (previousPlayingMessageId !== audioId) {
                let currentAudio = document.getElementById(audioId);
                currentAudio.playbackRate = 1.1;
                currentAudio.play();

                previousPlayingMessageId = audioId;

                document.getElementById('playMessageImg-' + audioId).src = stopAudioImagePath;

                currentAudio.onended = function () {
                    previousPlayingMessageId = '';

                    const playMessageImg = document.getElementById('playMessageImg-' + audioId);

                    if (playMessageImg) {
                        playMessageImg.src = startAudioImagePath;
                    }
                };
            }
        } else {
            const allAudioEls = document.querySelectorAll('audio');

            allAudioEls.forEach(audio => {
                if (audio.id !== 'globalAudioElement') {

                    if (audio.paused == false) {
                        audio.pause();

                        const playMessageImg = document.getElementById('playMessageImg-' + audio.id);
                        if (playMessageImg) {
                            playMessageImg.src = startAudioImagePath;
                        }
                    }
                }
            });

            let currentAudio = document.getElementById(audioId);
            currentAudio.playbackRate = 1.1;
            currentAudio.play();
            previousPlayingMessageId = audioId;

            const playMessageImg = document.getElementById('playMessageImg-' + audioId);
            if (playMessageImg) {
                playMessageImg.src = stopAudioImagePath;
            }

            currentAudio.onended = function () {
                previousPlayingMessageId = '';
                const playMessageImg = document.getElementById('playMessageImg-' + audioId);

                if (playMessageImg) {
                    playMessageImg.src = startAudioImagePath;
                }

            };
        }
    }

    // async function playAudio(audioId) {
    //     playAudioWithRememberingLastPause(audioId);

    //     return;
    //     const globalAudioElement = document.getElementById('globalAudioElement');

    //     if (globalAudioElement.paused == false) {
    //         globalAudioElement.pause();
    //         globalAudioElement.currentTime = 0;

    //         $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);

    //         var allAudioEls = $('audio');

    //         allAudioEls.each(function () {
    //             var a = $(this).get(0);

    //             if (a.id != 'globalAudioElement') {
    //                 a.pause();
    //                 a.currentTime = 0;
    //                 $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
    //             }
    //         });

    //         if (previousPlayingMessageId != audioId) {
    //             globalAudioElement.src = document.getElementById(audioId).src;
    //             globalAudioElement.playbackRate = 1.1;
    //             globalAudioElement.play();
    //             previousPlayingMessageId = audioId;

    //             $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);
    //             // Show audio progressbar when audio is playing

    //             globalAudioElement.onended = function () {
    //                 previousPlayingMessageId = '';
    //                 $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
    //             };
    //         } else {
    //             //sessionStorage.removeItem('isAutoPlayEnabled');
    //         }
    //     } else {
    //         var allAudioEls = $('audio');

    //         allAudioEls.each(function () {
    //             var a = $(this).get(0);

    //             if (a.id != 'globalAudioElement') {
    //                 a.pause();
    //                 a.currentTime = 0;

    //                 $('#playMessageImg-' + a.id).attr('src', startAudioImagePath);
    //             }
    //         });

    //         globalAudioElement.src = document.getElementById(audioId).src;
    //         globalAudioElement.playbackRate = 1.1;
    //         globalAudioElement.play();
    //         previousPlayingMessageId = audioId;

    //         $('#playMessageImg-' + audioId).attr('src', stopAudioImagePath);

    //         globalAudioElement.onended = function () {
    //             previousPlayingMessageId = '';

    //             $('#playMessageImg-' + audioId).attr('src', startAudioImagePath);
    //         };
    //     }
    // }
    async function playAudio(audioId) {
        playAudioWithRememberingLastPause(audioId);
        return;

        const globalAudioElement = document.getElementById('globalAudioElement');

        if (!globalAudioElement.paused) {
            globalAudioElement.pause();
            globalAudioElement.currentTime = 0;

            document.getElementById('playMessageImg-' + audioId).src = startAudioImagePath;

            const allAudioEls = document.querySelectorAll('audio');

            allAudioEls.forEach(audio => {
                if (audio.id !== 'globalAudioElement') {
                    audio.pause();
                    audio.currentTime = 0;
                    document.getElementById('playMessageImg-' + audio.id).src = startAudioImagePath;
                }
            });

            if (previousPlayingMessageId !== audioId) {
                globalAudioElement.src = document.getElementById(audioId).src;
                globalAudioElement.playbackRate = 1.1;
                globalAudioElement.play();
                previousPlayingMessageId = audioId;

                document.getElementById('playMessageImg-' + audioId).src = stopAudioImagePath;

                globalAudioElement.onended = function () {
                    previousPlayingMessageId = '';
                    document.getElementById('playMessageImg-' + audioId).src = startAudioImagePath;
                };
            }
        } else {
            const allAudioEls = document.querySelectorAll('audio');

            allAudioEls.forEach(audio => {
                if (audio.id !== 'globalAudioElement') {
                    audio.pause();
                    audio.currentTime = 0;
                    document.getElementById('playMessageImg-' + audio.id).src = startAudioImagePath;
                }
            });

            globalAudioElement.src = document.getElementById(audioId).src;
            globalAudioElement.playbackRate = 1.1;
            globalAudioElement.play();
            previousPlayingMessageId = audioId;

            document.getElementById('playMessageImg-' + audioId).src = stopAudioImagePath;

            globalAudioElement.onended = function () {
                previousPlayingMessageId = '';
                document.getElementById('playMessageImg-' + audioId).src = startAudioImagePath;
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
                    getTranslations();
                })
                .catch((sessionError) => {
                    handleError(sessionError);
                });
        }

        if (showConfirmation == true) {

            // Fetch translation based on the keys
            const confirmationMessage = getTranslation('messages', 'session_restart_confirmation_message');

            // Ensure the message is available
            if (confirmationMessage) {
                // Show confirmation modal with the translated message
                showChatbotConfirmationModal(
                    'restart-session',
                    confirmationMessage,
                    (data) => { }
                );
            } else {
                console.error('Confirmation message not found');
            }
        } else {
            proceedForSessionRestart();
        }
    }

    // Function to get translation
    function getTranslation(translationType, translationKey) {
        // Assuming you have a translations object that contains your messages
        const translations = currentLanguageInfo.translations[translationType];
        return translations ? translations[translationKey] : null;
    }


    function clearChatHistory() {
        // $('.conversationsWrapper').remove();

        document.querySelectorAll('.conversationsWrapper').forEach(element => {
            element.remove();
        });

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
        //$('#message-list').append(div);
        const messageList = document.getElementById('message-list');
        messageList.appendChild(div);
    }

    function changeInputPlaceholderValue(valueToChange) {

        var defaultPlaceholderMessage = currentLanguageInfo.translations.messages.ask_ur_question; //translations.find((f) => f.key == 'ask_ur_question').value;

        // $(userQuestionTextBox).attr(
        //     'placeholder',
        //     valueToChange != undefined ? valueToChange : defaultPlaceholderMessage
        // );

        // $(userQuestionTextBox).trigger('keyup');

        // autosize.update($(userQuestionTextBox));

        const userQuestionTextBox = document.getElementById('userQuestionTextBox');
        userQuestionTextBox.placeholder = valueToChange != undefined ? valueToChange : defaultPlaceholderMessage;
        userQuestionTextBox.dispatchEvent(new Event('keyup'));
        autosize.update(userQuestionTextBox);


        // Highlight the dislike button
        //document.getElementById('thumbDislikeButton-' + messageId).src = dislikeImageToReplace;

        //// If earlier it was already highlighted it means, user has unliked the previous like.
        //// We need to remove the animation class so if the user clicks on the same like again,
        //// then it can show the animation, else animation won't be shown
        //if (isDislikeHighlight) {
        //    document.getElementById('thumbDislikeButton-' + messageId).classList.remove('feedback-animation');
        //} else {
        //    document.getElementById('thumbDislikeButton-' + messageId).classList.add('feedback-animation');
        //}

        //// Remove animation class from like button, to display animation when user hits the same button again
        //document.getElementById('thumbLikeButton-' + messageId).classList.remove('feedback-animation');

        //// Update the like button image
        //document.getElementById('thumbLikeButton-' + messageId).src = thumbLikeImagePath;
    }

    // function showChatbotConfirmationModal(
    //     type,
    //     confirmationMessage,
    //     closeCallback
    // ) {
    //     $('#chatbotConfirmationModalSaveButton').data('modal-type', type);

    //     chatbotConfirmationModal = new bootstrap.Modal(
    //         '#' + chatbotConfirmationModalId,
    //         modalOptions
    //     );

    //     $('#chatbot-restart-session-confirmation-message').append(
    //         confirmationMessage
    //     );
    //     chatbotConfirmationModal.show();

    //     chatbotConfirmationModalElement.addEventListener(
    //         'hidden.bs.modal',
    //         (event) => {
    //             closeCallback(event);
    //             // do something...
    //         }
    //     );
    // }
    function showChatbotConfirmationModal(type, confirmationMessage, closeCallback) {
        // Set the modal type data attribute
        document.getElementById('chatbotConfirmationModalSaveButton').dataset.modalType = type;

        // Initialize the Bootstrap modal
        const chatbotConfirmationModal = new bootstrap.Modal(
            document.getElementById(chatbotConfirmationModalId),
            modalOptions
        );

        // Clear the previous message before appending the new one
        const messageElement = document.getElementById('chatbot-restart-session-confirmation-message');
        messageElement.innerHTML = ''; // Clear the previous message
        messageElement.innerHTML = confirmationMessage; // Set the new confirmation message

        // Show the modal
        chatbotConfirmationModal.show();

        // Add event listener for when the modal is hidden
        document.getElementById(chatbotConfirmationModalId).addEventListener('hidden.bs.modal', (event) => {
            closeCallback(event);
        });
    }


    function showStartNewConversationModal(
        closeCallback
    ) {

        startNewConversationModal = new bootstrap.Modal(
            '#' + startNewConversationModalId,
            modalOptions
        );

        startNewConversationModal.show();

        startNewConversationModalElement.addEventListener(
            'hidden.bs.modal',
            (event) => {
                closeCallback(event);
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

    // function showHideMessagePlaceholder(shouldShow) {

    //     if (shouldShow) {
    //         //$(userQuestionTextBox).val('');
    //         //$(userQuestionTextBox).attr('placeholder', '');
    //         // Hide placeholder temporarily, keep value as it is

    //         $(userQuestionTextBox).attr('placeholder', $(userQuestionTextBox).attr('data-text'));

    //     } else {
    //         //$(userQuestionTextBox).val('');
    //         //$(userQuestionTextBox).attr('placeholder', currentLanguageInfo.translations.messages.ask_ur_question);
    //         $(userQuestionTextBox).attr('data-text', $(userQuestionTextBox).attr('placeholder'));
    //         $(userQuestionTextBox).removeAttr('placeholder');
    //     }
    // }
    function showHideMessagePlaceholder(shouldShow) {
        const userQuestionTextBoxElement = document.querySelector(userQuestionTextBox);

        if (shouldShow) {
            // Hide placeholder temporarily, keep value as it is
            userQuestionTextBoxElement.setAttribute('placeholder', userQuestionTextBoxElement.getAttribute('data-text'));
        } else {
            userQuestionTextBoxElement.setAttribute('data-text', userQuestionTextBoxElement.getAttribute('placeholder'));
            userQuestionTextBoxElement.removeAttribute('placeholder');
        }
    }

    function removePreviousWelcomeGreetingMessage(languageCultureCode) {
        // Remove previous language changed message
        let previousSchemeChangeMessageId =
            '#chatbotMessageWrapper-welcome-greeting-message-base64-' +
            languageCultureCode +
            '-audio';


        //$(previousSchemeChangeMessageId).remove();
        let element = document.getElementById(previousSchemeChangeMessageId);
        if (element) {
            element.remove();
        }

        //$('#welcome-message-wrapper').remove();
        let welcomeMessageWrapper = document.getElementById('welcome-message-wrapper');
        if (welcomeMessageWrapper) {
            welcomeMessageWrapper.remove();
        }
    }

    /**
     * Sanitizes user input to prevent JavaScript, HTML, and jQuery injection.
     * @param {string} userInput - The input string to sanitize.
     * @returns {string} - The sanitized string.
     */
    function sanitizeInput(userInput) {
        // Create a new div element
        let div = document.createElement('div');

        // Set the textContent to the user input
        div.textContent = userInput;

        // Return the sanitized HTML
        return div.innerHTML;
    }
})();
