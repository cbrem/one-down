function startGame(){
    console.log('starting game with src data:', SpriteImage.sourcesData);
    var game = new Game();
    game.run();
}


function runPreloader(){
    preloadImages(startGame);
}

/** preloadImages: (callback function:(no params))

 grabs the source image data stored in the SpriteImage class and preloads the
 indicated images by creating new Images and storing them back in the sourcedata
 
 params: 
    loadedCallback       the function to call once al images are preloaded
**/
function preloadImages(loadedCallback){
    var srcData = SpriteImage.sourcesData;
    
    // the human readable nicknames of the images we will be preloading
    var imageNames = srcData["nicknames"];
    var totalToPreload = imageNames.length;
    console.log(totalToPreload);
    var numLoadedSoFar = 0;
    
    var imgObj, imgNickname;
    
    for (var i = 0; i < imageNames.length; i++){
        imgNickname = imageNames[i];
        assert(srcData[imgNickname] !== undefined, 
               "invalid nickname '" + imgNickname + "' in preloader, "+
               "check that your nicknames is in the source data's keys");
        assert(srcData[imgNickname].srcPath !== undefined, 
               "srcPath not set for" + imgNickname);
               
        imgObj = new Image();
        imgObj.onload = function(){
            numLoadedSoFar++;
            console.log(this, imgNickname);
            // if all images are loaded, call the callback
            if(numLoadedSoFar >= totalToPreload){
                // make sure every source has a stored Image object
                imageNames.forEach(function(imgName){
                    assert(srcData[imgName]["imgObj"] !== undefined, 
                           "preloader problem, missing Image object for "+
                           imgName
                           );
                });
                
                loadedCallback();
            }
        }
        imgObj.src = srcData[imgNickname].srcPath;
        
        // save the Image object back in the srcData to avoid having 
        // to repeatedly construct Images when creating SpriteImages
        // will be loaded when the loadedCallback finally fires
        srcData[imgNickname]["imgObj"] = imgObj;
    }
}

//the main Game object.
//the method is Game.run, which starts the game.
function Game() {
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
        console.log('running game');
        //instanciate all libraries,
        //which will stay constant throughout this instance of the run method
        
        //collisions = new Collisions();
        //environment = new Environment();
        
        //initialize canvas and context
        canvas = document.getElementById("gamecanvas");
        ctx = canvas.getContext("2d");

        var testSprite = new SpriteImage('ninjatuna');
        var testSprite2 = new SpriteImage('chik2');
        testSprite.drawTo(ctx, 50, 50, 100, 150);
        testSprite2.drawTo(ctx, 150, 50, 150, 50);
        
        //initialize event handlers
        canvas.addEventListener("mousedown", onMouseDown, true);
        canvas.addEventListener("keydown", onKeyDown, true);

        //the inital call to timer, which will run continuously to update
        //the model and view
        timer();
    };
}