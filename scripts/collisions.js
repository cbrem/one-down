// checks collisions
function collisions() {
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
		if ((y1 < y2) && (y2 < y1+h1)) {top = true;}
		// bottom side of 2 is inside 1
		if ((y1 < y2+h2) && (y2+h2 < y1+h1)) {bottom = true;}
    // right side of 2 is inside 1
  	if ((x1 < x2+w2) && (x2+w2 < x1+w1)) {right = true;}
  	// left side of 2 is inside 1
  	if ((x1 < x2) && (x2 < x1+w1)) {left = true;}
  	// return what is overlapped
  	if (top && bottom && left && right) {return "2 inside 1";}
  	else if (top && left && right) {return "top collide";}
  	else if (bottom && left && right) {return "bottom collide";}
  	else if (left && top && bottom) {return "left collide";}
  	else if (right && top && bottom) {return "right collide";}
  	else if (top && left) {return "topleft collide";}
  	else if (top && right) {return "topright collide";}
  	else if (bottom && left) {return "bottomleft collide";}
  	else if (bottom && right) {return "bottomright collide";}
  	else {return "no collision";}
  }

  // takes player and "uncollides" him with an obstacle
  // parameters are the overlap string and 
  // the object's location and dimensions
  function unOverlap(overlap,ox,oy,ow,oh) {
  	// side collisions-make the sides flush
  	if (overlap === "bottom collide") {player.y = oy-player.h;}
  	else if (overlap === "right collide") {player.x = ox-player.w;}
  	else if (overlap === "top collide") {player.y = oy+oh;}
  	else if (overlap === "left collide") {player.x = ox+ow;}
  	// if corner collisions, move player above or below object
  	else if (overlap === "topleft collide" ||
  					 overlap === "topright collide") {player.y = oy;}
  	else if (overlap === "bottomleft collide" ||
  					 overlap === "bottomright collide") {player.y = oy-player.h}
  	else // assume player is inside object, move it above the object
  	  {player.y = oy-player.h;}
  }

  this.collide = function() {
	  env = environmentList //replace!!!
	  // iterate through each environment object
	  // and check for collisions
	  for (var i = 0; i < env.length; i++) {
	  	envObj = env[i];
	  	overlap = getOverlap(envObj.x,envObj.y,envObj.w,envObj.h,
	  										player.x,player.y,player.w,player.h);
	  	if (overlap !== "no overlap")
	  	  {
	  	  	if (envObj.enemy = true)
	  	  		{} //gameover
	  	  	else //object is an obstacle, move player out of obstacle
	  	  	  {unOverlap(overlap,envObj.x,envObj.y,envObj.w,envObj.h);}
	  	  }
		}
	}

}