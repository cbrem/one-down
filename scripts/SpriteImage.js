/** SpriteImage: (Image)
    handles the graphics for a sprite (ex: drawing and animation frame handling)
    (note: images must have been preloaded before using this class)
    
    params:
    srcNickname       the human readable nickname for the image
                      (must be one of the nicknames in the sourcesData)
**/
function SpriteImage(srcNickname){
    this._init = function(srcNickname){
        this.nickname = srcNickname;
        var srcData = SpriteImage.sourcesData[srcNickname];
        assert(srcData != undefined, 
               "invalid sprite name: "+srcNickname);
        this.srcData = srcData;
        var srcImgObj = this.srcData.imgObj;
        
        assert(srcImgObj !== undefined, "SpriteImage: no Image set for " + this.nickname);
        assert(srcImgObj instanceof Image, "SpriteImage: not given Image object");
        assert(srcImgObj.complete, "SpriteImage: source not preloaded");
        
        /* sets up sprite with default "static" animation */
        this.curAnimation = "static";
        this._aniIndex = 0;
        
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
        assert(animData !== undefined, 
               "missing animations for "+this.nickname);
        return animData;
    }
    
    this._getAnimFrameList = function(animName){
        assert(this._hasAnimation(animName), "no animation "+animName+
               "for SpriteImage("+this.nickname+")");
               
        var frameList = this._getAllAnims(animName)[animName];
        assert(frameList instanceof Array,
               "invalid animation data for '"+animName+"'"+
               " in SpriteImage("+this.nickname+")")
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
        
        var frame = this._getCurrFrame();
        var clipX = frame.x;
        var clipY = frame.y;
        var clipWidth = frame.w;
        var clipHeight = frame.h;
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
    
    this.nextFrame = function(){
        var frameList = this._getAnimFrameList(this.curAnimation);
        var newIndex = this._aniIndex + 1;
        // wrap around here
        if (newIndex >= frameList.length)
            {newIndex = 0;}
        this._aniIndex = newIndex;
    };
    
    this.switchAnimation = function(animationName){
        this.curAnimation = animationName;
        this._aniIndex = 0;
    };
    
    this._init.apply(this, arguments);
}

SpriteImage.sourcesData = {
    // arrays to make this for-loopable to work around not being allowed to 
    // forloop through object keys by homework constraints
    "nicknames":["mario"],
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