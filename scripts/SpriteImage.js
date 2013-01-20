/** SpriteImage: (Image)
    handles the graphics for a sprite (ex: drawing and animation frame handling)
    (note: images must have been preloaded before using this class)
    
    params:
    srcNickname       the human readable nickname for the image
                      (must be one of the nicknames in the sourcesData)
**/
function SpriteImage(srcNickname){
    assert(SpriteImage.sourcesData[srcNickname] != undefined, "invalid sprite name");
    var srcData = SpriteImage.sourcesData[srcNickname];
    var srcImgObj = srcData.imgObj;
    
    assert(srcImgObj !== undefined, "SpriteImage: no Image set for " + srcNickname);
    assert(srcImgObj instanceof Image, "SpriteImage: not given Image object");
    assert(srcImgObj.complete, "SpriteImage: source not preloaded");
    this._srcImgObj = srcImgObj;
    
    /* for spritesheet animations, unfinished for now and
       hardcoded to do static images only */
    this._clipX = 0;
    this._clipY = 0;
    this._clipWidth = srcImgObj.width;
    this._clipHeight = srcImgObj.height;
    this._animations = {};
    
    /** SpriteImage.drawTo: (canvas context, Number, Number, Number, Number, 
                             Boolean)
    
    draws the SpriteImage to the given canvas context
    
    params:
    ctx                         the canvas context to draw on
    drawX, drawY                the canvas context coordinates to draw to
    drawWidth, drawHeight       the size to draw the images to on the canvas
    showDebug                   (optional) if set to true, will show the 
                                boundaries of the drawn area with a red overlay
                                 - default: false
    **/
    this.drawTo = function(ctx, drawX, drawY, drawWidth, drawHeight, showDebug){
        // round to prevent blurriness
        drawX = Math.round(drawX);
        drawY = Math.round(drawY);
        drawWidth = Math.round(drawWidth);
        drawHeight = Math.round(drawHeight);
        ctx.drawImage(this._srcImgObj, 
                      this._clipX, this._clipY, 
                      this._clipWidth, this._clipHeight,
                      drawX, drawY, drawWidth, drawHeight
                     );
        
        // display a red overlay to show where the sprite is when in debug mode
        if(showDebug === true){
            ctx.save();
            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
        }
    };    
    
    this.nextFrame = function(skip){
        if(skip === undefined){
            skip = 1;
        }
        // TODO
    }
    
    this.switchAnimation = function(animationName){
        // TODO
    }
}

SpriteImage.sourcesData = {
    // arrays to make this for-loopable to work around not being allowed to 
    // forloop through object keys by homework constraints
    "nicknames":["chik2", "ninjatuna","mario"],
    "chik2": {
        "srcPath": "assets/images/chik2.png",
        "imgObj": undefined, // the actual Image object, will be overwritten on preload
        "animationData":{
            "walk":{
                // data about clip areas here
            },
            "run":{
                // data about clip areas here
            }
        }
    },
    "ninjatuna": {
        "srcPath": "assets/images/ninjatunaicon.png",
        "imgObj": undefined, // the actual Image object, will be overwritten on preload
        "animationData":{
            "walk":{
                // data about clip areas here
            },
            "run":{
                // data about clip areas here
            }
        }
    },
    "mario": {
        "srcPath": "assets/images/mariobros.png",
        "imgObj": undefined,
        "animationData":{
            "run":[{x:80,y:32,w:16,h:16},
                    {x:96,y:32,w:16,h:16},
                    {x:112,y:32,w:16,h:16}],
            "fall":[{x:304,y:32,w:16,h:16},
                    {x:320,y:32,w:16,h:16},
                    {x:336,y:32,w:16,h:16}],
            "stand":[{x:176,y:32,w:16,h:16}],
            "jump":[{x:144,y:32,w:16,h:16}]
        }
    },
    "groundBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:0,y:0,w:16,h:16}]
        }
    },
    "pipe": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:0,y:128,w:32,h:32}]
        }
    },
    "solidBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:0,y:16,w:16,h:16}]
        }
    },
    "brickBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:16,y:0,w:16,h:16}]
        }
    },
    "cloud": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:0,y:320,w:48,h:32}]
        }
    },
    "bush": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "static":[{x:176,y:144,w:48,h:16}]
        }
    }
}