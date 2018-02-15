var audio = new Audio('./assets/audio/done.mp3');

function startNextExercise(prevExercise){
    if(prevExercise.match(/\d+/)[0] < 5){
        audio.play();
        console.log('completed excercise : ' + prevExercise);
        var exerciseNumber = prevExercise.match(/\d+/)[0];
        console.log('starting excercise : ' + '#excercise'+(parseInt(exerciseNumber)+1));
        exerciseTimer('#exercise'+(parseInt(exerciseNumber)+1));
    }else{
        console.log('Workout complete!');
        audio.play();
    }
}
function startWorkoutTimer(){
    var seconds = 0;
    var minutes = 0;
    function displayWorkoutTime(){
        seconds++;
        if(minutes==5){
            clearInterval(workoutTimeInterval);
            return;
        }
        if(seconds<=60){
            if(seconds==60 && minutes<5){
                seconds=0;
                minutes++;
            }
            $('#fmw-timer').html(displayTime(minutes, seconds));
        }
    }
    var workoutTimeInterval = setInterval(function() {
        displayWorkoutTime();
    }, 1000);
}
function displayTime(minutes,seconds){
    if(seconds < 10){
        return '0'+minutes+':'+'0'+seconds;
    }else {
        return '0'+minutes+':'+seconds;
    }
}

function startWorkout(){
    console.log('starting workout...');
    audio.play();
    startWorkoutTimer();
    exerciseTimer('#exercise1');
}

function calcElapsedTime(i){
    var elapsedTime;
    if(Math.trunc(i / (20 / 6))<10){
        elapsedTime = '0' + Math.trunc(i / (20 / 6));
    }else{
        elapsedTime = Math.trunc(i / (20 / 6));
    }
    return elapsedTime;
}

function exerciseTimer(currExercise){
    console.log('exerciseTimer : ' + currExercise);
    var progressBarPercent = 0;
    function animateProgressBar(currExercise) {
        console.log('animateProgressBar : ' + currExercise);
        progressBarPercent++;
        if (progressBarPercent <= 200) {
            $(currExercise).css('width', progressBarPercent / 2 + '%');
            $(currExercise+'Time').html('00:' + calcElapsedTime(progressBarPercent));
        } else {
            clearInterval(exerciseTimerInterval);
            startNextExercise(currExercise);
        }
    }
    var exerciseTimerInterval = setInterval(function() {
        animateProgressBar(currExercise);
    }, 300);
}

$( "#playWorkout" ).click(startWorkout);

$( "#stopWorkout" ).click(function(){
    location.reload();
});
