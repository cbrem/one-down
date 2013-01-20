/**
params:
    x           the x-coordinate of the player, relative to the canvas
    y           the y-coordinate of the player, relative to the canvas
**/
function Player(x, y, width, height){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.sprite = new SpriteImage('chik2');
    
    this.velX = 0;
    this.velY = -5;
    this.accelX = 0.3;
    this.accelY = 0.3;
    this.maxVel = 5;
    
    this.draw = function(ctx){
        this.sprite.drawTo(ctx, this.x, this.y, this.width, this.height);
    };
    
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
    
    this.update = function(mousePresses, keyPresses){
        this._updateVelocity();
        this._updatePos();
    };
}