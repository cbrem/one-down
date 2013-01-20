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
    - consolidate sprites into one array (no top and bottom)
    - change possibleAddSprites so that it works more like addNecessarySprites.
        (i.e. doesn't add just on sprite, but adds enough to fill distance travelled)
    - make EnvBlock.level work
    - change 
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
    return "#" + randomInt(x, 0x1000000);
}

//constructor for EnvBlock objects, which build the environment
function EnvBlock (name, x, level, necessary) {
    var getEnvBlockY = function (level) {
        switch (level) {
            case 1  : return 500;
            case 2  : return 400;
            case 3  : return 200;
            default : throw Error("bad level in getEnvBlockY");
                      return;
        }
    };

    this.img = new SpriteImage(name, 2); //2 is scale factor
    this.name = name;
    this.x = x;
    this.y = getEnvBlock(level);
    this.necessary = necessary;
}

function Environment () {
    //lists of sprites currently on the top and bottom of the screen
    this.sprites;
    this.bgColor;
    
    var buffer; //min space between EnvBlocks

    //options for sprites on the top and bottom of the screen.
    //also, sprites which must be drawn (e.g. sky, grass)
    var spriteChoices = [{name : "chik2", level : 2, necessary : false}];

    this.init = function (game) {
        //clear sprite arrays
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
                addNecessarySprite(choice.name, game.worldX,
                                   game.worldX + game.width,
                                   spritesOnScreen);
            }
        }

        //fill map with non-necessary sprites
        for (var spriteX = 0; spriteX < game.width; spriteX += game.speed)
            possiblyAddSprite(spritesOnScreen, 4, platformY, game.width,
                              topSpriteChoices);
    };

    this.draw = function (ctx, game) {
        //draw background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0,0, game.width, game.height);

        var drawSpriteArray = function (a) {
            for (var i = 0; i < a.length; i++) {
                var sprite = a[i];
                sprite.img.drawTo(ctx, sprite.x, sprite.level);
            }
        };

        //draw sprites
        drawSpriteArray(spritesOnScreen);
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
    var possiblyAddSprite = function (a, choices, chance, worldWidth) {
        var rightMost = a[a.length - 1];
        var rightMostRightSide = rightMost.x + rightMost.width;
        if (rightMostRightSide < worldWidth && randomChance(chance)) {
            var choice = randomChoice(choices);
            var newSprite =
                new EnvBlock(choice.name, worldWidth + buffer,
                             randInt(1, 4), choice.necessary);
            a.push(newSprite);
        }
    };

    //span the screen with instances of a necessary sprite.
    var addNecessarySprite = function (name, screenLeft, screenRight,
                                       spritesOnScreen) {
        //determine how much screen space of the necessary sprite is missing
        var furthestRight = 0; //right side of furthest right sprite
        for (var i = 0; i < spritesOnScreen.length; i++) {
            var sameBlock = spritesOnScreen[i];
            if (sameBlock.name === name)
                furthestRight += sameBlock.width;
        }

        //fill that screen space with an appropriate number of instances
        //of the necessary sprite
        var spritesToAdd =
            Math.ceil((screenRight - furthestRight) / sprite.width);
        for (var i = 0; i < spritesToAdd; i++) {
            var newSprite = new EnvBlock(sprite.name, furthestRight,
                                sprite.height, sprite.width, sprite.height);
            spritesOnScreen.push(newSprite);
            furthestRight += sprite.width;
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
        moveEnvBlocks(spritesOnScreen, game.speed);

        //remove elements which have moved off left side
        pruneSprites(spriteChoices);

        //possibly add in new sprites
        possiblyAddSprites(spritesOnScreen, spriteChoices, 4, game.width);

        //add in necessary sprites
        for (var i = 0; i < spriteChoices.length; i++) {
            var choice = spriteChoices[i];
            if (choice.necessary)
                addNecessarySprite(choice.name, game.worldX,
                                   game.worldX + game.width, spritesOnScreen);
        }
    };
}
