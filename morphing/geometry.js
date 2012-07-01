// Coords

function Coords(x, y) {
    this.x = x;
    this.y = y;
}

Coords.prototype.distance = function(c) {
    with (Math) {
        return sqrt(
             square(this.x - c.x) +
             square(this.y - c.y));
    }
}

Coords.prototype.toString = function() {
    var txt = "";
    txt += "(" + this.x + ", " + this.y + ")";
    return txt;
}

// TPoint

function TPoint() {
    this._coords = [];
    this.triangles = [];
}

TPoint.prototype.toString = function() {
    return this.getCoordinates(0).toString();
}

TPoint.prototype.setCoordinates = function(t, c) {
    this._coords[t] = c;
}

TPoint.prototype.getCoordinates = function(t) {
    if (!this._coords[0] || !this._coords[1000]) {
        throw ("TPoint::getCoordinates: can't compute temporal coordinates");
    }
    if (!this._coords[t]) {
        var x0 = this._coords[0].x;
        var y0 = this._coords[0].y;

        var x1 = this._coords[1000].x;
        var y1 = this._coords[1000].y;

        var xt = x0 + (x1 - x0) * t / 1000;
        var yt = y0 + (y1 - y0) * t / 1000;
        this._coords[t] = new Coords(xt, yt);
    }
    return this._coords[t];
}

// TTriangle

function TTriangle(p0, p1, p2) {
    this._p0 = p0;
    this._p1 = p1;
    this._p2 = p2;

    this.adjacents = [];
    this._circle = [];
    //
    // Edge 0
    for (var i = 0; i < p0.triangles.length; i++) {
        var triangle = p0.triangles[i];
        if (triangle === this) continue;
        if (this.isAdjacent(triangle)) this.addAdjacentTriangle(triangle);
    }
    // Edge 1
    for (var i = 0; i < p1.triangles.length; i++) {
        var triangle = p1.triangles[i];
        if (triangle === this) continue;
        if (this.isAdjacent(triangle)) this.addAdjacentTriangle(triangle);
    }
    // Edge 2
    for (var i = 0; i < p2.triangles.length; i++) {
        var triangle = p2.triangles[i];
        if (triangle === this) continue;
        if (this.isAdjacent(triangle)) this.addAdjacentTriangle(triangle);
    }

    p0.triangles.push(this);
    p1.triangles.push(this);
    p2.triangles.push(this);
    this.computeCircle(0);
    this.computeCircle(1000);
}

TTriangle.prototype.toString = function() {
    var txt = "";
    txt += this._p0.toString();
    txt += " / " + this._p1.toString();
    txt += " / " + this._p2.toString();
    return txt;
}

TTriangle.prototype.getCircle = function(t) {
    if (!this._circle[t]) {
        this.computeCircle(t);
    }
    return this._circle[t];
}

TTriangle.prototype.getPoints = function() {
    return [this._p0, this._p1, this._p2];
}

TTriangle.prototype.getPointsAtT = function(t) {
    return [
            this._p0.getCoordinates(t),
            this._p1.getCoordinates(t),
            this._p2.getCoordinates(t)
           ];
}

TTriangle.prototype.isStable = function(t, adj) {
    var o = this.findOppositePoint(adj);
    o = o.getCoordinates(t);
    var rv;

    var circle = this.getCircle(t);
    var d = o.distance(circle.center);
    rv = (d >= circle.radius);
    return rv;
}

TTriangle.prototype.computeCircle = function (t) {
    var x1, x2, x3, y1, y2, y3;

    x1 = this._p0.getCoordinates(t).x;
    x2 = this._p1.getCoordinates(t).x;
    x3 = this._p2.getCoordinates(t).x;

    y1 = this._p0.getCoordinates(t).y;
    y2 = this._p1.getCoordinates(t).y;
    y3 = this._p2.getCoordinates(t).y;

    var xc, yc;
    var a = x2 - x1;
    var b = y2 - y1;
    var c = x3 - x2;
    var d = y3 - y2;
    var x12 = (x1 + x2) / 2;
    var y12 = (y1 + y2) / 2;
    var x23 = (x2 + x3) / 2;
    var y23 = (y2 + y3) / 2;
    if (a * d - b * c == 0) {
        throw("Aligned points: " + this._p0 + ", " + this._p1 + ", " + this._p2);
    }

    if (b == 0 ) {
        xc = x12;
        yc = y23 - (xc - x23) * c / d;
    } else {
        if (d == 0) {
            xc = x23;
            yc = y12 - (xc - x12) * a / b;
        } else {
            xc = (y23 - y12 + c * x23 / d - a * x12 / b) / (c / d - a / b);
            yc = y23 - (xc - x23) * c/d;
        }
    }

    var circle = {};
    circle = {};
    circle.center = new Coords(xc, yc);
    circle.radius = this._p0.getCoordinates(t).distance(circle.center);
    this._circle[t] = circle;
}

TTriangle.prototype.addAdjacentTriangle = function(triangle) {
    if (this.adjacents.indexOf(triangle) == -1) {
        this.adjacents.push(triangle);
        if (triangle.adjacents.indexOf(this) == -1) {
            triangle.adjacents.push(this);
        }
    }
    if (this.adjacents.length  > 3 || triangle.adjacents.length > 3) {
        throw("TTriangle::addAdjacentTriangle: Adjacents.length > 3");
    }
}

TTriangle.prototype.isAdjacent = function(adj) {
    var count = 0;
    var thisPoints = this.getPoints();
    var adjPoints = adj.getPoints();

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            if (thisPoints[i] === adjPoints[j]) {
                count++;
            }
        }
    }

    if (count == 2) return true;
    if (count == 3) throw("TTriangle::isAdjacent same triangle");

    return false;
}

TTriangle.prototype.doesInclude = function(t, p) {
    var a, b, c;
    [a, b, c] = this.getPointsAtT(t);
    p = p.getCoordinates(t);

    var _isLeft = function(p1, p2, newp) {
        return ((p2.x - p1.x) * (newp.y - p1.y) - (newp.x - p1.x) * (p2.y - p1.y));
    }
    var rv = 
        (_isLeft(c, a, p) * _isLeft(c, a, b) > 0) &&
        (_isLeft(a, b, p) * _isLeft(a, b, c) > 0) &&
        (_isLeft(c, b, p) * _isLeft(c, b, a) > 0);
    return rv;
}

TTriangle.prototype.findOppositePoint = function(adj) {
    var o;
    var thisPoints = this.getPoints();
    var adjPoints = adj.getPoints();

    for (var i = 0; i < adjPoints.length; i++) {
        if (adjPoints[i].triangles.indexOf(this) == -1) {
            o = adjPoints[i];
            break;
        }
    }
    if (!o) {
        throw("TTriangle::findOppositePoint: We were supposed to find an opposite point.");
    }
    return o;
}

// Line

function Line() {
    this.vertical = false;
}

Line.prototype.initFromCoords = function(p0, p1) {
    this.p0 = p0;
    this.p1 = p1;
    if (p0.x == p1.x) {
        this.vertical = true;
        this.b = p0.x;
        return;
    }
    this.a = (p0.y - p1.y) / (p0.x - p1.x);
    this.b = p0.y - this.a * p0.x;
}

Line.prototype.getX = function(y) {
    if (this.vertical) return this.b;
    return (y - this.b) / this.a
}
