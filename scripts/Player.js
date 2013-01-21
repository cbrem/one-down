/**
params:
    x           the x-coordinate of the player, relative to the canvas
    y           the y-coordinate of the player, relative to the canvas
**/
function Player(x, y, width, height){
    this._init = function(x, y, width, height){
        console.log("initializing",this);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = new SpriteImage('mario');
        
        this.velX = 0;
        this.velY = 0;
        this.accelX = 0;
        this.accelY = 0;
        this.maxVel = 5;
    };
    
    this.draw = function(ctx){
        // FIX THIS: does not match new scaleFactor implementation of 
        // SpriteImage.drawTo
        this.sprite.drawTo(ctx, this.x, this.y, 2);
    };
    
    // simply a wrapper to call the stored SpriteImage's method
    this.switchAnimation = function(animName){
        this.sprite.switchAnimation(animName);
    }
    
    this._constrainVelocities = function(){
        var maxPosVel = this.maxVel;
        var minNegVel = -this.maxVel;
        // constrain velocities
        this.velX = Math.min(maxPosVel, Math.max(minNegVel, this.velX));
        this.velY = Math.min(maxPosVel, Math.max(minNegVel, this.velY));
    }
    
    this._updateVelocity = function(){
        this.velX += this.accelX;
        this.velY += this.accelY;
        this._constrainVelocities();
    };
    
    this._updatePos = function(){
        this.x += this.velX;
        this.y += this.velY;
    }
    
    this.update = function(mousePresses, heldKeys){
        this._updateVelocity();
        this._updatePos();
        this.sprite.nextFrame();
       
    };
    
    this._init.apply(this, arguments);
};
