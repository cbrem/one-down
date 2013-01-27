function Enemy(x, y, type){
    this._init = function(x, y, type){
        assert(Enemy.types[type] !== undefined, "Enemy type '"+type+
                "' does not exist, check that Enemy.types is formatted properly");
        this.type = type;
        
        var typeData = Enemy.types[type];
        ["spriteName", "x", "y"].each(function(dataParam){
            assert(typeData[dataParam] !== undefined,
                   "missing parameter "+dataParam+"in data for type "+type);
        });
        
        this.x = typeData.x;
        this.y = typeData.y;
        this.sprite = new Sprite(typeData.spriteName);
    }
    
    this._init(x ,y, type);
    //this._init.apply(this, arguments); // commented due to hw1 restriction
}

Enemy.types = {
    "goomba":{
        "spriteName": "goomba",
        "width": 16,
        "height": 16
    }
}