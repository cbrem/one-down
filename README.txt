15-237 Spring 2013 Hw1
Project name: 1-Down
Group:

- Connor Brem (cbrem)
- Erik Pintar (epintar)
- Leon Zhang (lwzhang)

How to play the game:

1-Down is a Mario-themed runner game similar to games like 
Canabalt (http://armorgames.com/play/4457/canabalt) where the
point of the game is to keep up with the camera by jumping
pits and avoiding slowing obstacles. 

Movement is controlled by the arrow keys, and jumping is 
controlled by the space bar. Controllable jump height is
implemented, so holding down the space bar causes the player to
jump higher.

The game can also be paused by pressing P and restarted by pressing R.


Week 1 Ideas and Implementations:
- Javascript Objects:
   - objects are utilized heavily in the game, and most things
     in the game are objects with appropriate methods
   - for example: SpriteImage objects have several image handling
     methods and attributes, while the player has its own 
     set of methods and attributes
- Callback functions
   - callbacks are utilized in the form of the bound functions 
     to keypress/up events
   - callbacks are also utilized in the creation of a preloader
     that loads in images for sprites and waits for all images
     to download before drawing to the canvas
- Optional parameters: used to provide more flexible interfaces
  to object methods
- Canvas: Well, the whole game is canvas-based, so....


Sources:
All spritesheets from SpritersResource (http://spriters-resource.com/)
Sleeping Paper Mario: http://tinyurl.com/a7aj4ru