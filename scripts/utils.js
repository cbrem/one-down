UP_KEYCODE = 38;
DOWN_KEYCODE = 40;
LEFT_KEYCODE = 37;
RIGHT_KEYCODE = 39;
SPACE_KEYCODE = 32;

/** util_getEventKeycode: (event)

returns the keycode of the given event in a more cross-browser compatible way
**/
function util_getKeyCode(e){
    return (e.key) ? e.key : e.keyCode;
}

/** util_isPageMoveKeyCode: (Number)

checks if this is a key that would move the page when focused on the canvas
**/
function util_isPageMoveKeyCode(keyCode){
    var movementKeys = [UP_KEYCODE, DOWN_KEYCODE, LEFT_KEYCODE,
                        RIGHT_KEYCODE, SPACE_KEYCODE];
    var keyDict = {};
    movementKeys.forEach(function(kc){
        keyDict[kc] = true;
    });
    return keyDict[keyCode] !== undefined;
}

function util_butt(){
    alert('butt');
}