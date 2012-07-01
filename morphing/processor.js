if (this["importScripts"]) {
    // We are in a Worker
    importScripts("delaunay.js", "morphing.js", "geometry.js");
    importScripts("../resources/js/array.js", "../resources/js/math.js");
    importScripts("../resources/js/log.js", "../resources/js/time.js");
}

onmessage = function(event) {
    var args = event.data;
    var area = args.area;
    var points = args.points;
    var frame0 = args.frame0;
    var frame1 = args.frame1;
    var d = delaunay(points, area);
    var steps = args.steps;

var ctx = args.ctx;
    var m = new Morphing(ctx, frame0, frame1, area.width, area.height, d);
    var anim = m.go(steps);
    postMessage(anim);
}

function delaunay(points, area) {
    var topleft = new Coords(0, 0);
    var topright = new Coords(area.width - 1, 0);
    var bottomleft = new Coords(0, area.height - 1);
    var bottomright = new Coords(area.width - 1, area.height - 1);

    var topleftPoint = new TPoint();
    var toprightPoint = new TPoint();
    var bottomleftPoint = new TPoint();
    var bottomrightPoint = new TPoint();

    topleftPoint.setCoordinates(0, topleft);
    topleftPoint.setCoordinates(1000, topleft);

    toprightPoint.setCoordinates(0, topright);
    toprightPoint.setCoordinates(1000, topright);

    bottomleftPoint.setCoordinates(0, bottomleft);
    bottomleftPoint.setCoordinates(1000, bottomleft);

    bottomrightPoint.setCoordinates(0, bottomright);
    bottomrightPoint.setCoordinates(1000, bottomright);

    var t0 = new TTriangle(topleftPoint, toprightPoint, bottomleftPoint);
    var t1 = new TTriangle(bottomrightPoint, toprightPoint, bottomleftPoint);

    d = new Delaunay(500, [t0, t1]);

    for (var i = 0; i < points.length; i++) {
        var p0 = points[i].src;
        var p1 = points[i].dest;
        var newPoint = new TPoint();
        newPoint.setCoordinates(0, new Coords(p0.x, p0.y));
        newPoint.setCoordinates(1000, new Coords(p1.x, p1.y));

        d.addPoint(newPoint);
    }
    return d;
}

