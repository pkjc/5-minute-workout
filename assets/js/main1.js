$("#exTemplate").load("exercisesPartial.html");

var dataSrcUrl = "exercises.json";
$.getJSON(dataSrcUrl, {}).done(function(dataFromJsonFile) {
    var randomExNum,randomEx,exList=dataFromJsonFile,exIndex=0;
    var exArr=[];
    for (var ex in exList) {
        if (exList.hasOwnProperty(ex)) {
            exArr[exIndex]=getRandomEx(ex,exList,exIndex);
            exIndex++;
        }
    }
    var k=1;
    $.each(exArr,function(i,val){
        var cache = $('.list-group-item:nth-child('+k+')').children();
        $('.list-group-item:nth-child('+k+')').text((++i)+". "+val).append(cache);
        k+=2;
    });
});
function getRandomEx(exName,exList,exIndex){
    randomExNum = Math.floor(Math.random() * exList[exName].length);
    return exList[exName][randomExNum];
}

//Start Workout
$('#playWorkout').click(function(){
    if($('#playWorkout').find('.material-icons').html()=="play_arrow"){
        $('#playWorkout').find('.material-icons').html("pause");
        startWorkout();
    }else{
        pauseWorkout();
    }
});
function startWorkout(){
    if($('#fmw-timer').data() && $('#fmw-timer').data('state')=='paused'){
        $('#fmw-timer').timer('resume');
    }else{
        $('#fmw-timer').timer({
            countdown: true,
            duration: '5m',
            format: '%M:%S',
            callback: function() {}
        });
        var exCount = 1;
        startExercise(exCount);
    }
}
function pauseWorkout(){
    $("#fmw-timer").timer('pause');
    $('#playWorkout').find('.material-icons').html("play_arrow");
}
function startExercise(exCount){
    console.log(exCount);
    if(exCount<=5){
        $('#exercise'+exCount+'Time').timer({
            duration:'1m',
            format: '%M:%S',
            callback: function() {
                console.log("exercise #"+ exCount + " done!");
                startExercise(++exCount);
            }
        });
        animateProgressBar(exCount);
    }else{
        alert("Workout complete!");
        $('#exercise').timer('remove');
    }
}
function animateProgressBar(exCount){
    // Select the node that will be observed for mutations
    var targetNode = document.getElementById('exercise'+exCount+'Time');
    // Options for the observer (which mutations to observe)
    var config = { childList: true };
    var pbp = 0;
    // Callback function to execute when mutations are observed
    var callback = function(mutationsList) {
        for(var mutation of mutationsList) {
            if (mutation.type == 'childList') {
                for (var i = 0; i < mutation.addedNodes.length; i++) {
                    pbp++;
                    $('#exercise'+exCount).css('width', (pbp*100/120) + '%')
                }
            }
        }
    };
    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
}
$("#stopWorkout").click(function(){
    $("#fmw-timer").timer('reset');
    $("#fmw-timer").timer('remove');
    $('#playWorkout').find('.material-icons').html("play_arrow");
});
$(".btn").mouseup(function(){
    $(this).blur();
});
