/*
Interface:
    Properties:
        * this.spritesOnScreen: an array of all EnvBlock objects currently
        being stored

    Methods:
        * this.init: initialize a new stage
        * this.update: update a stage after the screen has moved
        * this.draw: draw all environment elements in a stage

*/

//used by both EnvBlock and Environment.
//level[n] gives the y-coordinate associated with level n,
//a boolean (nonNecessary) which determines whether nonNecessary sprites
//are drawn at that level,
//and an integer chance which is the reciprocal of the random chance that
//sprites will be drawn on this level
var levels = [
    {y : 568, nonNecessary : false, startChance : undefined,
     followChance : undefined}, 
    {y : 536, nonNecessary : false, startChance : undefined,
     followChance : undefined}, 
    {y : 504, nonNecessary : false, startChance : undefined,
     followChance : undefined}, 
    {y : 472, nonNecessary : false, startChance : undefined,
     followChance : undefined}, 
    {y : 440, nonNecessary : true, startChance : 2, followChance : 1.5}, 
    {y : 408, nonNecessary : true, startChance : 8, followChance : 8}, 
    {y : 300, nonNecessary : true, startChance : 4, followChance : 1.3},
    {y : 200, nonNecessary : true, startChance : 4, followChance : 1.3},
    {y : 100, nonNecessary : true, startChance : 4, followChance : 2},
];

//constructor for EnvBlock objects, which build the environment
function EnvBlock (name, x, level, necessary, collidable, drawable,
                   harmful, width, height) {
    assert(typeof(width) === "number" && width > 0, "invalid width for EnvBlock"+name);
    assert(typeof(height) === "number" && height > 0, "invalid height for EnvBlock"+name);
    this.img = new SpriteImage(name);
    if(this.img.hasAnimation("chomping")){
        this.img.switchAnimation("chomping");
    }
    this.name = name;
    this.x = x;
    this.level = level;
    this.y = levels[level].y;
    this.necessary = necessary;
    this.collidable = collidable;
    this.drawable = drawable;
    this.harmful = harmful;
    this.width = width;
    this.height = height;
}

function Environment () {
    var self = this;

    this.spritesOnScreen; //lists of sprites currently on the screen
    this.bgColor;
    this.timeToNextGap; //time until setNextGap is turned on
    
    var buffer; //min space between nonNecessary EnvBlocks
    var drawGap; //boolean which determines whether gap should be
                 //currently drawn
    var gapLeft;  //once setNextGap is on, time for which gap continues
                  //to be drawn
    var plants; // should piranha plants be drawn in the holes?

    //options for sprites on the top and bottom of the screen.
    //also, sprites which must be drawn (e.g. sky, grass)
    var spriteChoices = [
        {name : "groundBlock",  level : 0, necessary : true,  collidable : true, width:32, height:32},
        {name : "groundBlock",  level : 1, necessary : true,  collidable : true, width:32, height:32},
        {name : "groundBlock",  level : 2, necessary : true,  collidable : true, width:32, height:32},
        {name : "groundBlock",  level : 3, necessary : true,  collidable : true, width:32, height:32},
        {name : "bush",         level : 4, necessary : false,  collidable : false, width:96, height:32},
        {name : "pipe",         level : 5, necessary : false, collidable : true, width:64, height:64},
        {name : "brickBlock",   level : 6, necessary : false, collidable : true, width:32, height:32},
        {name : "cloudPlatform",level : 7, necessary : false, collidable : true, width:96, height:32},
        {name : "cloud",        level : 8, necessary : false, collidable : false, width:96, height:64},
    ];

    //moves all EnvBlocks in a by a given distance
    var moveEnvBlocks = function (a, distX, distY) {
        for (var i = 0; i < a.length; i++){
            a[i].x += distX;
            a[i].y += distY;
        }    
    };

    //initialize the environment, with "below" determining how far beneath
    //the current top of the screen the top of the environment is located
    this.init = function (game, below) {
        //clear spritesOnScreen
        this.spritesOnScreen = [];

        buffer = 50;
        gapLeft = 0;
        drawGap = false;
        plants = true;

        //randomly choose background color and first gap location
        this.bgColor = randomColor();
        this.timeToNextGap = 0;

        //fill map with necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary)
                addNecessarySprite(choice, game.width, this.spritesOnScreen,
                                   drawGap);
        }

        //fill screen with random sprites on each level
        for (var i = 0; i < levels.length; i++)
            if (levels[i].nonNecessary === true)
                addNonNecessarySprite(i, game.width, this.spritesOnScreen,
                                      spriteChoices, levels, buffer, true,
                                      drawGap);

        moveEnvBlocks(this.spritesOnScreen, 0, below);
    };

    this.draw = function (ctx, game) {
        //draw background
        ctx.fillStyle = ("#"+(this.bgColor.red.toString(16))+
                        (this.bgColor.green.toString(16))+
                        this.bgColor.blue.toString(16));
        ctx.fillRect(0,0, game.width, game.height);

        var drawEnvBlockArray = function (a) {
            //first pass: draw neccesary
            for (var i = 0; i < a.length; i++) {
                var envBlock = a[i];
                if(envBlock.drawable && envBlock.necessary) {
                    envBlock.img.drawTo(ctx, envBlock.x, envBlock.y, envBlock.width, envBlock.height);
                    if((game.gameOver || game.gamePaused) === false){
                        envBlock.img.nextFrame();
                    }
                }
            }
            //first pass: draw neccesary
            for (var i = 0; i < a.length; i++) {
                var envBlock = a[i];
                if(envBlock.drawable && !envBlock.necessary) {
                    envBlock.img.drawTo(ctx, envBlock.x, envBlock.y, envBlock.width, envBlock.height);
                    if((game.gameOver || game.gamePaused) === false){
                        envBlock.img.nextFrame();
                    }
                }
            }
        };

        //draw sprites
        drawEnvBlockArray(this.spritesOnScreen);
    };

    //prune off-screen sprites from a sprite array.
    //takes advantage of the sprite array invariant
    //(i.e. sprite arrays are sorted by x-coordinate of right side)
    var pruneSprites = function (spritesOnScreen, worldWidth) {
        var newSpritesOnScreen = [];
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var sprite = spritesOnScreen[i];
            if ((sprite.x + sprite.width) > 0) newSpritesOnScreen.push(sprite);
        }
        self.spritesOnScreen = newSpritesOnScreen;
    };

    //Adds enough new sprites on a given level to span the screen. 
    //Unlike addNecessarySprite, sprite choice is random,
    //and sprites may not be drawn at some locations.
    //adds sprites to spritesOnscreen in the specified level.
    //worldX is the absolutes width of the screen, and gameWidth is its width.
    //onScreen is a boolean which determines whether EnvBlocks can be created
    //if they are in a position that is currently on the screen
    var addNonNecessarySprite = function (level, gameWidth, spritesOnScreen,
                                          choices, levels, buffer, onScreen,
                                          gap) {
        
        //ensure that all objects created will be off screen
        var furthestRight = (onScreen) ? 0 : gameWidth;

        //is the furthest right EnvBlock on this level drawn? used for
        //stringing
        var furthestRightDrawn = false;

        //determine how much space there is on this level
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var envBlock = spritesOnScreen[i];
            var rightSide = envBlock.x + envBlock.width;
            if (envBlock.necessary === false && envBlock.level === level
               && rightSide > furthestRight) {
                furthestRight = rightSide;
                furthestRightDrawn = envBlock.drawable;
            }
        }
        //furthestRight += buffer;

        //randomly chooses a sprite,
        //and ensures that it will have a specified level and be non-necessary
        //IMPORTANT: "choices" must contain at least one such sprite for each
        //level marked in "levels" as nonNecessary, or this function will
        //recurse infinitely!
        var chooseByLevel = function (choices, level) {
            var choice = randomChoice(choices);
            if (choice.level === level && choice.necessary === false)
                return choice;
            else
                return chooseByLevel(choices, level);
        };

        while(furthestRight < 2 * gameWidth) {
            var levelChoice = chooseByLevel(choices, level);
            
            var collidable,
                drawable;

            var chance = (furthestRightDrawn) ? levels[level].followChance :
                                                levels[level].startChance;
            if (randomChance(chance) && !gap) {
                collidable = levelChoice.collidable;
                drawable = true;
            } else {
                //the sprite only takes up space and is not drawn
                collidable = false;
                drawable = false;
            }

            var newSprite =
                new EnvBlock(levelChoice.name, furthestRight,
                             levelChoice.level, levelChoice.necessary,
                             collidable, drawable, false, levelChoice.width, levelChoice.height);
            furthestRight += newSprite.width;
            //furthestRight += buffer;
            spritesOnScreen.push(newSprite);
        }
    };

    //span the screen with instances of a necessary sprite.
    var addNecessarySprite = function (choice, gameWidth, spritesOnScreen,
                                       gap) {

        //determine how much screen space of the necessary sprite is missing
        var furthestRight = 0; //right side of furthest right sprite
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var envBlock = spritesOnScreen[i];
            if (envBlock.name === choice.name && 
                envBlock.level === choice.level) {
                furthestRight = envBlock.x + envBlock.width;
            }
        }

        //fill that screen space with an appropriate number of instances
        //of the necessary sprite
        while (furthestRight < 2 * gameWidth) {
            var collidable,
                drawable,
                name;
            if (gap) {
                if (choice.level === 0 && plants) {
                    //draw a piranha plant over the gap
                    var holeSprite = 
                        new EnvBlock("piranhaPlant", furthestRight, 
                                     0, false, true, true, true, 
                                     32,48); // size is hardcoded as hell, yikes
                    spritesOnScreen.push(holeSprite);
                }
                collidable = false;
                drawable = false;
            } else {
                collidable = choice.collidable;
                drawable = true;
            }

            var newSprite = new EnvBlock(choice.name, furthestRight,
                                         choice.level, choice.necessary,
                                         collidable, drawable, false, choice.width, choice.height);
            spritesOnScreen.push(newSprite);
            furthestRight += newSprite.width;
        }
    };

    //takes the x-coordinate of the screen's sides in world coordinates.
    //note that these should be the NEW side coordinates.
    this.update = function (game) {

        // gap drawing
        var manageGaps = function () {
            if (drawGap) {
                //if gap drawing is on
                if (gapLeft > 0) {
                    gapLeft--;
                } else {
                    //time to turn gap drawing off
                    drawGap = false;
                    plants = true;
                    self.timeToNextGap = randomInt(50, 100);
                }
            } else {
                //if not currently drawing a gap
                if (self.timeToNextGap > 0) {
                    if (game.transitionDrop) {
                        plants = false;
                        //console.log("MADE BIG GAP");
                        //force gap to appear soon
                        self.timeToNextGap = 0;
                        gapLeft = randomInt(49,54);
                        game.transitionDrop = false;
                        drawGap = true;
                    } else {
                        self.timeToNextGap--;
                    }
                } else {
                    //time to turn gap drawing on
                    drawGap = true;
                    gapLeft = randomInt(20, 30);
                }

            }
        };
        manageGaps();

        //shift all EnvBlocks
        moveEnvBlocks(this.spritesOnScreen, game.scrollX, game.scrollY);

        //remove elements which have moved off left side
        pruneSprites(this.spritesOnScreen, game.width);

        //fill screen with random sprites on each level
        for (var i = 0; i < levels.length; i++){
            if (levels[i].nonNecessary === true){
                addNonNecessarySprite(i, game.width, this.spritesOnScreen,
                                      spriteChoices, levels, buffer, false,
                                      drawGap);
            }
        }

        //add in necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary){
                addNecessarySprite(choice, game.width, 
                                   this.spritesOnScreen, drawGap);
            }
        }

        //check for the whole environment being on screen
        var maxY = 0;
        for (var i = 0; i < this.spritesOnScreen.length; i++) {
            var envBlock = this.spritesOnScreen[i];
            maxY = Math.max(maxY, envBlock.y + envBlock.width);
        }
        if ((game.transitionLand) && (maxY <= game.height)) {
           // console.log("BACK TO PLATFORM TRANSITION!");
            game.scrollX = game.scrollSpeed;
            game.scrollY = 0;
            game.transitionLand = false;
            if (game.falling) game.falling = false;
        }

        if (game.falling) {
           // don't let it get below 16...bad hex error-turns white
            var fadeSpeed = 2;
            if (this.bgColor.red > 15+fadeSpeed) 
                {this.bgColor.red -= fadeSpeed;};
            if (this.bgColor.green > 15+fadeSpeed) 
                {this.bgColor.green -= fadeSpeed;};
            if (this.bgColor.blue > 15+fadeSpeed) 
                {this.bgColor.blue -= fadeSpeed;};
        }
    };
}
