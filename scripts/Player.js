/** Player(Number, Number, Number, Number)

params:
    x           the x-coordinate of the player, relative to the canvas
    y           the y-coordinate of the player, relative to the canvas
    width       the width of the player, as displayed on the canvas
    height      the height of the player, as displayed on the canvas
**/
function Player(){
    this._init = function(x, y, width, height){
        console.log("initializing", this);
        
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sprite = new SpriteImage('mario');
        
        this.velX = 0;
        this.velY = 0;
        this.accelX = 0;
        
        this.gravAccel = 2.5;
        this.accelY = this.gravAccel;
        
        this.maxVelX = 8;
        this.maxUpVel = 24;
        this.maxDownVel = this.maxUpVel*(3/4);
        
        this._accelRate = 2;
        this._decelRate = this._accelRate/3;
        
        this._facing = RIGHT_DIR;
        this._canStartJump = true;
    };
    
    this.destroyReferences = function(){
        // remove references for cleanup
        this.game = undefined;
        this.sprite = undefined;
    }
    
    /** Player.draw(canvas context) -> () 
    **/
    this.draw = function(ctx){
        this.sprite.drawTo(ctx, this.x, this.y, this.width, this.height);
    };
    
    /** Player.switchAnimation(String, Boolean) -> ()
    simply a wrapper to call the stored SpriteImage's method
    **/
    this.switchAnimation = function(animName, forceRestart){
        this.sprite.switchAnimation(animName, forceRestart);
    }
    
    this.getFacingDirName = function(){ 
        return (this._facing == LEFT_DIR) ? "left" : "right";
    }
    
    /** Player._constrainVelocities() -> ()
    **/
    this._constrainVelocities = function(){
        // constrain velocities
        this.velX = Math.min(this.maxVelX, Math.max(-this.maxVelX, this.velX));
        this.velY = Math.min(this.maxDownVel, Math.max(-this.maxUpVel, this.velY));
    }
    
    /** Player._updateVelocity() -> ()
    **/
    this._updateVelocity = function(){
        this.velX += this.accelX;
        this.velY += this.accelY;
        this._constrainVelocities();
    };
    
    this._constrainPositions = function(game){
    }
    
    /** Player._updatePos(game instance) -> ()
    **/
    this._updatePos = function(game){
        this.x += this.velX;
        // scroll with screen
        this.x += game.scrollX;
        
        this.y += this.velY;
        this.y += game.scrollY;
        
        this._constrainPositions(game);
    }
    
    /** Player._applyDecelX() -> ()
    **/
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
    
    this._updateMovementAnim = function(){
        var dirName = (this._facing === LEFT_DIR) ? "left" : "right";
        var baseAnimName;
        if(this._canStartJump === false){
            baseAnimName = "jump";
        }
        else if(this.velX !== 0){
            baseAnimName = "run";
        }
        else{
            baseAnimName = "stand";
        }
        
        var fullAnimName = baseAnimName + "_" + dirName;
        this.switchAnimation(fullAnimName);
    }
    
    this.resetJump = function(){
        this._canStartJump = true;
        this.velY = 0;
    }
    
    /** Player.update(Array, dictionary) -> ()
    **/
    this.update = function(game, mousePresses, heldKeys){
        var holdingLeft = util_keyInDict(LEFT_KEYCODE, heldKeys);
        var holdingRight = util_keyInDict(RIGHT_KEYCODE, heldKeys);
        var holdingSpace = util_keyInDict(SPACE_KEYCODE, heldKeys);
        if(holdingLeft === holdingRight){
            this._applyDecelX();
        }
        else if(holdingLeft){
            this.accelX = -this._accelRate;
            this._facing = LEFT_DIR;
        }
        else if(holdingRight){
            this.accelX = this._accelRate;
            this._facing = RIGHT_DIR;
        }
        
        if(holdingSpace){
            if(this._canStartJump){
                // provide jump boost
                this.velY = -this.maxUpVel;
                this._canStartJump = false;
            }
            else{
                // counteract some of gravity to implement controllable ascent
                this.velY -= this.gravAccel*(2/5);
            }
        }
    
        this._updateMovementAnim();
        this._updateVelocity();
        this._updatePos(game);
        this.sprite.nextFrame();
        console.log(this.x, this.y);
    };
    
    this._init.apply(this, arguments);
};
