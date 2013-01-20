/** SpriteImage: (Image)
    handles the graphics for a sprite (ex: drawing and animation frame handling)
    (note: images must have been preloaded before using this class)
    
    params:
    srcNickname       the human readable nickname for the image
                      (must be one of the nicknames in the sourcesData)
**/

// sprites we have:
// "mario", "groundBlock", "pipe", "solidBlock", "brickBlock",
//  "cloud", "bush"
function SpriteImage(srcNickname){
    assert(SpriteImage.sourcesData[srcNickname] != undefined, "invalid sprite name");
    this.srcData = SpriteImage.sourcesData[srcNickname];
    var srcImgObj = this.srcData.imgObj;
    
    assert(srcImgObj !== undefined, "SpriteImage: no Image set for " + srcNickname);
    assert(srcImgObj instanceof Image, "SpriteImage: not given Image object");
    assert(srcImgObj.complete, "SpriteImage: source not preloaded");
    
    /* sets up sprite with default "static" animation */
    this.curAnimation = "static";
    this._aniIndex = 0;
    this._clipX = this.srcData["animationData"]["static"][0].x;
    this._clipY = this.srcData["animationData"]["static"][0].y;
    this._clipWidth = this.srcData["animationData"]["static"][0].w;
    this._clipHeight = this.srcData["animationData"]["static"][0].h;
    
    /** SpriteImage.drawTo: (canvas context, Number, Number, Number, Number, 
                             Boolean)
    
    draws the SpriteImage to the given canvas context
    
    params:
    ctx                         the canvas context to draw on
    drawX, drawY                the canvas context coordinates to draw to
    scaleFactor                 how much to magnify the original image by
    showDebug                   (optional) if set to true, will show the 
                                boundaries of the drawn area with a red overlay
                                 - default: false
    **/
    this.drawTo = function(ctx, drawX, drawY, scaleFactor, showDebug){
        // round to prevent blurriness
        var drawX = Math.round(drawX);
        var drawY = Math.round(drawY);
        var dataWidth = this.srcData.["animationData"][this.curAnimation][this._aniIndex].w;
        var dataHeight = this.srcData.["animationData"][this.curAnimation][this._aniIndex].h;
        var drawWidth = Math.round(dataWidth*scaleFactor);
        var drawHeight = Math.round(dataHeight*scaleFactor);
        ctx.drawImage(this.srcData.imgObj, 
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
    
    this.nextFrame = function(){
        var newIndex = this._aniIndex + 1;
        // wrap around here
        if (newIndex >= this.srcData["animationData"][this.curAnimation].length)
            {newIndex = 0;}
        this._aniIndex = newIndex;
        // change where the image is clipped from (but not width/height)
        this._clipX = this.srcData["animationData"][this.curAnimation][newIndex].x;
        this._clipY = this.srcData["animationData"][this.curAnimation][newIndex].y;
    }
    
    this.switchAnimation = function(animationName){
        this.curAnimation = animationName;
        this._aniIndex = 0;
        this._clipX = this.srcData["animationData"][animationName][0].x;
        this._clipY = this.srcData["animationData"][animationName][0].y;
    }
}

SpriteImage.sourcesData = {
    // arrays to make this for-loopable to work around not being allowed to 
    // forloop through object keys by homework constraints
    "nicknames":["chik2", "ninjatuna","mario"],
    /*"chik2": {
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
    },*/
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
            "static":[{x:176,y:32,w:16,h:16}],
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