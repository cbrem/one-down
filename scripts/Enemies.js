function Enemy(type, x, y){
    this._init = function(type, x, y){
        assert(Enemy.types[type] !== undefined, "Enemy type '"+type+
                "' does not exist, check that Enemy.types is formatted properly");
        this.type = type;
        
        var typeData = Enemy.types[type];
        ["spriteName", "width", "height"].forEach(function(dataParam){
            assert(typeData[dataParam] !== undefined,
                   "missing parameter "+dataParam+"in data for type "+type);
        });
        
        this.x = x;
        this.y = y;
        this.sprite = new SpriteImage(typeData.spriteName);
        this.width = typeData.width;
        this.height = typeData.height;
        
        this.velX = 1;
        this.velY = 0;
        this.accelX = 0;
        this.gravAccel = 3;
        this.accelY = this.gravAccel;
        
        this.maxVelX = (typeData.maxVelX !== undefined) ? typeData.maxVelX : 3;
        
        this.alive = true;
        this.exists = true;
        
        this.sprite.switchAnimation("walk");
    }
    
    this._updatePos = function(game){
        this.x += this.velX;
        this.y += this.velY;
        
        this.x += game.scrollX;
        this.y += game.scrollY;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    
    this._updateVel = function(game){
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
    "goomba":{
        "spriteName": "goomba",
        "width": 32,
        "height": 32,
        "flags":[]
    }
}