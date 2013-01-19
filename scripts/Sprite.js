/** SpriteImage: (Image)
    handles the graphics for a sprite (ex: drawing and animation frame handling)
    
    params:
    srcImgObj       the Image object that will be the source of this SpriteImage
                    (must already be preloaded)
**/
function SpriteImage(srcImgObj){
    this._showDebug = true;

    assert(srcImgObj instanceof Image, "SpriteImage not given Image");
    assert(srcImgObj.complete, "SpriteImage source not preloaded");
    this._srcImgObj = srcImgObj;
    
    /* for spritesheet animations, unfinished for now and
       hardcoded to do static images only */
    this._clipX = 0;
    this._clipY = 0;
    this._clipWidth = srcImgObj.width;
    this._clipHeight = srcImgObj.height;
    this._animations = [];
    
    /** SpriteImage.drawTo: (canvas context, Number, Number)
    
    draws the SpriteImage to the given canvas context
    
    params:
    ctx             the canvas context to draw on
    drawX, drawY    the canvas context coordinates to draw to
    **/
    this.drawTo = function(ctx, drawX, drawY, drawWidth, drawHeight){
        // round to get prevent blurriness
        drawX = Math.round(drawX);
        drawY = Math.round(drawY);
        drawWidth = Math.round(drawWidth);
        drawHeight = Math.round(drawHeight);
        ctx.drawImage(this._srcImgObj, 
                      this._clipX, this._clipY, 
                      this._clipWidth, this._clipHeight,
                      drawX, drawY, drawWidth, drawHeight
                     );
        
        if(this._showDebug === true){
            ctx.save();
            ctx.fillStyle = "rgba(255,0,0,0.5)";
            ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
        }
    };    
}

/**
    Sprite: (Number, Number, SpriteImage)
    
    handles the actual object that a sprite represents and its data
    (ex: position, velocity, etc)
    
   params: 
     xPos               the world x coordinate of the left side of the sprite
     yPos               the world y coordinate of the top side of the sprite
     width              the width this sprite will display as
     height             the height this sprite will display as
     spriteImg       the SpriteImage instance to use as the source of this 
                     sprite's graphics
**/
function Sprite(xPos, yPos, width, height, spriteImg){
    assert(spriteImg instanceof SpriteImage, "Sprite not given SpriteImage");
    this.spriteImg = spriteImg;
    
    this.xPos = xPos;
    this.yPos = yPos;
    
    this.width = width;
    this.height = height;
    
    this.xVel = 0;
    this.yVel = 0;
    this.xAccel = 0;
    this.yAccel = 0;
    
    this.update = function(clicks, keyPresses){
        console.log("no update function specified for", this);
    }

    /** Sprite.drawTo: (canvas context, Number, Number)
    
        draws the Sprite object onto the given canvas
        
        params:
        ctx             the canvas context to draw on
        drawX, drawY    the canvas context coordinates to draw to
        
        if drawX/drawY aren't given, they default to the Sprite's 
        world coordinates
    **/
    this.drawTo = function(ctx, drawX, drawY){
        if(drawX === undefined){
            drawX = this.xPos;
        }
        if(drawY === undefined){
            drawY = this.yPos;
        }
        
        // call the image handler's drawing function
        this.spriteImg.drawTo(ctx, drawX, drawY, this.width, this.height);
    }
}