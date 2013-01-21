/*
    Environment structure:
        - contains a list which acts as a queue, where the invariant is that
        the items in the queue are sorted by their right x-coordinate
        - in update:
            - strip off any queue items which have right x-coordinates
            that have moved off the screen, because they're irrelevant
            - add new queue items if:
                1. an  x-position equal to a multiple of the width of a 
                necessary object is on the screen. Then add the relevant sprite
                2. in the top half of the screen, the right x-coordinate of the last 
                sprite generated in the top of the screen is completely on the screen
                    - then, POSSIBLY, with some random element, add a new sprite to the
                    top half of the screen
                3. same as #2, but in the bottom half of the screen
                    - for items like pipes, mounds, etc
*/

/*
TODO:
    - change possibleAddSprites so that it works more like addNecessarySprites.
        (i.e. doesn't add just on sprite, but adds enough to fill distance travelled)
    - preload non-interface functions
    - make EnvBlock.collidable a property
    - fix possiblyAddSprites so it fills the empty canvas with items BY making
    it more like addNecessarySprites, where it calculates to open area and
    fills it
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
    return "#" + randomInt(0, 0x1000000);
}

//constructor for EnvBlock objects, which build the environment
function EnvBlock (name, x, level, necessary, scaleFactor) {
    var getEnvBlockY = function (level) {
        switch (level) {
            case 1  : return 500;
            case 2  : return 400;
            case 3  : return 200;
            default : throw Error("bad level in getEnvBlockY: " + level);
                      return;
        }
    };

    this.img = new SpriteImage(name);
    this.name = name;
    this.x = x;
    this.y = getEnvBlockY(level);
    this.necessary = necessary;
    this.scaleFactor = scaleFactor;
    this.width = this.img.width * this.scaleFactor;
}

function Environment () {
    this.spritesOnScreen; //lists of sprites currently on the screen
    this.bgColor;
    
    var buffer; //min space between EnvBlocks

    //options for sprites on the top and bottom of the screen.
    //also, sprites which must be drawn (e.g. sky, grass)
    var spriteChoices = [{name : "mario", level : 2, necessary : false},
                         {name : "groundBlock", level : 1, necessary : true},
                         {name : "cloud", level : 3, necessary : true}];

    this.init = function (ctx, game) {
        //clear sprite arrays

        //clear spritesOnScreen
        this.spritesOnScreen = [];

        //set vertical spacing parameters
        this.groundY = 500;
        this.platformY = 200;

        //set buffer
        buffer = 50;

        //randomly choose background color
        this.bgColor = randomColor();

        //fill map with necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary) {
                addNecessarySprite(choice, game.worldX, game.width,
                                   this.spritesOnScreen);
            }
        }

        //fill map with random sprites
        for (var spriteX = 0; spriteX < game.width; spriteX += game.speed) {
            possiblyAddSprite(this.spritesOnScreen, 4, game.width,
                              spriteChoices, buffer);
        }
    };

    this.draw = function (ctx, game) {
        //draw background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0,0, game.width, game.height);

        var drawEnvBlockArray = function (a) {
            for (var i = 0; i < a.length; i++) {
                var envBlock = a[i];
                envBlock.img.drawTo(ctx, envBlock.x, envBlock.y,
                                    envBlock.scaleFactor);
            }
        };

        //draw sprites
        drawEnvBlockArray(this.spritesOnScreen);
    };

    //prune off-screen sprites from a sprite array.
    //takes advantage of the sprite array invariant
    //(i.e. sprite arrays are sorted by x-coordinate of right side)
    var pruneSprites = function (a, worldWidth) {
        while (a[0].x + a[0].width < worldWidth) a.shift();
    };

    //adds a new sprite to the provided array "a" with probability
    //1 out of "chance". Puts objects at set y coordinate.
    //worldX is the absolutes width of the screen, and worldWidth is its width
    var possiblyAddSprite = function (a, choices, chance, worldWidth, buffer) {
        var rightMostRightSide = 0;
        for (var i = 0; i < a.length; i++) {
            envBlock = a[i];
            if (envBlock.necessary === false)
                rightMostRightSide = Math.max(rightMostRightSide,
                                              envBlock.x + envBlock.width);
        }
        if (rightMostRightSide < worldWidth && randomChance(chance)) {
            var choice = randomChoice(choices);
            var newSprite =
                new EnvBlock(choice.name, worldWidth + buffer,
                             randomInt(1, 4), choice.necessary, 2);
            console.log("created sprite in possiblyAddSprite with x = ", newSprite.x);
            a.push(newSprite);
        }
    };

    //span the screen with instances of a necessary sprite.
    var addNecessarySprite = function (choice, worldX, gameWidth,
                                       spritesOnScreen) {

        //determine how much screen space of the necessary sprite is missing
        var furthestRight = 0; //right side of furthest right sprite
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var sameBlock = spritesOnScreen[i];
            if (sameBlock.name === choice.name)
                furthestRight += sameBlock.width;
        }

        //fill that screen space with an appropriate number of instances
        //of the necessary sprite
        while (furthestRight < gameWidth) {
            var newSprite = new EnvBlock(choice.name, furthestRight,
                                         choice.level, true, 2);
            spritesOnScreen.push(newSprite);
            furthestRight += newSprite.width;
        }
    };

    //takes the x-coordinate of the screen's sides in world coordinates.
    //note that these should be the NEW side coordinates.
    this.update = function (game) {
        //moves all EnvBlocks in a by a given distance
        var moveEnvBlocks = function (a, distance) {
            for (var i = 0; i < a.length; i++)
                a[i].x += distance;
        };

        //shift all EnvBlocks
        //moveEnvBlocks(this.spritesOnScreen, game.speed);

        //remove elements which have moved off left side
        pruneSprites(spriteChoices);

        //possibly add in new sprites
        possiblyAddSprite(this.spritesOnScreen, spriteChoices, 4, game.width,
			  buffer);

        //add in necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary)
                addNecessarySprite(choice, game.worldX,
                                   game.width, this.spritesOnScreen);
        }
    };
}
