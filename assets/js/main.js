//Global object to create variables available only throughout the code but not globally
const globalVars = {
    audio: new Audio('./assets/audio/done.mp3'),
    observer: "",
    dataSrcUrl: "exercises.json"
};

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
        exIndex = 0,
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
    globalVars.audio.play();
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
    console.log(exCount);
    if (exCount <= 5) {
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
        alert("Workout complete!");
        $('#fmw-timer').timer('remove');
        $('#exercise').timer('remove');
        globalVars.observer.disconnect();
    }
}

function animateProgressBar(exCount) {
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
                    $('#exercise' + exCount).css('width', (progBarPerc * 100 / 120) + '%')
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
    if ($('#fmw-timer').data() && $('#fmw-timer').data('state') == 'running'){
        $("#fmw-timer").timer('remove');
    }
    //Stop exercise timers
    for (var i = 0; i <= 5; i++) {
        if ($('#exercise' + i + 'Time').data() && $('#exercise' + i + 'Time').data('state')=='running') {
            //$('#exercise' + i + 'Time').timer('reset');
            $('#exercise' + i + 'Time').timer('remove');
        }
    }
    globalVars.observer.disconnect();
    $('#playWorkout').find('.material-icons').html("play_arrow");
}
