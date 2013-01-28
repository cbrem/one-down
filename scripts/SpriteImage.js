/** SpriteImage(String)
    handles the graphics for a sprite (ex: drawing and animation frame handling)
    (note: images must have been preloaded before using this class)
    
    params:
    srcNickname       the human readable nickname for the image
                      (must be one of the nicknames in the 
                       SpriteImage.sourcesData dictionary)
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
        this.width = srcData.animationData.default_static[0].w;

        assert(srcImgObj !== undefined, "SpriteImage: no Image set for " + this.nickname);
        assert(srcImgObj instanceof Image, "SpriteImage: not given Image object");
        assert(srcImgObj.complete, "SpriteImage: source not preloaded");
        
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
               
        /* sets up sprite with default animation */
        var defaultAnim = "default_static";
        //this.curAnimation = defaultAnim;
        //this._aniIndex = 0;
        this.switchAnimation(defaultAnim);
    };
    
    /** SpriteImage.hasAnimation(String) -> Boolean
    
    checks if the given animation exists for this sprite

    params:
    animName        the name of the animation to check for
    
    returns:
    true if animName exists, false otherwise
    **/
    this.hasAnimation = function(animName){
        var allAnims = this._getAllAnims();
        return allAnims[animName] !== undefined;
    };
    
    /** SpriteImage._getAllAnims() -> Dictionary
    
    simply returns the animationData for the contructed SpriteImage;
    see SpriteImage.sourcesData for structure details
    
    returns:
    a dictionary consisting of the animationData of the current sprite
    **/
    this._getAllAnims = function(){
        var animData = this.srcData.animationData;
        return animData;
    }
    
    /** SpriteImage._getAnimFrameList(String) -> Array
    
    get the array of frame datas for a specific animation
    
    params:
    animName        the name of the animation to get the frame list for
    **/
    this._getAnimFrameList = function(animName){
        assert(this.hasAnimation(animName), "no animation "+animName+
               "for SpriteImage("+this.nickname+")");
               
        var frameList = this._getAllAnims(animName)[animName];
        return frameList;
    }
    
    /** SpriteImage.getCurrFrameMetrics() -> Dictionary **/
    this.getCurrFrameMetrics = function(){
        var frameIndex = this._aniIndex;
        var frameList = this._getAnimFrameList(this.curAnimation);
        assert(frameIndex < frameList.length, "frame index "+frameIndex+
                " out of range for animation '"+this.curAnimation+"'"+
                " in SpriteImage("+this.nickname+")");
        var metrics = frameList[frameIndex];
        // add width/height alternate names for usability
        metrics["width"] = metrics.w;
        metrics["height"] = metrics.h;
        return metrics;
    }
    
    /** SpriteImage.drawTo(canvas context, Number, Number, Number, Number, 
                           Boolean) -> ()
    
    draws the SpriteImage to the given canvas context
    
    params:
    ctx                         the canvas context to draw on
    drawX, drawY                the canvas context coordinates to draw to
    drawWidth, drawHeight       (optional) the dimensions to draw the image as,
                                (defaults to current frame's size)
    showDebug                   (optional) if set to true, will show the 
                                boundaries of the drawn area with a red overlay
                                 - default: false
    **/
    this.drawTo = function(ctx, drawX, drawY, drawWidth, drawHeight, showDebug){
        // round to prevent blurriness
        drawX = Math.round(drawX);
        drawY = Math.round(drawY);
        
        var metrics = this.getCurrFrameMetrics();
        drawWidth = (drawWidth === undefined) ? metrics.width : drawWidth;
        drawHeight = (drawHeight === undefined) ? metrics.height : drawHeight;
        
        assert(typeof(drawWidth) === "number", 
                "attempted to draw SpriteImage("+this.nickname+
                ") to invalid width "+drawWidth);
        assert(typeof(drawHeight) === "number", 
                "attempted to draw SpriteImage("+this.nickname+
                ") to invalid height "+drawHeight);
        drawWidth = Math.round(drawWidth);
        drawHeight = Math.round(drawHeight);
        
        var frame = this.getCurrFrameMetrics();
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
    SpriteImage.drawToScale(canvas context, Number, Number, Number) 
                        -> ()
    params:
    scaleFactor                 how much to magnify the original image by
    **/
    this.drawToScale = function(ctx, drawX, drawY, scaleFactor, showDebug){
        var frame = this.getCurrFrameMetrics();
        var clipWidth = frame.w;
        var clipHeight = frame.h;
        
        var drawWidth = Math.round(clipWidth*scaleFactor)
        var drawHeight = Math.round(clipHeight*scaleFactor)
        this.drawTo(ctx, drawX, drawY, drawWidth, drawHeight, showDebug);
    }
    
    /**
    SpriteImage.next
    **/
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
    
    /** SpriteImage.switchAnimation(String, Boolean) -> ()
    
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
            assert(this.hasAnimation(animationName), 
                   "SpriteImage("+this.srcNickname+") attempted to switch to "+
                   "invalid animation '"+animationName+"'");
            this.curAnimation = animationName;
            this._aniIndex = 0;
        }
    };
    
    this._init(srcNickname);
    //this._init.apply(this, arguments); // commented due to hw1 restriction
}

SpriteImage.sourcesData = {
    // human-readable-nickname array to make this for-loopable to work around
    // not being allowed to forloop through object keys by homework constraints
    "nicknames":["mario", "pipe", "groundBlock", "solidBlock", "brickBlock",
                 "cloud", "bush", "sleep_render", "goomba", "bullet_bill"],
    "mario": {
        "srcPath": "assets/images/supermariobros_mario_sheet_big.png",
        "imgObj": undefined, // overwritten with Image object after preload
        "frameStepDelay": 3,
        "animationData":{
            "default_static":[{x:420,y:0,w:30,h:32}],
            "stand_left":[{x:360,y:0,w:30,h:32}],
            "stand_right":[{x:420,y:0,w:30,h:32}],
            "run_left":[{x:298,y:0,w:32,h:32},
                        {x:239,y:0,w:32,h:32},
                        {x:178,y:0,w:32,h:32}],
            "run_right":[{x:480,y:0,w:32,h:32},
                        {x:539,y:0,w:32,h:32},
                        {x:600,y:0,w:32,h:32}],
            "fall":[{x:0,y:32,w:32,h:32}],
            "jump_left":[{x:58,y:0,w:34,h:32}],
            "jump_right":[{x:718,y:0,w:34,h:32}]
        }
    },
    "groundBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:0,y:0,w:16,h:16}]
        }
    },
    "pipe": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:0,y:128,w:32,h:32}]
        }
    },
    "solidBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:0,y:16,w:16,h:16}]
        }
    },
    "brickBlock": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:16,y:0,w:16,h:16}]
        }
    },
    "cloud": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:0,y:320,w:48,h:32}]
        }
    },
    "bush": {
        "srcPath": "assets/images/tileset.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:176,y:144,w:48,h:16}]
        }
    },
    "sleep_render":{
        "srcPath": "assets/images/sleeping_mario.png",
        "imgObj": undefined,
        "frameStepDelay": 45,
        "animationData":{
            "default_static":[{x:0,y:0,w:97,h:294},
                              {x:111,y:0,w:97,h:294}]
        }
    },
    "goomba":{
        "srcPath": "assets/images/enemies.png",
        "imgObj": undefined,
        "frameStepDelay": 8,
        "animationData":{
            "default_static":[{x:0,y:32,w:32,h:32}],
            "walk":[{x:0,y:32,w:32,h:32},
                    {x:32,y:32,w:32,h:32}],
            "stomped":[{x:32,y:32,w:32,h:32}]
        }
    },
    "bullet_bill":{
        "srcPath": "assets/images/enemies.png",
        "imgObj": undefined,
        "animationData":{
            "default_static":[{x:1152,y:34,w:32,h:28}]
        }
    }
}
