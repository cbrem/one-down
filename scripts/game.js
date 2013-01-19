//the main Game object.
//the method is Game.run, which starts the game.
function Game () {
    var environment,
        player,
        canvas,
        ctx;
        //add more objects here

    var updateModel() = function () {
        player.update();
    };

    var updateView() = function () {
        environment.draw();
        player.draw();
    };

    var cycleLength = 10; //length of a timer cycle
    var timer = function () {
        updateModel();
        updateView();
        setTimeout(timer, cycleLength);
    };
    
    var onMouseDown = function (e) {
        //react to mouse
        var canvX, canvY;
        canvX = e.pageX - canvas.offsetLeft;
        canvY = e.pageY - canvas.offsetTop;
        alert("You clicked on the canvas at (" + canvX + ", " + canvY + ").");
    };

    var onKeyDown = function (e) {
        //react to key
        alert("Keycode of the pressed key is " + e.keyCode);
    };

    this.run = function () {
        //instanciate all libraries,
        //which will stay constant throughout this instance of the run method
        player = new Player();
        collisions = new Collisions();
        environment = new Environment();

        //initialize canvas and context
        canvas = document.getElementById("myCanvas");
        ctx = canvas.getContext("2d");

        //initialize event handlers
        canvas.addEventListener("mousedown", onMouseDown, true);
        canvas.addEventListener("keydown", onKeyDown, true);

        //the inital call to timer, which will run continuously to update
        //the model and view
        timer();
    };
}
