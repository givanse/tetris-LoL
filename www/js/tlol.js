/**
 * Application namespace, everything is contained here.
 *
 * The properties defined as null are actually defined in a file of their own
 * that has the same name as the property.
 */
var tlol = {
    tetrisGame: null,                                        /* tetrisGame.js */
    gameLoopService: null,                              /* gameLoopService.js */
    tetrominoFactory: null,                            /* tetrominoFactory.js */
    squareFactory: null,                                  /* squareFactory.js */
    util: null,                                                    /* util.js */
    browser: null,                                              /* browser.js */
    ui: null,                                                        /* ui.js */

    settings: {
        board: {
            /* Based on Tetris guidelines. */
            total_columns: 10, 
            total_rows: 20,
            /* div#canvasFrame border width */
            border_width: {top: 14, rigth: 7, bottom: 42, left: 7},
            safety_net_width: 3, /* give room for possible unprecisions */
            square_border_w: 1
        },
        dropSpeedPerMov: 30,                                            /* ms */
        doubleTapTreshold: 300,                                         /* ms */
        gameSpeed: 1000,                                  /* 1 row per second */                              
        gameSpeedMax: 333,                                 /* 1/3 of a second */                       
        initFillPercentagePerRow: 0.5,
        longSwipeLength: 200,                                       /* pixels */
        numRowsRandomlyInit: 2,
        rowFadeOutTime: 0.4,                                       /* seconds */
        speedIncrement: 50,                                   /* 50 ms faster */                           
        splashDuration: 1000,                                           /* ms */
        square_border_w: null,                  /* tlol.calculateDimensions() */
        square_size: null,                      /* tlol.calculateDimensions() */
        targetTimeForMaxSpeed: 1000 * 60 * 3           /* 3 min for max speed */
    },

    cssClass: {
        mushroom: 'MUSHROOM'
    },

    debug: {
        show_game_over_splash: false
    },

    /**
     * http://en.wikipedia.org/wiki/Tetromino
     */

    /**
     * Singleton list of Tetromino Specifications.
     *
     * All the shapes share at least one position in common, which is set to be
     * the coordinate (0, 0).
     */
    tetrominoSpecs: (function () {
        'use strict';

        /**
         * Builds a Tetromino Specification object.
         */
        function buildTSpec(cssClass, baseCoords) {

            var tSpec = {
                getCSSClass: function () { return cssClass; },
                getBaseCoords: function (indx) {
                    return baseCoords[indx];
                }
            };

            return tSpec;
        }

        var tSpecs = [];

        /* http://harddrop.com/wiki/File:SRS-pieces.png */

        /**
         *   0 1 2 3  0 1 2 3 0 1 2 3 0 1 2 3
         * 0              x             x
         * 1 x x x x      x             x
         * 2              x   x x x x   x
         * 3              x             x
         */
        var baseCoords = [
            [[0, 1], [1, 1], [2, 1], [3, 1]],
            [[2, 0], [2, 1], [2, 2], [2, 3]],
            [[0, 2], [1, 2], [2, 2], [3, 2]],
            [[1, 0], [1, 1], [1, 2], [1, 3]]
        ];
        tSpecs.push(buildTSpec('LINESHP', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0   a b     d a     c d     b c
         * 1   d c     c b     b a     a d
         * 2
         * 3
         */
        baseCoords = [
            [[1, 0], [2, 0], [2, 1], [1, 1]],
            [[2, 0], [2, 1], [1, 1], [1, 0]],
            [[2, 1], [1, 1], [1, 0], [2, 0]],
            [[1, 1], [1, 0], [2, 0], [2, 1]]
        ];
        tSpecs.push(buildTSpec('SQUARESHP', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0   x       x               x
         * 1 x x x     x x   x x x   x x
         * 2           x       x       x
         * 3
         */
        baseCoords = [
            [[0, 1], [1, 0], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 1]],
            [[0, 1], [1, 1], [1, 2], [2, 1]],
            [[0, 1], [1, 0], [1, 1], [1, 2]]
        ];
        tSpecs.push(buildTSpec('TSHP', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0   x x     x             x
         * 1 x x       x x     x x   x x
         * 2             x   x x       x
         * 3
         */
        baseCoords = [
            [[0, 1], [1, 0], [1, 1], [2, 0]],
            [[1, 0], [1, 1], [2, 1], [2, 2]],
            [[0, 2], [1, 1], [1, 2], [2, 1]],
            [[0, 0], [0, 1], [1, 1], [1, 2]]
        ];
        tSpecs.push(buildTSpec('SSHP_R', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0 x x         x             x
         * 1   x x     x x   x x     x x
         * 2           x       x x   x
         * 3
         */
        baseCoords = [
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[1, 1], [1, 2], [2, 0], [2, 1]],
            [[0, 1], [1, 1], [1, 2], [2, 2]],
            [[0, 1], [0, 2], [1, 0], [1, 1]]
        ];
        tSpecs.push(buildTSpec('SSHP_L', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0 x         x x             x
         * 1 x x x     x     x x x     x
         * 2           x         x   x x
         * 3
         */
        baseCoords = [
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 0]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[0, 2], [1, 0], [1, 1], [1, 2]]
        ];
        tSpecs.push(buildTSpec('LSHP_R', baseCoords));

        /**
         *   0 1 2 3 0 1 2 3 0 1 2 3 0 1 2 3
         * 0     x     x             x x
         * 1 x x x     x     x x x     x
         * 2           x x   x         x
         * 3
         */
        baseCoords = [
            [[0, 1], [1, 1], [2, 0], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 1], [0, 2], [1, 1], [2, 1]],
            [[0, 0], [1, 0], [1, 1], [1, 2]]
        ];
        tSpecs.push(buildTSpec('LSHP_L', baseCoords));

        return tSpecs;

    })(), /* tetrominoSpecs */

    /**
     * It just provides a convinient access method for the different
     * Tetromino specifications. Instead of doing:
     *   tlol.tetrominoSpecs[0]
     * You can do:
     *   tlol.tSpec.line()
     */
    tSpec: {
        line: function () {
            'use strict';
            return tlol.tetrominoSpecs[0];
        },
        square: function () {
            'use strict';
            return tlol.tetrominoSpecs[1];
        },
        t: function () {
            'use strict';
            return tlol.tetrominoSpecs[2];
        },
        s_right: function () {
            'use strict';
            return tlol.tetrominoSpecs[3];
        },
        s_left: function () {
            'use strict';
            return tlol.tetrominoSpecs[4];
        },
        l_right: function () {
            'use strict';
            return tlol.tetrominoSpecs[5];
        },
        l_left: function () {
            'use strict';
            return tlol.tetrominoSpecs[6];
        }
    },

    /**
     * Movement directions.
     */
    direction: {
        DOWN: 'DOWN',
        DROP: 'DROP',
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
        UP: 'UP'
    },

    /**
     * Board's row states.
     */
    row: {
        EMPTY: 'ROW_EMPTY',
        FULL: 'ROW_FULL',
        USED: 'ROW_USED'
    },

    /**
     * Calculate Canvas and Squares dimensions based on screen size.
     *
     * Documentation:
     *     doc/canvas.html
     *     test/js/tlolTest.html
     */
    calculateDimensions: function (screen_width, screen_height) {

        if ( ! screen_width  || screen_width <= 0 ||
             ! screen_height || screen_height <= 0) {
            this.square_size = 0;
            return {
                square_size: 0,
                canvas_width: 0,
                canvas_height: 0
            };
        
        }

        stt = this.settings.board;

        /* horizontal space */
        var canvas_width = screen_width - 
                           stt.border_width.left - 
                           stt.border_width.rigth -
                           (2 * stt.safety_net_width);
        var square_borders_space_w = (stt.square_border_w * 
                                     stt.total_columns) +
                                     stt.square_border_w;
        var available_canvas_width = canvas_width - square_borders_space_w; 
        var px_per_square_w = Math.floor( available_canvas_width / 
                                          stt.total_columns );
        /* after rounding a few pixels were lost, adjust: */
        canvas_width = (px_per_square_w * stt.total_columns) + 
                        square_borders_space_w;

        /* vertical space */
        var canvas_height = screen_height - 
                            stt.border_width.top - 
                            stt.border_width.bottom -
                            (2 * stt.safety_net_width);
        var square_borders_space_h = (stt.square_border_w * 
                                     stt.total_rows) +
                                     stt.square_border_w;
        var available_canvas_height = canvas_height - square_borders_space_h;
        var px_per_square_h = Math.floor( available_canvas_height / 
                                          stt.total_rows );
        /* after rounding a few pixels were lost, adjust: */
        canvas_height = (px_per_square_h * stt.total_rows) + 
                         square_borders_space_h;
        
        /* choose the guiding dimension, the one with the smaller square size */
        var square_size = null;
        if ( px_per_square_w < px_per_square_h ) {
            square_size = px_per_square_w;

            /* width guides, height follows */ 
            canvas_height = (square_size * stt.total_rows) + 
                             square_borders_space_h;
        } else {
            square_size = px_per_square_h;

            /* height guides, width follows */
            canvas_width = (square_size * stt.total_columns) + 
                            square_borders_space_w;
        }

        var dimensions = {
            square_size: square_size,
            canvas_width: canvas_width,
            canvas_height: canvas_height
        };

        this.settings.square_size = dimensions.square_size;
        this.settings.square_border_w = stt.square_border_w;

        return dimensions;
    } /* calculateDimensions */

}; /* tlol */

/* EOF */
