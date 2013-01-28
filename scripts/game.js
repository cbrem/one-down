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
            console.log("loaded", this);
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
        // will be fully loaded by the time the loadedCallback finally fires
        srcData[imgNickname]["imgObj"] = imgObj;
    }
}

//the main Game object.
//the method is Game.run, which starts the game.
function Game() {
    var self = this;

    var _gameFps = 30;
    var environment,
        player,
        collisions,
        canvas,
        ctx,
        clicks,
        heldKeys;
        //add more objects here
    var pauseSprite;

    this.width;
    this.height;
    this.worldX;
    this.worldY;
    this.speed;
    this.gamePaused;
    this.gameOver;
    this.time;
    this.transitionDrop;
    this.transitionLand;
    this.nextTransition;
    this.falling;
    // set of directions to kill the player in if they are offscreen there
    this.deadZoneDirs;

    var updateModel = function () {
        //clear clicks, but don't clear the held keys
        clicks = [];

        // update player, environment, and collisions!
        if(!(self.gamePaused) && !(self.gameOver)){
            player.update(self, clicks, heldKeys); 
            environment.update(self);
            collisions.collide(player,environment.spritesOnScreen,self); 
        }
        else{ 
            pauseSprite.nextFrame();
        }

        // for timing and score
        if ((!self.gameOver) && (!self.gamePaused)) {
            self.time++;
        }
        console.log(self.nextTransition);
        // activate TRANSITION
        if (self.time > self.nextTransition) {
            // activate GAP (if X direction is moving, make drop)
            if (self.scrollX !== 0){
                console.log("GAP TRANSISTION at ", self.time);
                self.transitionDrop = true;
                // this gets overridden when they fall
                // and is a safety in case they don't
                self.nextTransition += 300;
            }
            // activate STOP FALLING
            else {
                console.log("STOP FALLING TRANSISTION at ", self.time);
                self.transitionLand = true;
                self.nextTransition = self.time + 300;
                //self.falling = false;
                environment.init(self, self.height);
            }
        }
        // activate FALLING
        if ((!self.falling) && (player.y > 445)) {
            console.log("FALLING NOW!");
            self.falling = true;
            self.scrollX = 0;
            self.scrollY = -10;
            self.nextTransition = self.time + 100;
        }
    };

    
    // split this type of drawing into a HUD object or something
    var _drawPauseScreen = function(){
        ctx.save();
        ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = 'bold 60px "Lucida Console", Monaco, monospace';
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        
        var pauseMetrics = pauseSprite.getCurrFrameMetrics();
        var text = "Paused";
        var textX = (canvas.width - pauseMetrics.width)/2;
        var textY = canvas.height/2;
        ctx.fillText("Paused", textX, textY);
        ctx.strokeText("Paused", textX, textY);
        ctx.restore();
        
        pauseSprite.drawTo(ctx, textX + pauseMetrics.width + 30, textY - pauseMetrics.height/2); 
    };
    
    var _drawGameOverScreen = function(){
        ctx.save();
        ctx.fillStyle = "rgba(50, 50, 50, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 95px Arial, Monaco, monospace';
        ctx.textAlign = "center";
        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2-50);

        ctx.font = 'bold 45px Arial, Monaco, monospace';
        ctx.fillStyle = "white";
        ctx.fillText("Press R to Restart", canvas.width/2, canvas.height/2+50);

        ctx.restore();
    };

    // draws bar for high score
    var _drawTopBar = function() {
        // make black high score bar on top
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,30);

        // write the score
        ctx.font = 'bold 20px Arial, Monaco, monospace';
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.fillText("SCORE ", canvas.width*2/3, 22);
        ctx.textAlign = "right";
        ctx.fillText(String(self.time), canvas.width-5, 22);
    };

    var updateView = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        // draw blue background
        ctx.fillStyle = "#9eb3ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        environment.draw(ctx,self);
        player.draw(ctx);
        _drawTopBar();
        
        if(self.gamePaused){
            _drawPauseScreen();
        }
        else if (self.gameOver){
            _drawGameOverScreen();
        }
    };

    var cycleLength = Math.max(1, Math.round(1000/_gameFps)); //length of a timer cycle
    var timer = function (){
        updateModel();
        updateView();
        setTimeout(timer, cycleLength);
    };
    
    var onMouseDown = function (e) {
        //react to mouse
        var canvX, canvY;
        canvX = e.pageX - canvas.offsetLeft;
        canvY = e.pageY - canvas.offsetTop;
        //alert("You clicked on the canvas at (" + canvX + ", " + canvY + ").");

        clicks.push(e);
    };

    var onKeyDown = function (e) {
        //react to key
        var keyCode = util_getKeyCode(e);
        //alert("Keycode of the pressed key is " + keyCode);
        
        // prevent webpage from moving while moving player
        if(util_isPageMoveKeyCode(keyCode)){
            e.preventDefault();
        }
        
        heldKeys[keyCode] = true;
        if(keyCode === R_KEYCODE){
            player.destroyReferences();
            self.init();
        }
        else if(keyCode === P_KEYCODE){
            self.gamePaused = !self.gamePaused;
            pauseSprite.switchAnimation("default_static", true);
        }
    };
    
    var onKeyUp = function (e) {
        var keyCode = util_getKeyCode(e);
        
        if(util_isPageMoveKeyCode(keyCode)){
            e.preventDefault();
        }
        
        // remove key
        delete(heldKeys[keyCode]);
    };

    this.init = function(){
        console.log("reinitializing game");
        // initialize mouse and key event queues
        clicks = [];
        heldKeys = {};
        this.gamePaused = false;
        this.gameOver = false;
        this.transitionDrop = false;
        this.transitionLand = false;
        this.nextTransition = 100;
        this.nextEnvironment = 0;
        this.falling = false;
        
        //set game dimensions and speed
        this.worldX = 0;
        this.worldY = 0;
        this.width = 600;
        this.height = 600;
        this.scrollX = -6;
        this.scrollY = 0;
        this.time = 0;
        
        // initialize player
        player = new Player(300, 400, 32, 32);
        //initialize environment
        environment = new Environment();
        environment.init(self, 0);
        environment.bgColor = {red : 0x9e, blue : 0xff, green : 0xb3};
        // initialize Collisions
        collisions = new Collisions();
        
        pauseSprite = new SpriteImage("sleep_render");
    }
    
    /** like Tkinter's run; sets up event handlers etc. **/
    this.run = function () {
        console.log('running game; setting up event handlers');
        this.init();
        
        //save reference to canvas and context
        canvas = document.getElementById("gamecanvas");
        ctx = canvas.getContext("2d");

        //initialize event handlers
        canvas.addEventListener("mousedown", onMouseDown, true);
        canvas.addEventListener("keydown", onKeyDown, true);
        canvas.addEventListener("keyup", onKeyUp, true);

        // make canvas focusable, then give it focus!
        canvas.setAttribute('tabindex','0');
        canvas.focus();
        
        //the inital call to timer, which will run continuously to update
        //the model and view
        timer();
    };
}
