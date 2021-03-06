/******************************************************************************
 *
 * Tetris game singleton object.
 *
 *****************************************************************************/

tlol.tetrisGame = (function() {

    /* Gives access to the ID of the interval used by the gameLoopService. */
    var loopService = null;
    var boardController = null;
    var gameInfoController = null;
    /* The user hasn't lost yet and can perform actions. */
    var arePlayerActionsAllowed = true;
    var dom = null;

    /**
     * Changes the state of the game to finished.
     * Deal here with any variables or objects that need to be reset or changed to
     * the defaults used when a new game is started.
     */
    var endGame = function() {
        arePlayerActionsAllowed = false;
        if ( gameInfoController ) {
            gameInfoController.removeNextTetromino();
        }
        if ( loopService ) {
            loopService.stop();
        }
    }; /* endGame */

    /**
     * This is where all the magic happens. It is the function executed as the 
     * callback passed to the gameLoopService object when the game is started in
     * function initialize().
     *
     * This callback is designed to be called by the gameLoopService without
     * any arguments (defaults to tlol.direction.DOWN). In the case of user
     * events it can be called specifying any direction.
     *
     * @movementDirection - Optional parameter. It is the movement direction
     *                      that the falling shape will follow.
     */
    var run = function (movementDirection) {

        if ( ! arePlayerActionsAllowed ) {
            return;
        }

        movementDirection = ( movementDirection === tlol.direction.DROP ||
                              movementDirection === tlol.direction.LEFT ||
                              movementDirection === tlol.direction.RIGHT ||
                              movementDirection === tlol.direction.UP ) ? 
                              movementDirection : tlol.direction.DOWN;

        var tMoveSuccessful = boardController.moveTetromino(movementDirection);

        /* up, right, down, left success */
        if ( tMoveSuccessful ) {
            var currTetromino = boardController.getCurrentTetromino();
            var nextTetromino = boardController.getNextTetromino();

            var numRowsDrawDelay = 2;
            // TODO: farthestTraveled incorrect if the user rotates
            var farthestTraveled = currTetromino.getRows()[0];
            if ( farthestTraveled > numRowsDrawDelay ) {
                // TODO: optimize, dont clear and redraw each time, clear once
                gameInfoController.removeNextTetromino();
                gameInfoController.appendNextTetromino(nextTetromino);
            }

            return;
        }

        /** 
         * Couldn't move downward anymore. The falling tetromino 
         * collisioned with the bottom line / squares.
         */
        if ( ! tMoveSuccessful &&
             movementDirection === tlol.direction.DOWN ) { 

            boardController.insertFallingTetromino();
            gameInfoController.increaseScore(); 
            var currTetromino = boardController.getCurrentTetromino();
            var candidateRows = currTetromino.getRows();
            var deletedRowsCount = boardController.deleteCompletedRows(candidateRows);
            gameInfoController.addDeletedRowsScorePoints(deletedRowsCount);

            /* Prepare the next Tetromino. */
            var isNextTetroValid = boardController.useNextTetromino();
            if ( ! isNextTetroValid ) {         /* Check if the game is over. */
                endGame();
                dom.gameoverSplash.style.display = 'block';
                return;
            }
            return;
        }

    }; /* run */

    var initialize = function (newDOM) {
        endGame();

        if ( newDOM ) {
            dom = newDOM;
        }

        if ( ! dom ||
             ! dom.canvasBackground ||
             ! dom.canvas || 
             ! dom.nextTetrominoField ||
             ! dom.scoreField || 
             ! dom.gameoverSplash ) {
            throw {
                name: "TypeError",
                message: "A DOM element is missing."
            };
        }

        arePlayerActionsAllowed = true;

        var screen_width = tlol.browser.getWidth();
        var screen_height = tlol.browser.getHeight();
        boardController = new Board(dom.canvasBackground, dom.canvas,
                                    screen_width, screen_height);
        gameInfoController = new GameInfoController(dom.scoreField, 
                                                    dom.nextTetrominoField);

        dom.gameoverSplash.style.display = tlol.debug.show_game_over_splash ? 
                                                                           'block' : 'none';
        tlol.gameLoopService.setGameRunCallback( run ); 
        loopService = tlol.gameLoopService.getLoopHandle();
    }; /* initialize */

    /* Public interface */
    var tetrisGame = {
        initialize: initialize,
        start: function () { 
            loopService.start(); 
        },
        restart: function () {
            initialize();
            loopService.start(); 
        }
    };

    return tetrisGame;

})(); /* tetrisGame */

/* EOF */
