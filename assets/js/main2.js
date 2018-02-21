$(function() {
    var full = [];
    var upper = [];
    var lower = [];
    var core = [];
    var plank = [];
    var randomExercises = [];
    $.getJSON("exercises1.json", {}).done(function(dataFromJsonFile) {
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

        randomExercises.push(full[Math.floor(Math.random() * full.length)]);
        randomExercises.push(upper[Math.floor(Math.random() * upper.length)]);
        randomExercises.push(lower[Math.floor(Math.random() * lower.length)]);
        randomExercises.push(core[Math.floor(Math.random() * core.length)]);
        randomExercises.push(plank[Math.floor(Math.random() * plank.length)]);

        randomExercises.forEach(function(obj) {
            console.log(obj.exName);
            console.log(obj.exType);
            console.log(obj.exInstructionsImgUrl);
        });

    });
});