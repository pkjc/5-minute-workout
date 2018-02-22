$(function() {
    var audio = new Audio('./assets/audio/done.mp3');
    //Global object to create variables available only throughout the code but not globally
    const globalVars = {
        observer: "",
        dataSrcUrl: "exercises1.json",
        utterance: ""
    };

    var full = [];
    var upper = [];
    var lower = [];
    var core = [];
    var plank = [];
    var randomExercises = [];

    if ('speechSynthesis' in window) {
        globalVars.utterance = new SpeechSynthesisUtterance();
        var voices = window.speechSynthesis.getVoices();
        globalVars.utterance.voice = voices[17];
        globalVars.utterance.rate = 1;
        globalVars.utterance.pitch = 1.23;
    } else {
        alert("Speech feature not supported. Please use the latest version of Google Chrome.");
    }


    /* Function Calls */
    setup();
    attachEventHandlers();

    /* Function Definitions */
    function setup() {
        //Load Exercises template
        $("#exTemplate").load("exercisesPartial.html");
        //Bring data from given source URL
        $.getJSON(globalVars.dataSrcUrl, {}).done(function(dataFromJsonFile) {
            populateExercisesOnScreen1(dataFromJsonFile);
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

    function populateExercisesOnScreen1(dataFromJsonFile) {
        var randExArr = prepArrayOfRandomEx1(dataFromJsonFile);
        $.each(randExArr, function(index, val) {
            index++;
            var cache = $('#exercise' + index + 'Time');
            $('#exercise' + index + 'Time').parent().text((index) + ". " + val.exName).append(cache);
            $('#ex' + index + ' ' + 'img').attr('src', val.exInstructionsImgUrl);
        });
    }

    function prepArrayOfRandomEx1(dataFromJsonFile) {
        dataFromJsonFile.exercises.forEach(function(obj, ind) {
            switch (obj.exType) {
                case "fullBody":
                    full.push(obj);
                    break;
                case "upper":
                    upper.push(obj);
                    break;
                case "lower":
                    lower.push(obj);
                    break;
                case "core":
                    core.push(obj);
                    break;
                case "plank":
                    plank.push(obj);
                    break;
                default:
                    console.log("NONE");
            }
        });

        return getRandomEx1();
    }

    function getRandomEx1() {
        randomExercises.push(full[Math.floor(Math.random() * full.length)]);
        randomExercises.push(upper[Math.floor(Math.random() * upper.length)]);
        randomExercises.push(lower[Math.floor(Math.random() * lower.length)]);
        randomExercises.push(core[Math.floor(Math.random() * core.length)]);
        randomExercises.push(plank[Math.floor(Math.random() * plank.length)]);

        return randomExercises;
    }

    function startWorkout() {
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
        $('#ex' + (exCount - 1)).closest('.collapse').collapse('hide');
        $('#ex' + exCount).closest('.collapse').collapse();
        if (exCount <= 5) {
            globalVars.utterance.text = "Do the exercise, " + currExName;
            setTimeout(function() {
                speechSynthesis.speak(globalVars.utterance);
            }, 500);
            $('#exercise' + exCount + 'Time').timer({
                duration: '1m',
                format: '%M:%S',
                callback: function() {
                    audio.play();
                    console.log("exercise #" + exCount + " done!");
                    startExercise(++exCount);
                }
            });
            animateProgressBar(exCount);
        } else {
            stopWorkoutCleanUp();
        }
    }

    function stopWorkoutCleanUp() {
        globalVars.utterance.text = "Congratulations! Your workout is complete! YOU, Are, Awesome!";
        speechSynthesis.speak(globalVars.utterance);
        $('#fmw-timer').timer('remove');
        $('#exercise').timer('remove');
        $('#playWorkout').find('.material-icons').html("play_arrow");
        $('#current-ex').prev().text('Awesome! The workout is complete.');
        globalVars.observer.disconnect();
    }

    function populateCurrentExercise(exCount) {
        var x = $('#exercise' + exCount + 'Time').parent().text();
        var currExName = x.slice(2, x.indexOf('0'));
        $('#current-ex').text(currExName);
        $('#current-ex').prev().text('Now');
        return currExName;
    }

    function animateProgressBar(exCount) {
        var intervalCount = 1;
        var finalCntDwn = 3;
        var pollInterval = setInterval(function() {
            if ($('#exercise' + exCount + 'Time').data('seconds') == 29) {
                globalVars.utterance.text = "30 seconds to go!";
                speechSynthesis.speak(globalVars.utterance);
            } else if ($('#exercise' + exCount + 'Time').data('seconds') >= 57 && $('#exercise' + exCount + 'Time').data('seconds') < 60) {
                globalVars.utterance.text = finalCntDwn;
                speechSynthesis.speak(globalVars.utterance);
                finalCntDwn--;
            }
            if (intervalCount < 60 && $('#exercise' + exCount + 'Time').data('seconds') != null) {
                if ($('#exercise' + exCount + 'Time').data('state') == 'paused') {
                    return;
                }
                intervalCount++;
                $('#exercise' + exCount).css('width', (intervalCount * 100 / 60) + '%');
            } else {
                clearInterval(pollInterval);
            }
        }, 1000);

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
                pauseOrResumeExTimers('paused', 'resume');
            } else {
                startWorkout();
            }
            $('#playWorkout').find('.material-icons').html("pause");
        } else {
            if ($('#fmw-timer').data() && $('#fmw-timer').data('state') == 'running') {
                $('#fmw-timer').timer('pause');
                pauseOrResumeExTimers('running', 'pause');
            }
            $('#playWorkout').find('.material-icons').html("play_arrow");
        }
    }

    function pauseOrResumeExTimers(state, action) {
        //Pause/Resume exercise timers
        for (var i = 0; i <= 5; i++) {
            if ($('#exercise' + i + 'Time').data() && $('#exercise' + i + 'Time').data('state') == state) {
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
            $('#exercise' + i).css('width', '0%');
        }
        globalVars.observer.disconnect();
        $('#playWorkout').find('.material-icons').html("play_arrow");
    }
});