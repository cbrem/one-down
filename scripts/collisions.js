// checks collisions
function Collisions() {
  var env;
  var i;
  var envObj;

  // returns the string of which corner of 2 is inside 1
  function getOverlap(x1,y1,w1,h1,x2,y2,w2,h2) {
  	var top = false;
  	var bottom = false;
  	var left = false;
  	var right = false;
		// top side of 2 is inside 1
		if ((y1 <= y2) && (y2 <= y1+h1)) {top = true;}
		// bottom side of 2 is inside 1
		if ((y1 <= y2+h2) && (y2+h2 <= y1+h1)) {bottom = true;}
    // right side of 2 is inside 1
  	if ((x1 <= x2+w2) && (x2+w2 <= x1+w1)) {right = true;}
  	// left side of 2 is inside 1
  	if ((x1 <= x2) && (x2 <= x1+w1)) {left = true;}
  	// return what is overlapped
  	if (top && bottom && left && right) {return "2 inside 1";}
  	else if (top && left && right) {return "top collide";}
  	else if (bottom && left && right) {return "bottom collide";}
  	else if (left && top && bottom) {return "left collide";}
  	else if (right && top && bottom) {return "right collide";}
    // add edge case (LITERALLY)
  	else if (top && left) {return "topleft collide";}
  	else if (top && right) {return "topright collide";}
  	else if (bottom && left) {return "bottomleft collide";}
  	else if (bottom && right) {return "bottomright collide";}
  	else {return "no collision";}
  }

  // takes player and "uncollides" him with an obstacle
  // parameters are the overlap string and 
  // the object's location and dimensions
  function unOverlap(player,overlap,ox,oy,ow,oh) {
    //console.log(overlap);
    if (overlap === "no collision") {return;}
  	// side collisions-make the sides flush
  	else if (overlap === "bottom collide") {player.y = oy-player.height;}
  	else if (overlap === "right collide") {player.x = ox-player.width;}
  	else if (overlap === "top collide") {player.y = oy+oh;}
  	else if (overlap === "left collide") {player.x = ox+ow;}

  	// CORNER COLLISIONS (pretty complicated.)
  	else if (overlap === "topleft collide") {
      var xCollGap = (ox + ow) - player.x;
      var yCollGap = (oy + oh) - player.y;
      // if top left is mostly on top, move player down
      if (xCollGap > yCollGap) {player.y = oy+oh;}
      // if bottom left is mostly on left, move player right
      else {player.x = ox + ow;}
    } 
    else if (overlap === "topright collide") {
      var xCollGap = (player.x + player.width) - ox;
      var yCollGap = (oy + oh) - player.y;
      // if top right is mostly on top, move player down
      if (xCollGap > yCollGap) {player.y = oy+oh;}
      // if bottom right is mostly on right, move player left
      else {player.x = ox - player.width}
    } 
  	else if (overlap === "bottomleft collide") {
      var xCollGap = (ox + ow) - player.x;
      var yCollGap = (player.y + player.height) - oy;
      // if bottom left is mostly on top, move player up
      if (xCollGap > yCollGap) {player.y = oy-player.height;}
      // if bottom left is mostly on left, move player right
      else {player.x = ox + ow;}
    }
  	else if (overlap === "bottomright collide") {
      var xCollGap = (player.x + player.width) - ox;
      var yCollGap = (player.y + player.height) - oy;
      // if bottom right is mostly on top, move player up
      if (xCollGap > yCollGap) {player.y = oy-player.height;}
      // if bottom right is mostly on the right, move player left
      else {player.x = ox-player.width;}
    }
  	else {
      // assume player is inside object, move it above the object
      console.log("INSIDE COLLISION, PROBABLY BAD NEWS!!!");
  	  player.y = oy-player.height;
    }
    var isBottom = overlap.indexOf("bottom") !== -1;
    var isTop = overlap.indexOf("top") !== -1
    var isLeft = overlap.indexOf("left") !== -1
    var isRight = overlap.indexOf("right") !== -1
    // reset ability to jump if they have a resetJump function defined
    if(player.resetJump !== undefined && isBottom){
        player.resetJump();
    }
    else if(player.abortJump !== undefined && isTop){
        player.abortJump();
    }
  }

  this.collide = function(player,env,game) {
    assert(typeof(player.x) === "number" && typeof(player.y) === "number" &&
            typeof(player.height) === "number" && typeof(player.width) === "number");
	  // iterate through each environment object
	  // and check for collisions
    //console.log('    !!collision check!!')
	  for (var i = 0; i < env.length; i++) {
	  	envObj = env[i];

	  	overlap = getOverlap(envObj.x,envObj.y,envObj.width,envObj.height,
	  										player.x,player.y,player.width,player.height);
	  	if ((overlap !== "no collision") && envObj.collidable)
	  	  {
          // enemy collision
          if (envObj.enemy) {/*something bad*/}
          // if player is falling and collides with a non-enemy
          else if (game.falling) {
            console.log("HEY I SHOULD LAND");
            // they should land
            game.falling = false;
          }
	  	  	else //object is an obstacle, move player out of obstacle
	  	  	  {unOverlap(player,overlap,envObj.x,envObj.y,envObj.width,envObj.height);}
	  	  }
		}
	}

}
