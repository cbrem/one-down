function Enemy(type, x, y){
    this._init = function(type, x, y){
        assert(Enemy.types[type] !== undefined, "Enemy type '"+type+
                "' does not exist, check that Enemy.types is formatted properly");
        this.type = type;
        console.log("made Enemy:" + type);
        
        var typeData = Enemy.types[type];
        ["spriteName", "width", "height", "flags"].forEach(function(dataParam){
            assert(typeData[dataParam] !== undefined,
                   "missing parameter "+dataParam+"in data for type "+type);
        });
        
        this.x = x;
        this.y = y;
        this.sprite = new SpriteImage(typeData.spriteName);
        this.width = typeData.width;
        this.height = typeData.height;
        
        this.maxVelX = (typeData.maxVelX !== undefined) ? typeData.maxVelX : 3.5;
        this.maxVelX = Math.abs(this.maxVelX);
        this.maxUpVel = 17;
        this.maxDownVel = this.maxUpVel*(3/4);
        
        this.velX = -this.maxVelX;
        this.velY = 0;
        this.accelX = 0;
        this.gravAccel = 3;
        this.accelY = (typeData.flags.has_gravity) ? this.gravAccel : 0;
        
        
        this.alive = true;
        this.exists = true;
        this.collidable = true;//(typeData.flags.collidable) ? true : false;
        this.harmful = true;
        
        if(this.sprite.hasAnimation("walk_left")){
            this.sprite.switchAnimation("walk_left");
        }
    }
    
    this._updatePos = function(game){
        this.x += this.velX;
        this.y += this.velY;
        
        this.x += game.scrollX;
        this.y += game.scrollY;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    
    this.killDownwardMomentum = function(){
        // kill falling momentum to 
        // prevent player from shooting into ground when walking off surfaces
        // (remember positive y coordinates move down)
        this.velY = Math.min(this.velY, 0);
    }
    
    this._constrainVelocities = function(){
        // constrain velocities
        this.velX = Math.min(this.maxVelX, Math.max(-this.maxVelX, this.velX));
        this.velY = Math.min(this.maxDownVel, Math.max(-this.maxUpVel, this.velY));
    }
    
    this._updateVel = function(game){
        this.velX += this.accelX;
        this.velY += this.accelY;
        
        this._constrainVelocities();
    }
    
    this.draw = function(ctx,showDebug){
        this.sprite.drawTo(ctx, this.x, this.y, this.width, this.height, showDebug);
        this.sprite.nextFrame();
    }
    
    this.update = function(game){
        this._updateVel(game);
        this._updatePos(game);
       
    }
    
    this._init(type, x ,y);
    //this._init.apply(this, arguments); // commented due to hw1 restriction
}

function Enemies(){
    this._init = function(){
        this.enemiesList = [];
    }
    
    this.draw = function(ctx){
        this.enemiesList.forEach(function(enemy){
            enemy.draw(ctx);
        });
    }
    
    this.getAllEnemies = function(){
        return this.enemiesList;
    }
    
    this.pruneEnemies = function(game){
        var preservedEnemies = [];
        var buffer = 50;
        this.enemiesList.forEach(function(enemy){
            if(enemy.exists && 
               -buffer <= enemy.x && enemy.x <= game.width + buffer &&
               -buffer <= enemy.y && enemy.y <= game.height + buffer)
            {
                preservedEnemies.push(enemy);
            }
        });
        this.enemiesList = preservedEnemies;
    }
    
    this.update = function(game){
        this.enemiesList.forEach(function(enemy){
            enemy.update(game);
        });
        this.pruneEnemies(game);
    }
    
    this.addEnemy = function(type, x, y){
        var newEnemy = new Enemy(type, x, y);
        this.enemiesList.push(newEnemy);
    }
    
    this._init();
}


Enemy.types = {
    "spiny":{
        "spriteName": "spiny",
        "width": 32,
        "height": 32,
        "flags":{
            "has_gravity": true,
            "collidable": true
        }
    },
    "bullet_bill":{
        "spriteName": "bullet_bill",
        "width": 32,
        "height": 29,
        "maxVelX": 5,
        "flags":{
        }
    }
}