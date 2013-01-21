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
        
        this.maxVel = 4.5;
        this._accelRate = 1.3;
        this._decelRate = this._accelRate/6;
    };
    
    this.draw = function(ctx){
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
    
    this._applyDecelX = function(){
        // to prevent problem of constantly hovering around 0 due to float nums
        var stopBuffer = this._decelRate; 
        // if currently moving right
        if (this.velX > stopBuffer){
            this.accelX = -this._decelRate;
        }
        // if currently moving left
        else if (this.velX < -stopBuffer){
            this.accelX = this._decelRate;
        }
        else{
            this.accelX = this.velX = 0;
        }
    }
    
    this.update = function(mousePresses, heldKeys){
        var holdingLeft = util_keyInDict(LEFT_KEYCODE, heldKeys);
        var holdingRight = util_keyInDict(RIGHT_KEYCODE, heldKeys);
        if(holdingLeft === holdingRight){
            this._applyDecelX();
        }
        else if(holdingLeft){
            this.accelX = -this._accelRate;
        }
        else if(holdingRight){
            this.accelX = this._accelRate;
        }
    
        this._updateVelocity();
        this._updatePos();
        this.sprite.nextFrame();
    };
    
    this._init.apply(this, arguments);
};
