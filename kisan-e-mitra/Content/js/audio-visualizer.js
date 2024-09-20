(function () {
    document.addEventListener('DOMContentLoaded', () => {

        const audioVisualizerWrapper = document.querySelector('.audio-visualizer-wrapper');
        const audioVisualizerContainer = document.querySelector('.audio-visualizer-container');
        const audioProcessingContainer = document.querySelector('.audio-processing-container');
        const micAudioRecordingIcon = document.getElementById('micAudioRecordingIcon');
        const userQuestionTextBox = '#userQuestionTextBox';

        function toggleVisualizerWrapper(shouldTrunOn) {

            if (shouldTrunOn) {
                audioVisualizerWrapper.style.display = "flex";
                audioVisualizerContainer.style.display = 'flex';
                audioProcessingContainer.style.display = 'flex';
            } else {
                audioVisualizerWrapper.style.display = "none";
                audioVisualizerContainer.style.display = 'none';
                audioProcessingContainer.style.display = 'none';
            }

        }

        const canvas = document.getElementById('visualizer');
        const numberOfBars = 100; // Adjust the number of bars as needed

        /*const timer = document.getElementById('timer');*/

        function showAnimation() {

            for (let i = 0; i < numberOfBars; i++) {
                const bar = document.createElement('div');
                bar.classList.add('bar');

                // Generate random animation delay and scale factor
                const randomDelay = Math.random() * 1; // Random delay between 0 and 1 seconds
                const randomScale = Math.random() * 2 + 1; // Random scale factor between 1 and 3

                bar.style.animationDelay = `${randomDelay}s`;
                bar.style.setProperty('--scale-factor', randomScale);

                audioProcessingContainer.appendChild(bar);
            }

            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.animationPlayState = 'running';
            });

            //audioVisualizerWrapper.style.display = "flex";
            //audioVisualizerContainer.style.display = 'flex';
            //audioProcessingContainer.style.display = 'flex';
            toggleVisualizerWrapper(true);
            //document.querySelector(".meg-input").style.display = "none";
        }

        function hideAnimation() {
            //audioVisualizerWrapper.style.display = "none";
            //audioVisualizerContainer.style.display = 'none';
            //audioProcessingContainer.style.display = 'none';
            toggleVisualizerWrapper(false);
            $('.audio-processing-container').empty();
            //document.querySelector(".meg-input").style.display = "block";
            //console.log('hideAnimation: ', document.querySelector(".meg-input").style.display);
        }

        function resizeCanvas() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        let audioCtx, analyser, dataArray, bufferLength, animationId;

        // Initialize the audio visualizer
        function startVisualizer(stream) {
            $('.sendtext').hide();
            console.log('called from startVisualizer with false');
            showHideMessagePlaceholder(false);
            try {
                audioVisualizerWrapper.style.display = "flex";
                audioVisualizerContainer.style.display = 'flex';
                micAudioRecordingIcon.style.display = 'flex';
                const canvasCtx = canvas.getContext('2d');

                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();

                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtx.createMediaStreamSource(stream);
                analyser = audioCtx.createAnalyser();

                analyser.fftSize = 256;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                source.connect(analyser);

                /*draw(canvas, canvasCtx);*/
                stopVisualizer = drawBars(0, canvas, dataArray, null, bufferLength, 1.5, 60, false);
            } catch (e) {
                console.log('draw error: ', e);
                $('.sendtext').show();
                console.log('called from startVisualizer with true');
                showHideMessagePlaceholder(true);
            }

        }

        function drawBars(
            timestamp,
            canvas,
            dataArray,
            targetArray,
            bufferLength,
            barWidth,
            fps,
            isAuto
        ) {
            const canvasCtx = canvas.getContext('2d');
            let lastTime = 0;
            const interval = 1000 / fps;
            let animationId;

            function interpolate(current, target, factor) {
                return current + (target - current) * factor; // Corrected the interpolation logic
            }

            function draw(timestamp) {
                animationId = requestAnimationFrame(draw);

                const deltaTime = timestamp - lastTime;

                if (deltaTime > interval) {
                    lastTime = timestamp - (deltaTime % interval);

                    if (isAuto && targetArray) {
                        // Generate random data to simulate audio frequency data
                        for (let i = 0; i < bufferLength; i++) {
                            targetArray[i] = Math.random() * 255;
                        }
                    }

                    if (targetArray) {
                        // Interpolate between current data and target data
                        for (let i = 0; i < bufferLength; i++) {
                            dataArray[i] = interpolate(dataArray[i], targetArray[i], 0.1);
                        }
                    } else {
                        analyser.getByteFrequencyData(dataArray); // Get real frequency data
                    }
                }

                // Clear the canvas to make the background transparent
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = (dataArray[i] / 255) * canvas.height;

                    // Change bar colors here
                    canvasCtx.fillStyle = 'rgb(25, 135, 84)';

                    // Draw upward bars
                    canvasCtx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight / 2);

                    // Draw downward bars
                    canvasCtx.fillRect(x, canvas.height / 2, barWidth, barHeight / 2);

                    x += barWidth + 1; // Space between bars
                }
            }

            draw(timestamp);
            return () => cancelAnimationFrame(animationId);
        }

        // Stop the visualizer
        function stopVisualizer() {

            $('.sendtext').show();
            console.log('called from stopVisualizer with true');
            showHideMessagePlaceholder(true);

            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            if (audioCtx) {
                audioCtx.close();
            }

            // Remove event listeners
            window.removeEventListener('resize', resizeCanvas);

            // Hide the canvas
            audioVisualizerWrapper.style.display = 'none';
            audioVisualizerContainer.style.display = 'none';
            micAudioRecordingIcon.style.display = 'none';
        }

        function startAutoVisualizer() {

            $('.sendtext').hide();
            console.log('called from startAutoVisualizer with false');
            showHideMessagePlaceholder(false);

            audioVisualizerWrapper.style.display = "flex";
            audioVisualizerContainer.style.display = 'flex';
            const canvasCtx = canvas.getContext('2d');

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            const barWidth = 1.5; // Width of each bar
            const barSpacing = 0.5; // Space between each bar
            const totalBarWidth = barWidth + barSpacing;
            const barsCount = Math.floor(canvas.width / totalBarWidth);
            const bufferLength = barsCount; // Adjust bufferLength to match barsCount

            const dataArray = new Uint8Array(bufferLength);
            const targetArray = new Uint8Array(bufferLength);

            let lastTime = 0;
            const fps = 30; // Frames per second, adjust this value to control speed
            const interval = 1000 / fps;

            stopAutoVisualizer = drawBars(0, canvas, dataArray, targetArray, bufferLength, barWidth, fps, true);
        }

        function stopAutoVisualizer() {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            audioVisualizerWrapper.style.display = 'none';
            audioVisualizerContainer.style.display = 'none';

            $('.sendtext').show();
            console.log('called from stopAutoVisualizer with true');
            showHideMessagePlaceholder(true);
        }

        function showHideMessagePlaceholder(shouldShow) {

            if (shouldShow) {
                //$(userQuestionTextBox).val('');
                //$(userQuestionTextBox).attr('placeholder', '');
                // Hide placeholder temporarily, keep value as it is

                $(userQuestionTextBox).attr('placeholder', $(userQuestionTextBox).attr('data-text'));

            } else {
                //$(userQuestionTextBox).val('');
                //$(userQuestionTextBox).attr('placeholder', currentLanguageInfo.translations.messages.ask_ur_question);
                $(userQuestionTextBox).attr('data-text', $(userQuestionTextBox).attr('placeholder'));
                $(userQuestionTextBox).removeAttr('placeholder');
            }

            console.log('shouldShow', shouldShow);
        }

        // Expose functions to the global scope for easy access
        window.startVisualizer = startVisualizer;
        window.stopVisualizer = stopVisualizer;

        // Expose functions to the window object
        window.audioVisualizer = {
            showAnimation,
            hideAnimation,
            startVisualizer,
            stopVisualizer,
            startAutoVisualizer,
            stopAutoVisualizer
        };

        console.log('audio-visualizer.js loaded', window.audioVisualizer);
    });

})();