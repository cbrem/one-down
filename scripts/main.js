window.onload = function(){    
    var canvas = document.getElementById("gamecanvas");
    var ctx = canvas.getContext("2d");
    var testImg = new Image();
    testImg.onload = function(){
        var spriteImage = new SpriteImage(testImg);
        var chicken = new Sprite(100,5, 100, 100, spriteImage);
        chicken.drawTo(ctx);
    }
    testImg.src = 'assets/images/chik2.png';
}