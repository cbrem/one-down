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
        
        this.maxVelX = 8;
        this.maxUpVel = 25;
        this.maxDownVel = this.maxUpVel*(3/4);
        this.gravAccel = 2.5;
        
        this._accelRate = 2;
        this._decelRate = this._accelRate/3;
        
        this._facing = RIGHT_DIR;
        this._canStartJump = true;
    };
    
    this.draw = function(ctx){
        this.sprite.drawTo(ctx, this.x, this.y, this.width, this.height);
    };
    
    // simply a wrapper to call the stored SpriteImage's method
    this.switchAnimation = function(animName){
        this.sprite.switchAnimation(animName);
    }
    
    this._constrainVelocities = function(){
        // constrain velocities
        this.velX = Math.min(this.maxVelX, Math.max(-this.maxVelX, this.velX));
        this.velY = Math.min(this.maxDownVel, Math.max(-this.maxUpVel, this.velY));
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
            var dirName = (this._facing == LEFT_DIR) ? "left" : "right";
            this.sprite.switchAnimation("stand_"+dirName);
        }
    }
    
    this.update = function(mousePresses, heldKeys){
        var holdingLeft = util_keyInDict(LEFT_KEYCODE, heldKeys);
        var holdingRight = util_keyInDict(RIGHT_KEYCODE, heldKeys);
        var holdingSpace = util_keyInDict(SPACE_KEYCODE, heldKeys);
        if(holdingLeft === holdingRight){
            this._applyDecelX();
        }
        else if(holdingLeft){
            this.accelX = -this._accelRate;
            this.sprite.switchAnimation("run_left");
            this._facing = LEFT_DIR;
        }
        else if(holdingRight){
            this.accelX = this._accelRate;
            this.sprite.switchAnimation("run_right");
            this._facing = RIGHT_DIR;
        }
        
        if(holdingSpace){
            if(this._canStartJump){
                this.velY = -this.maxUpVel;
                this.accelY = this.gravAccel;
                this._canStartJump = false;
            }
            else{
                // counteract some of gravity to implement controllable ascent
                this.velY -= this.gravAccel*(2/5);
            }
        }
        
        // temp hardcoded fake collision, use real collision later
        // predict if next movement will cause collision
        if(this.y + this.velY > 600 - this.height - 32){
            this._canStartJump = true;
            this.accelY = 0;
            this.velY = 0;
            this.y = 600 - this.height - 32;
        }
    
        this._updateVelocity();
        this._updatePos();
        this.sprite.nextFrame();
    };
    
    this._init.apply(this, arguments);
};
