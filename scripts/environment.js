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

/*
TODO:
    - preload non-interface functions
*/

//generates a random integer.
//lower bound is inclusive, upper bound is exclusive.
function randomInt(bound1, bound2) {
    var lo = Math.min(bound1, bound2);
    var hi = Math.max(bound1, bound2);
    var rand = lo + Math.floor(Math.random()*(hi - lo));
    if(rand === hi)
        //this is highly unlikely, maybe impossible
        return randomInt(bound1, bound2);
    else
        return rand;
}

//randomly chooses an element from an array
function randomChoice (a) {
    return a[randomInt(0, a.length)];
}

//returns true with probability 1/x
function randomChance(x) {
    return (0 === randomInt(0, x));
}

//return a random hexidecimal color
function randomColor() {
    return "#" + randomInt(0, 0x1000000).toString(16);
}

//used by both EnvBlock and Environment.
//level[n] gives the y-coordinate associated with level n,
//a boolean (nonNecessary) which determines whether nonNecessary sprites
//are drawn at that level,
//and an integer chance which is the reciprocal of the random chance that
//sprites will be drawn on this level
var levels = [
    {y : 568, nonNecessary : false, chance : undefined}, 
    {y : 536, nonNecessary : false, chance : undefined}, 
    {y : 504, nonNecessary : false, chance : undefined}, 
    {y : 472, nonNecessary : false, chance : undefined}, 
    {y : 440, nonNecessary : false, chance : undefined}, 
    {y : 408, nonNecessary : true, chance : 2}, 
    {y : 300, nonNecessary : true, chance : 1.5},
    {y : 200, nonNecessary : true, chance : 4}
];

//constructor for EnvBlock objects, which build the environment
function EnvBlock (name, x, level, necessary, collidable, drawable, scaleFactor) {
    this.img = new SpriteImage(name);
    this.name = name;
    this.x = x;
    this.level = level;
    this.y = levels[level].y;
    this.necessary = necessary;
    this.collidable = collidable;
    this.drawable = drawable;
    this.scaleFactor = scaleFactor;
    this.width = this.img.width * this.scaleFactor;
    this.height = this.width;
}

function Environment () {
    var self = this;

    this.spritesOnScreen; //lists of sprites currently on the screen
    this.bgColor;
    
    var buffer; //min space between nonNecessary EnvBlocks

    //options for sprites on the top and bottom of the screen.
    //also, sprites which must be drawn (e.g. sky, grass)
    var spriteChoices = [
        {name : "groundBlock",  level : 0, necessary : true,  collidable : true},
        {name : "groundBlock",  level : 1, necessary : true,  collidable : true},
        {name : "groundBlock",  level : 2, necessary : true,  collidable : true},
        {name : "groundBlock",  level : 3, necessary : true,  collidable : true},
        {name : "bush",         level : 4, necessary : true,  collidable : false},
        {name : "pipe",         level : 5, necessary : false, collidable : true},
        {name : "solidBlock",   level : 6, necessary : false, collidable : true},
        {name : "brickBlock",   level : 6, necessary : false, collidable : true},
        {name : "cloud",        level : 7, necessary : false, collidable : false}
    ];

    this.init = function (ctx, game) {
        //clear sprite arrays

        //clear spritesOnScreen
        this.spritesOnScreen = [];

        //set buffer
        buffer = 50;

        //randomly choose background color
        this.bgColor = randomColor();

        //fill map with necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary)
                addNecessarySprite(choice, game.width, this.spritesOnScreen);
        }

        //fill screen with random sprites on each level
        for (var i = 0; i < levels.length; i++)
            if (levels[i].nonNecessary === true)
                addNonNecessarySprite(i, game.width, this.spritesOnScreen,
                                      spriteChoices, levels, buffer, true);
    };

    this.draw = function (ctx, game) {
        //draw background
        //console.log(this.bgColor);
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0,0, game.width, game.height);

        var drawEnvBlockArray = function (a) {
            for (var i = 0; i < a.length; i++) {
                var envBlock = a[i];
                if(envBlock.drawable) 
                    envBlock.img.drawToScale(ctx, envBlock.x, envBlock.y,
                                             envBlock.scaleFactor);
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
                                          choices, levels, buffer, onScreen) {
        
        //ensure that all objects created will be off screen
        var furthestRight = (onScreen) ? 0 : gameWidth;

        //determine how much space there is on this level
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var envBlock = spritesOnScreen[i];
            if (envBlock.necessary === false && envBlock.level === level)
                furthestRight = Math.max(furthestRight,
                                         envBlock.x + envBlock.width);
        }
        furthestRight += buffer;

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
            if (randomChance(levels[level].chance)) {
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
                             collidable, drawable, 2);
            furthestRight += (newSprite.width + buffer);
            spritesOnScreen.push(newSprite);
        }
    };

    //span the screen with instances of a necessary sprite.
    var addNecessarySprite = function (choice, gameWidth, spritesOnScreen) {

        //determine how much screen space of the necessary sprite is missing
        var furthestRight = 0; //right side of furthest right sprite
        var found = 0;
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var envBlock = spritesOnScreen[i];
            if (envBlock.name === choice.name && 
                envBlock.level === choice.level) {
                found++;
                furthestRight += envBlock.width;
            }
        }

        //fill that screen space with an appropriate number of instances
        //of the necessary sprite
        while (furthestRight < 2 * gameWidth) {
            var newSprite = new EnvBlock(choice.name, furthestRight,
                                         choice.level, choice.necessary,
                                         choice.collidable, true, 2);
            spritesOnScreen.push(newSprite);
            furthestRight += newSprite.width;
        }
    };

    //takes the x-coordinate of the screen's sides in world coordinates.
    //note that these should be the NEW side coordinates.
    this.update = function (game) {
        //moves all EnvBlocks in a by a given distance
        var moveEnvBlocks = function (a, distX, distY) {
            for (var i = 0; i < a.length; i++){
                a[i].x += distX;
                a[i].y += distY;
            }    
        };

        //shift all EnvBlocks
        moveEnvBlocks(this.spritesOnScreen, game.scrollX, game.scrollY);


/*
 *
  I think you want this.spritesOnScreen, not spriteChoices
  but when you do that it breaks
 *
 */
        //remove elements which have moved off left side
        pruneSprites(this.spritesOnScreen, game.width);

/*
 *
  these loops are running way too often
  can we just do them when we need it? 
  (maybe when we move game.width, generate a new frame game.width ahead of that)
 *
 */

        //fill screen with random sprites on each level
        for (var i = 0; i < levels.length; i++){
            if (levels[i].nonNecessary === true){
                addNonNecessarySprite(i, game.width, this.spritesOnScreen,
                                      spriteChoices, levels, buffer, false);
            }
        }

/*
 *
  the ground blocks stop after 2 screens..?
 *
 */
        //add in necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary){
                addNecessarySprite(choice, game.width, this.spritesOnScreen);
            }
        }
    };
}
