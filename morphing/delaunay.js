// Delaunay structure
function Delaunay(t, triangles) {
    this.triangles = triangles;
    this.unstable = [];
    this.time = t;
}

Delaunay.prototype.destructTriangle = function(triangle) {
    var p0, p1, p2;
    [p0, p1, p2] = triangle.getPoints();

    p0.triangles.remove(triangle);
    p1.triangles.remove(triangle);
    p2.triangles.remove(triangle);

    var adj0, adj1, adj2;
    [adj0, adj1, adj2] = triangle.adjacents;

    function updateAdjacents(a) {
        if (!a) return;
        a.adjacents.remove(triangle);
    }
    updateAdjacents(adj0);
    updateAdjacents(adj1);
    updateAdjacents(adj2);

    this.unstable.remove(triangle);
    this.triangles.remove(triangle);
    delete(triangle);
}

Delaunay.prototype.addPoint = function(p) {
    for (var i = 0; i < this.triangles.length; i++) {
        var triangle = this.triangles[i];
        if (triangle.doesInclude(this.time, p)) {
            var p0, p1, p2;
            [p0, p1, p2] = triangle.getPoints();

            this.destructTriangle(triangle);

            var t0 = new TTriangle(p0, p1, p);
            this.triangles.push(t0);

            var t1 = new TTriangle(p1, p2, p);
            this.triangles.push(t1);

            var t2 = new TTriangle(p0, p2, p);
            this.triangles.push(t2);

            this.unstable.push(t0);
            this.unstable.push(t1);
            this.unstable.push(t2);
            break;
        }
    }

    while (this.unstable.length != 0) {
        var triangle = this.unstable[0];

        var adj0 = triangle.adjacents[0];
        if (adj0 && !triangle.isStable(this.time, adj0)) {
            this.fix(triangle, adj0);
            continue;
        }

        var adj1 = triangle.adjacents[1];
        if (adj1 && !triangle.isStable(this.time, adj1)) {
            this.fix(triangle, adj1);
            continue;
        }

        var adj2 = triangle.adjacents[2];
        if (adj2 && !triangle.isStable(this.time, adj2)) {
            this.fix(triangle, adj2);
            continue;
        }
        this.unstable.splice(0, 1);
    }
}

Delaunay.prototype.isValid = function() {
    for (var i = 0; i < this.triangles.length; i++) {
        var triangle = this.triangles[i];
        var adj0 = triangle.adjacents[0];
        if (adj0 && !triangle.isStable(this.time, adj0)) {
            return false;
        }

        var adj1 = triangle.adjacents[1];
        if (adj1 && !triangle.isStable(this.time, adj1)) {
            return false;
        }

        var adj2 = triangle.adjacents[2];
        if (adj2 && !triangle.isStable(this.time, adj2)) {
            return false;
        }
    }
    return true;
}

Delaunay.prototype.fix = function(triangle0, triangle1) {
    var oppositePointT0 = triangle0.findOppositePoint(triangle1);
    var oppositePointT1 = triangle1.findOppositePoint(triangle0);

    var mutualPoint0;
    var mutualPoint1;

    if (triangle1._p0 === oppositePointT0) {
        mutualPoint0 = triangle1._p1;
        mutualPoint1 = triangle1._p2;
    }
    if (triangle1._p1 === oppositePointT0) {
        mutualPoint0 = triangle1._p0;
        mutualPoint1 = triangle1._p2;
    }
    if (triangle1._p2 === oppositePointT0) {
        mutualPoint0 = triangle1._p0;
        mutualPoint1 = triangle1._p1;
    }

    this.destructTriangle(triangle0);
    this.destructTriangle(triangle1);

    var nT0 = new TTriangle(oppositePointT0, oppositePointT1, mutualPoint0);
    this.triangles.push(nT0);

    var nT1 = new TTriangle(oppositePointT0, oppositePointT1, mutualPoint1);
    this.triangles.push(nT1);

    this.unstable.push(nT0);
    this.unstable.push(nT1);

    return [nT0, nT1];
}
