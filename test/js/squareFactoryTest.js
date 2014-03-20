
test("squareFactory - square.getDiv", function() {
    var square = tlol.squareFactory
                     .buildSquare(5, 5, tlol.tSpec.s_right().getCSSClass());
    var expected = document.createElement("div");
    expected.className = "square SSHP_R";
    expected.style.left = "160px";
    expected.style.top = "160px";
    expected.setAttribute("buffer", "false");
    var actual = square.getDiv();
    deepEqual(actual, expected, "div clone");

    square = tlol.squareFactory
                 .buildSquare(0, 0, tlol.tSpec.s_right().getCSSClass());
    actual = square.getDiv();
    notDeepEqual(actual, expected, "div with different position");

    square = tlol.squareFactory
                 .buildSquare(5, 5, tlol.tSpec.s_left().getCSSClass());
    actual = square.getDiv();
    notDeepEqual(actual, expected, "div with different CSS class");

    square = tlol.squareFactory
                 .buildSquare(7, 8, "unknownCssClass");
    expected = "square unknownCssClass";
    actual = square.getDiv().className;
    equal(actual, expected, "div with unknown CSS class");

});

test("squareFactory - square.setX", function() {
    var square = tlol.squareFactory
                     .buildSquare(-1, -1, tlol.tSpec.t().getCSSClass());
    square.setX(16);
    var expected = 16;
    var actual = square.getX();
    equal(actual, expected, "set x to 16");

    expected = 16 * (31 + 1); /* This corresponds to tlol.square_size */
    actual = parseInt(square.getDiv().style.left);
    equal(actual, expected, "x to pixels 512");
});

test("squareFactory - square.setY", function() {
    var square = tlol.squareFactory
                     .buildSquare(-1, -1, tlol.tSpec.t().getCSSClass());
    square.setY(16);
    var expected = 16;
    var actual = square.getY();
    equal(actual, expected, "set y to 16");

    expected = 16 * (31 + 1); /* This corresponds to tlol.square_size */
    actual = parseInt(square.getDiv().style.top);
    equal(actual, expected, "y to pixels 512");
});

test("squareFactory.buildSquare", function() {
    throws(function () { tlol.squareFactory.buildSquare(-1, -1); }, 
           "Square throws TypeError, invalid cssClass");

    var buildSquare = tlol.squareFactory.buildSquare;
    var cssClass = tlol.tSpec.square().getCSSClass();

    var sqr = buildSquare(0, 0, cssClass);
    strictEqual(sqr.getX(), 0);
    strictEqual(sqr.getY(), 0);

    sqr = buildSquare(-1, -1, cssClass);
    strictEqual(sqr.getX(), 0);
    strictEqual(sqr.getY(), 0);

    var sqr1 = buildSquare(2, 3, cssClass);
    var sqr2 = buildSquare(2, 3, cssClass);
    equal(sqr1.getX(), sqr2.getX(), "sqr1, sqr2 same x");
    equal(sqr1.getY(), sqr2.getY(), "sqr1, sqr2 same y");
    deepEqual(sqr1.getDiv(), sqr2.getDiv(), "sqr1, sqr2 same div");
    ok(sqr1.isEqual(sqr2), "sqr1 same as sqr2");
});

/* EOF */