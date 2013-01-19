function Environment () {
    //
    var frames = [
        [
            [],
        ],
        [
            [],
        ],
        [
            [],
        ],
    ];

    this.draw = function () {
        //draw the environment

    };

    //request an environment frame that's 20 blocks by 25 blocks
    //(600 X 750 pixels). Note that this
    this.updateFrames = function () {
        var frameNum = Math.floor(math.random()* frames.length);
        //check if we need a new frame. if so, randomly pick one from frames
    };
}
