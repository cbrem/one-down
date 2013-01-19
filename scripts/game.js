function startGame(spriteImageData){
    var game = new Game(spriteImageData);
    game.run();
}

// magic preloading junk, will comment later
function runPreloader(){
    preloadImages();
}

function preloadImages(){
    var sources = ["assets/images/chik2.png"];
    var numLoaded = 0;
    // a dictionary consisting of image paths mapped to the SpriteImage objects 
    // they correspond to
    var spriteImageData = {};
    var img;
    
    for (var i = 0; i < sources.length; i++){
        img = new Image();
        img.onload = function(){
            var totalImages = sources.length;
            var loadedImg = this;
            var srcPath = loadedImg.src;
            var imageName = srcPath.slice(srcPath.lastIndexOf('/') + 1);
            numLoaded ++;
                        
            console.log(imageName);
            spriteImageData[imageName] = new SpriteImage(loadedImg);
            // if all images are loaded, start the game
            if(numLoaded === totalImages){
                startGame(spriteImageData);
            }
        }
        img.src = sources[i];
    }
}

//the main Game object.
//the method is Game.run, which starts the game.
function Game(spriteImageData) {
    this.spriteImageData = spriteImageData;
    var environment,
        player,
        collisions,
        canvas,
        ctx,
        clicks,
        presses;
        //add more objects here

    var updateModel = function () {
        player.update(clicks, presses); //synchronously send updates to player
        clicks = [], presses = [];      //clear clicks and presses
        //collisions.collide();
    };

    var updateView = function () {
       // environment.draw(ctx);
        player.draw(ctx);
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

        clicks.push(e);
    };

    var onKeyDown = function (e) {
        //react to key
        alert("Keycode of the pressed key is " + e.keyCode);

        presses.push(e);
    };

    this.run = function () {
        console.log('running game:');
        console.log('loaded SpriteImages:', this.spriteImageData);
        //instanciate all libraries,
        //which will stay constant throughout this instance of the run method
        
        player = new Sprite(10,10,50,50, this.spriteImageData['chik2.png']);
        //collisions = new Collisions();
        //environment = new Environment();

        
        
        //initialize canvas and context
        canvas = document.getElementById("gamecanvas");
        ctx = canvas.getContext("2d");

        //initialize event handlers
        canvas.addEventListener("mousedown", onMouseDown, true);
        canvas.addEventListener("keydown", onKeyDown, true);

        //the inital call to timer, which will run continuously to update
        //the model and view
        timer();
    };
}