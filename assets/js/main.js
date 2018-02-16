$(function(){
    //Global object to create variables available only throughout the code but not globally
    const globalVars = {
        audio: new Audio('./assets/audio/done.mp3'),
        observer: "",
        dataSrcUrl: "exercises.json",
        utterance: ""
    };

    if ('speechSynthesis' in window){
        var text = "Welcome, to the five minute workout, app. Click 'Play' to start the workout";
        globalVars.utterance = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        globalVars.utterance.voice = voices[17];
        globalVars.utterance.rate = 1;
        globalVars.utterance.pitch = 1.2;
        globalVars.utterance.text = text;
        speechSynthesis.speak(globalVars.utterance);
    }else{
        alert("Speech feature not supported. Please use the latest version of Google Chrome.");
    }


    //Function Calls
    //Program starts from setup(). Workout starts when 'Play' btn is clicked.
    setup();
    //attach event handlers to buttons
    attachEventHandlers();

    //Function Definitions
    //Program starts from setup(). Workout starts when 'Play' btn is clicked.
    function setup() {
        //Load Exercises template
        $("#exTemplate").load("exercisesPartial.html");
        //Bring data from given source URL
        $.getJSON(globalVars.dataSrcUrl, {}).done(function(dataFromJsonFile) {
            populateExercisesOnScreen(dataFromJsonFile);
        });
        //Remove :focus from clicked button
        $(".btn").mouseup(function() {
            $(this).blur();
        });
    }

    function attachEventHandlers() {
        $('#playWorkout').click(playAndPauseBtnHandler);
        $("#stopWorkout").click(stopBtnHandler);
    }

    function populateExercisesOnScreen(dataFromJsonFile) {
        var randExArr = prepArrayOfRandomEx(dataFromJsonFile);
        $.each(randExArr, function(index, val) {
            var cache = $('#exercise'+index+'Time');
            $('#exercise'+index+'Time').parent().text((index) + ". " + val).append(cache);
        });
    }

    function prepArrayOfRandomEx(dataFromJsonFile){
        var exList = dataFromJsonFile,
        exIndex = 1,
        exArr = [];

        for (var ex in exList) {
            if (exList.hasOwnProperty(ex)) {
                exArr[exIndex] = getRandomEx(ex, exList, exIndex);
                exIndex++;
            }
        }
        return exArr;
    }

    function getRandomEx(exName, exList, exIndex) {
        var randomExNum = Math.floor(Math.random() * exList[exName].length);
        return exList[exName][randomExNum];
    }

    function startWorkout() {
        //globalVars.audio.play();
        $('#fmw-timer').timer({
            countdown: true,
            duration: '5m',
            format: '%M:%S',
            callback: function() {}
        });
        var exCount = 1;
        startExercise(exCount);
    }

    function startExercise(exCount) {
        var currExName = populateCurrentExercise(exCount);
        // var utterance = new SpeechSynthesisUtterance();
        // var voices = window.speechSynthesis.getVoices();
        // console.log(window.speechSynthesis);
        // $.each(voices, function(index, val) {
        //     console.log(index + val);
        // });
        //window.speechSynthesis.speak(utterance);

        // var voices = window.speechSynthesis.getVoices();
        // var idx = 0;
        // function playVoice() {
        //     var say = 'Hi! My name is ' + voices[idx].name;
        //     console.log('[' + idx + ']' + say);
        //     var msg = new window.SpeechSynthesisUtterance(say);
        //     msg.voice = voices[idx];
        //     window.speechSynthesis.speak(msg);
        //     var notFound = true;
        //     idx++;
        //     while ((notFound) && (idx < voices.length)) {
        //         if (voices[idx].lang === 'en-US') {
        //             setTimeout(function() { playVoice(); }, 2000);
        //             notFound = false;
        //         } else {
        //             idx++;
        //         }
        //     }
        // }
        // playVoice();

        if (exCount <= 5) {
            globalVars.utterance.text = "Do the exercise, " + currExName;
            setTimeout(function(){
                speechSynthesis.speak(globalVars.utterance);
            },1000);
            $('#exercise' + exCount + 'Time').timer({
                duration: '1m',
                format: '%M:%S',
                callback: function() {
                    console.log("exercise #" + exCount + " done!");
                    globalVars.audio.play();
                    startExercise(++exCount);
                }
            });
            animateProgressBar(exCount);
        } else {
            globalVars.utterance.text = "Congratulations! Your workout is complete! YOU, Are, Awesome!";
            speechSynthesis.speak(globalVars.utterance);
            $('#fmw-timer').timer('remove');
            $('#exercise').timer('remove');
            $('#playWorkout').find('.material-icons').html("play_arrow");
            $('#current-ex').prev().text('Awesome! The workout is complete.');
            globalVars.observer.disconnect();
        }
    }

    function populateCurrentExercise(exCount){
        var x = $('#exercise' + exCount + 'Time').parent().text();
        var currExName = x.slice(2,x.indexOf('0'));
        $('#current-ex').text(currExName);
        $('#current-ex').prev().text('Now');
        return currExName;
    }

    function animateProgressBar(exCount) {
        var intervalCount = 1;

        var pollInterval = setInterval(function(){
            if(intervalCount<60 && $('#exercise' + exCount + 'Time').data('seconds') != null){
                if($('#exercise' + exCount + 'Time').data('state') == 'paused'){
                    return;
                }
                intervalCount++;
                $('#exercise' + exCount).css('width', (intervalCount * 100 / 60) + '%');
            }else{
                clearInterval(pollInterval);
            }
        },1000);

        // Select the node that will be observed for mutations
        var targetNode = document.getElementById('exercise' + exCount + 'Time');
        // Options for the observer (which mutations to observe)
        var config = {
            childList: true
        };
        var progBarPerc = 0;
        // Callback function to execute when mutations are observed
        var callback = function(mutationsList) {
            for (var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        progBarPerc++;
                        //$('#exercise' + exCount).css('width', (progBarPerc * 100 / 120) + '%');
                    }
                }
            }
        };
        // Create an observer instance linked to the callback function
        globalVars.observer = new MutationObserver(callback);
        // Start observing the target node for configured mutations
        globalVars.observer.observe(targetNode, config);
    }

    function playAndPauseBtnHandler() {
        if ($('#playWorkout').find('.material-icons').html() == "play_arrow") {
            if ($('#fmw-timer').data() && $('#fmw-timer').data('state') == 'paused') {
                $('#fmw-timer').timer('resume');
                pauseOrResumeExTimers('paused','resume');
            } else {
                startWorkout();
            }
            $('#playWorkout').find('.material-icons').html("pause");
        } else {
            if ($('#fmw-timer').data() && $('#fmw-timer').data('state') == 'running') {
                $('#fmw-timer').timer('pause');
                pauseOrResumeExTimers('running','pause');
            }
            $('#playWorkout').find('.material-icons').html("play_arrow");
        }
    }

    function pauseOrResumeExTimers(state, action){
        //Pause/Resume exercise timers
        for (var i = 0; i <= 5; i++) {
            if ($('#exercise' + i + 'Time').data() && $('#exercise' + i + 'Time').data('state')==state) {
                $('#exercise' + i + 'Time').timer(action);
            }
        }
    }

    function stopBtnHandler() {
        //$("#fmw-timer").timer('reset');
        //Stop the workout timer
        $("#fmw-timer").timer('reset');
        $("#fmw-timer").timer('remove');
        //Stop exercise timers
        for (var i = 0; i <= 5; i++) {
            $('#exercise' + i + 'Time').timer('reset');
            $('#exercise' + i + 'Time').timer('remove');
            $('#exercise' + i).css('width','0%');
        }
        globalVars.observer.disconnect();
        $('#playWorkout').find('.material-icons').html("play_arrow");
    }
});
