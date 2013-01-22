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
    this._init = function(srcNickname){
        //console.log("initializing",this);
    
        this.nickname = srcNickname;
        var srcData = SpriteImage.sourcesData[srcNickname];
        assert(srcData != undefined, 
               "invalid sprite name: "+srcNickname);
        this.srcData = srcData;
        var srcImgObj = this.srcData.imgObj;

        //CONNOR - store reference to image width
        this.width = srcData.animationData.static[0].w;

        assert(srcImgObj !== undefined, "SpriteImage: no Image set for " + this.nickname);
        assert(srcImgObj instanceof Image, "SpriteImage: not given Image object");
        assert(srcImgObj.complete, "SpriteImage: source not preloaded");
        
        /* sets up sprite with default "static" animation */
        this.curAnimation = "static";
        this._aniIndex = 0;
        
        this._frameStepCount = 0;
        // 0 delay is the same as no delay in animation, so just treat it
        // as if no delay was set
        if (srcData.frameStepDelay <= 0){
            this._frameStepDelay = undefined;
        }
        else{
            this._frameStepDelay = srcData.frameStepDelay;
        }
        
        var animData = this.srcData.animationData;
        assert(animData !== undefined, 
               "missing animation data for SpriteImage("+this.nickname+")");
        var defaultAnim = "static";
       
        this.switchAnimation(defaultAnim);
    };
    
    this._hasAnimation = function(animName){
        var allAnims = this._getAllAnims();
        return allAnims[animName] !== undefined;
    };
    
    this._getAllAnims = function(){
        var animData = this.srcData.animationData;
        return animData;
    }
    
    this._getAnimFrameList = function(animName){
        assert(this._hasAnimation(animName), "no animation "+animName+
               "for SpriteImage("+this.nickname+")");
               
        var frameList = this._getAllAnims(animName)[animName];
        return frameList;
    }
    
    this._getCurrFrame = function(){
        var frameIndex = this._aniIndex;
        var frameList = this._getAnimFrameList(this.curAnimation);
        assert(frameIndex < frameList.length, "frame index "+frameIndex+
                " out of range for animation '"+this.curAnimation+"'"+
                " in SpriteImage("+this.nickname+")");
        return frameList[frameIndex];
    }
    
    /** SpriteImage.drawTo: (canvas context, Number, Number, Number, Number, 
                             Boolean)
    
    draws the SpriteImage to the given canvas context
    
    params:
    ctx                         the canvas context to draw on
    drawX, drawY                the canvas context coordinates to draw to
    drawWidth, drawHeight       the dimensions to draw the image as
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
        
        var frame = this._getCurrFrame();
        var clipX = frame.x;
        var clipY = frame.y;
        var clipWidth = frame.w;
        var clipHeight = frame.h;
        
        //var drawWidth = Math.round(clipWidth*scaleFactor)
        //var drawHeight = Math.round(clipHeight*scaleFactor)
        ctx.drawImage(this.srcData.imgObj, 
                      clipX, clipY, clipWidth, clipHeight,
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
    
    /**
    params:
    scaleFactor                 how much to magnify the original image by
    **/
    this.drawToScale = function(ctx, drawX, drawY, scaleFactor){
        var frame = this._getCurrFrame();
        var clipWidth = frame.w;
        var clipHeight = frame.h;
        
        var drawWidth = Math.round(clipWidth*scaleFactor)
        var drawHeight = Math.round(clipHeight*scaleFactor)
        this.drawTo(ctx, drawX, drawY, drawWidth, drawHeight);
    }
    
    this.nextFrame = function(){
        if(this._frameStepDelay !== undefined){
            this._frameStepCount++;
            this._frameStepCount %= this._frameStepDelay;
            if(this._frameStepCount !== 0){
                return;
            }
        }
        
        var frameList = this._getAnimFrameList(this.curAnimation);
        // wrap around here
        if (frameList.length > 0){
            this._aniIndex = (this._aniIndex + 1) % frameList.length;
        }
    };
    
    /** SpriteImage.switchAnimation: (String, Boolean)
    
    params:
    animationName           the human readable name for the animation to play
    forceRestart            (optional) if set to on, forces an animation to
                            restart if told to switch to the already running
                            animation
    **/
    this.switchAnimation = function(animationName, forceRestart){
        if(forceRestart === undefined){
            forceRestart = false;
        }
        if(forceRestart === true || animationName !== this.curAnimation){
            assert(this._hasAnimation(animationName), 
                   "SpriteImage("+this.srcNickname+") attempted to switch to "+
                   "invalid animation '"+animationName+"'");
            this.curAnimation = animationName;
            this._aniIndex = 0;
        }
    };
    
    this._init.apply(this, arguments);
}

SpriteImage.sourcesData = {
    // human-readable-nickname array to make this for-loopable to work around
    // not being allowed to forloop through object keys by homework constraints
    "nicknames":["mario", "pipe", "groundBlock", "solidBlock", "brickBlock",
                 "cloud", "bush"],
    "mario": {
        "srcPath": "assets/images/supermariobros_mario_sheet.png",
        "imgObj": undefined, // overwritten with Image object after preload
        "animationData":{
            "static":[{x:209,y:0,w:16,h:16}],
            "stand_left":[{x:179,y:0,w:16,h:16}],
            "stand_right":[{x:209,y:0,w:16,h:16}],
            "run_left":[{x:150,y:0,w:16,h:16},
                        {x:120,y:0,w:16,h:16},
                        {x:90,y:0,w:16,h:16}],
            "run_right":[{x:240,y:0,w:16,h:16},
                        {x:270,y:0,w:16,h:16},
                        {x:300,y:0,w:16,h:16}],
            "fall":[{x:389,y:16,w:16,h:16},
                    {x:0,y:16,w:16,h:16}],
            "jump_left":[{x:29,y:0,w:16,h:16}],
            "jump_right":[{x:360,y:0,w:16,h:16}]
        },
        "frameStepDelay": 3
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
