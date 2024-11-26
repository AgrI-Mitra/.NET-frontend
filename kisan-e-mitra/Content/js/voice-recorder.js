(function () {
    // const audioVisualizerWrapper = document.querySelector('.audio-visualizer-wrapper');
    // const audioVisualizerContainer = document.querySelector('.audio-visualizer-container');
    // const audioProcessingContainer = document.querySelector('.audio-processing-container');
    // const micAudioRecordingIcon = document.getElementById('micAudioRecordingIcon');
    // const userQuestionTextBox = '#userQuestionTextBox';
    let currentScreenName = '';
    //let canvas = null;
    let canvasCtx = null;
    let config = null;
    function getElementByScreenName(selector) {
        return document.querySelector(`${selector}[data-screen-name="${currentScreenName}"]`);
    }

    // let canvas = document.getElementById('visualizer');
    // const canvasCtx = canvas.getContext('2d');
    let audioCtx = null;
    let analyser = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let stream = null;
    let isRecording = false;
    let hasSpoken = false;
    let animationFrameId = null;

    window.addEventListener('recordingStopped', (event) => {
    });

    function updateCanvasAndConfig() {
        canvas = getElementByScreenName('#visualizer');
        canvasCtx = canvas.getContext('2d');
        config = {
            recording: {
                maxHeight: canvas.height,
                minHeight: 4,
                color: 'rgb(25, 135, 84)',
            },
            notRecording: {
                maxHeight: canvas.height / 2,
                minHeight: 2,
                color: 'rgb(255, 0, 0)',
            },
            idle: {
                maxHeight: canvas.height / 6,
                minHeight: 1,
                color: 'rgb(25, 135, 84)',
                animate: true,
            },
            barWidthFactor: 0.8,
            colorTransitionSpeed: 0.05,
            heightTransitionSpeed: 0.1,
            silenceThreshold: 50,
            silenceDuration: 1000,
            useFullHeight: true
        };
    }

    function analyzeAudioData(audioBuffer) {
        const threshold = 0.01; // Example threshold for detecting speech
        const channelData = audioBuffer.getChannelData(0); // Get audio data for the first channel
        const sampleRate = audioBuffer.sampleRate; // Get the sample rate of the audio buffer
        const durationPerSample = 1 / sampleRate; // Duration of each sample in seconds

        let speechDuration = 0; // Initialize speech duration

        for (let i = 0; i < channelData.length; i++) {
            if (Math.abs(channelData[i]) > threshold) {
                speechDuration += durationPerSample; // Increment speech duration
                if (speechDuration > 1) {
                    return true; // Return true if speech duration exceeds 1 second
                }
            }
        }
        return false;
    }

    function startRecording(screenName) {
        currentScreenName = screenName;
        updateCanvasAndConfig();
        hasSpoken = false; // Reset hasSpoken when a new recording starts
        recordedChunks = []; // Reset recorded chunks

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
        }

        navigator.permissions
            .query({ name: 'microphone' })
            .then((permissionStatus) => {
                if (permissionStatus.state === 'granted') {
                    getUserMediaStream();
                } else if (
                    permissionStatus.state === 'prompt' ||
                    permissionStatus.state === 'denied'
                ) {
                    navigator.mediaDevices
                        .getUserMedia({ audio: true })
                        .then((s) => {
                            stream = s;
                            startAudioStream();
                        })
                        .catch((err) => {
                            console.error('Error accessing audio stream:', err);
                        });
                }
            });
    }

    function getUserMediaStream() {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((s) => {
                stream = s;
                startAudioStream();
            })
            .catch((err) => {
                console.error('Error accessing audio stream:', err);
            });
    }

    function startAudioStream() {
        if (!stream) {
            console.error('No media stream available');
            return;
        }

        audioCtx.resume().then(() => {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            isRecording = true;
            hasSpoken = false;
            //document.getElementById('startButton').style.display = 'none';
            //document.getElementById('stopButton').style.display = 'block';

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = handleDataAvailable;
            mediaRecorder.onstart = handleStart;
            mediaRecorder.onstop = handleStop;
            mediaRecorder.onerror = handleError;
            mediaRecorder.start();

            visualize(); // Start visualization after setting up the audio stream
        });
    }

    function handleDataAvailable(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    }

    function handleStart() {
        const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
        const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');
        const micAudioRecordingIcon = getElementByScreenName('#micAudioRecordingIcon');

        audioVisualizerWrapper.style.display = "flex";
        audioVisualizerContainer.style.display = 'flex';
        micAudioRecordingIcon.style.display = 'flex';

        //showHideMessagePlaceholder(false);
        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(false);
        }
    }

    function handleError() {
        console.error('MediaRecorder error');

        const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
        const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');
        const micAudioRecordingIcon = getElementByScreenName('#micAudioRecordingIcon');

        audioVisualizerWrapper.style.display = "none";
        audioVisualizerContainer.style.display = 'none';
        micAudioRecordingIcon.style.display = 'none';
        //showHideMessagePlaceholder(true);
        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(true);
        }
    }

    function handleStop() {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        recordedChunks = [];
        convertToWav(blob, (wavBlob) => {
            const event = new CustomEvent('recordingStopped', {
                detail: { hasSpoken, wavBlob },
            });
            window.dispatchEvent(event);
        });

        // Stop idle animation and clear variables
        stopIdleAnimation(currentScreenName);
        clearVariables();

        stopDraw();

        // Hide the canvas
        const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
        const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');
        const micAudioRecordingIcon = getElementByScreenName('#micAudioRecordingIcon');
        audioVisualizerWrapper.style.display = 'none';
        audioVisualizerContainer.style.display = 'none';
        micAudioRecordingIcon.style.display = 'none';

        //showHideMessagePlaceholder(true);
        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(true);
        }
    }

    function convertToWav(blob, callback) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            audioCtx.decodeAudioData(arrayBuffer, function (audioBuffer) {
                hasSpoken = analyzeAudioData(audioBuffer); // Update hasSpoken based on audio analysis
                const wavBlob = audioBufferToWavBlob(audioBuffer);
                callback(wavBlob);
            });
        };
        reader.readAsArrayBuffer(blob);
    }

    function audioBufferToWavBlob(audioBuffer) {
        const numOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        let result;
        if (numOfChannels === 2) {
            result = interleave(
                audioBuffer.getChannelData(0),
                audioBuffer.getChannelData(1)
            );
        } else {
            result = audioBuffer.getChannelData(0);
        }

        const buffer = new ArrayBuffer(44 + result.length * 2);
        const view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 36 + result.length * 2, true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, format, true);
        /* channel count */
        view.setUint16(22, numOfChannels, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, (sampleRate * numOfChannels * bitDepth) / 8, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, (numOfChannels * bitDepth) / 8, true);
        /* bits per sample */
        view.setUint16(34, bitDepth, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, result.length * 2, true);

        // Write the PCM samples
        let offset = 44;
        for (let i = 0; i < result.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, result[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }

        return new Blob([view], { type: 'audio/wav' });
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function interleave(inputL, inputR) {
        const length = inputL.length + inputR.length;
        const result = new Float32Array(length);

        let index = 0;
        let inputIndex = 0;

        while (index < length) {
            result[index++] = inputL[inputIndex];
            result[index++] = inputR[inputIndex];
            inputIndex++;
        }
        return result;
    }

    function stopRecording(screenName) {

        currentScreenName = screenName;
        updateCanvasAndConfig();
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            stream = null;
        }
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder = null;
        }
        isRecording = false;
        //document.getElementById('startButton').style.display = 'block';
        //document.getElementById('stopButton').style.display = 'none';

        //showHideMessagePlaceholder(true);
        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(true);
        }
    }

    function startIdleAnimation(screenName) {
        currentScreenName = screenName;
        updateCanvasAndConfig();

        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
        }

        const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
        const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');

        audioVisualizerWrapper.style.display = "flex";
        audioVisualizerContainer.style.display = 'flex';
        /*audioProcessingContainer.style.display = 'flex';*/
        //micAudioRecordingIcon.style.display = 'flex';

        config.idle.animate = true;
        visualize();
        //showHideMessagePlaceholder(false);
        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(false);
        }
    }

    function stopIdleAnimation(screenName) {
        currentScreenName = screenName;
        updateCanvasAndConfig();

        config.idle.animate = false;
        cancelAnimationFrame(animationFrameId);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
        const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');

        if (audioVisualizerWrapper) {
            audioVisualizerWrapper.style.display = "none";
        }

        if (audioVisualizerContainer) {
            audioVisualizerContainer.style.display = 'none';
        }
        //audioVisualizerWrapper.style.display = "none";
        //audioVisualizerContainer.style.display = 'none';
        /*audioProcessingContainer.style.display = 'none';*/

        if (currentScreenName == 'conversation') {
            showHideMessagePlaceholder(true);
        }
    }

    function toggleIdleAnimation() {
        if (config.idle.animate) {
            stopIdleAnimation(currentScreenName);
        } else {
            startIdleAnimation(currentScreenName);
        }
    }

    //document
    //    .getElementById('startButton')
    //    .addEventListener('click', startRecording);
    //document
    //    .getElementById('stopButton')
    //    .addEventListener('click', stopRecording);
    //document
    //    .getElementById('toggleIdleButton')
    //    .addEventListener('click', toggleIdleAnimation);


    function visualize() {

        /*$('.sendtext').hide();*/
        //showHideMessagePlaceholder(false);

        try {



            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let previousHeights = new Float32Array(bufferLength);
            let colorTransition = 0;
            let lastAudioTime = Date.now();

            function draw() {
                animationFrameId = requestAnimationFrame(draw);

                if (isRecording) {
                    analyser.getByteFrequencyData(dataArray);
                } else if (config.idle.animate) {
                    for (let i = 0; i < bufferLength; i++) {
                        dataArray[i] = Math.random() * 255;
                    }
                }

                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                const barWidth = (canvas.width / bufferLength) * config.barWidthFactor;
                let x = 0;

                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

                if (avgVolume >= config.silenceThreshold) {
                    lastAudioTime = Date.now();
                }

                const currentTime = Date.now();
                const isSpeaking = currentTime - lastAudioTime < config.silenceDuration;
                const targetColor = isRecording && isSpeaking ? 1 : 0;

                colorTransition +=
                    (targetColor - colorTransition) * config.colorTransitionSpeed;

                const r = isRecording && isSpeaking ? 25 : 255;
                const g = isRecording && isSpeaking ? 135 : 0;
                const b = isRecording && isSpeaking ? 84 : 0;

                for (let i = 0; i < bufferLength; i++) {
                    const normalizedValue = dataArray[i] / 255;
                    const maxHeight = config.useFullHeight
                        ? canvas.height
                        : isRecording
                            ? isSpeaking
                                ? config.recording.maxHeight
                                : config.notRecording.maxHeight
                            : config.idle.maxHeight;
                    const minHeight = isRecording
                        ? isSpeaking
                            ? config.recording.minHeight
                            : config.notRecording.minHeight
                        : config.idle.minHeight;
                    const targetHeight = normalizedValue * maxHeight;

                    let barHeight =
                        previousHeights[i] +
                        (targetHeight - previousHeights[i]) * config.heightTransitionSpeed;

                    barHeight = Math.max(barHeight, minHeight);

                    canvasCtx.fillStyle = isRecording
                        ? `rgb(${r},${g},${b})`
                        : config.idle.color;
                    canvasCtx.fillRect(
                        x,
                        canvas.height / 2 - barHeight / 2,
                        barWidth,
                        barHeight
                    );
                    canvasCtx.fillRect(
                        x,
                        canvas.height / 2 + barHeight / 2,
                        barWidth,
                        -barHeight
                    );

                    x += barWidth + 1;

                    previousHeights[i] = barHeight;
                }
            }

            // Request the next frame
            animationFrameId = requestAnimationFrame(draw);

        } catch (e) {

            const audioVisualizerWrapper = getElementByScreenName('.audio-visualizer-wrapper');
            const audioVisualizerContainer = getElementByScreenName('.audio-visualizer-container');
            const micAudioRecordingIcon = getElementByScreenName('#micAudioRecordingIcon');

            audioVisualizerWrapper.style.display = 'none';
            audioVisualizerContainer.style.display = 'none';
            micAudioRecordingIcon.style.display = 'none';


            //showHideMessagePlaceholder(true);
            if (currentScreenName == 'conversation') {
                showHideMessagePlaceholder(true);
            }
        }

    }

    // Start the draw function when needed
    function startDraw() {
        if (!animationFrameId) {
            visualize(); // Ensure variables are initialized before drawing
        }
    }

    // Stop the draw function when needed
    function stopDraw() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }

    function clearVariables() {
        hasSpoken = false;
        recordedChunks = [];
    }

    function showHideMessagePlaceholder(shouldShow) {

        if (shouldShow) {
            //$(userQuestionTextBox).val('');
            //$(userQuestionTextBox).attr('placeholder', '');
            // Hide placeholder temporarily, keep value as it is
            document.querySelectorAll('.sendtext').forEach(function (element) {
                element.style.display = 'block';
            });
            // $(userQuestionTextBox).attr('placeholder', $(userQuestionTextBox).attr('data-text'));
            // Set the placeholder attribute of userQuestionTextBox
            var userQuestionTextBox = document.querySelector('#userQuestionTextBox'); // Assuming userQuestionTextBox is an ID
            if (userQuestionTextBox) {
                //userQuestionTextBox.setAttribute('placeholder', userQuestionTextBox.getAttribute('data-text'));
            }

        } else {
            // $('.sendtext').hide();
            document.querySelectorAll('.sendtext').forEach(function (element) {
                element.style.display = 'none';
            });
            //$(userQuestionTextBox).val('');
            //$(userQuestionTextBox).attr('placeholder', currentLanguageInfo.translations.messages.ask_ur_question);
            // $(userQuestionTextBox).attr('data-text', $(userQuestionTextBox).attr('placeholder'));
            // $(userQuestionTextBox).removeAttr('placeholder');
            var userQuestionTextBox = document.querySelector('#userQuestionTextBox'); // Adjust the selector if needed

            if (userQuestionTextBox) {
                // Set the 'data-text' attribute to the value of the 'placeholder' attribute
                userQuestionTextBox.setAttribute('data-text', userQuestionTextBox.getAttribute('placeholder'));

                // Remove the 'placeholder' attribute
                userQuestionTextBox.removeAttribute('placeholder');
            }
        }
    }

    window.visualizerControl = {
        startRecording,
        stopRecording,
        startIdleAnimation,
        toggleIdleAnimation,
        stopIdleAnimation,
        clearVariables,
    };
})();