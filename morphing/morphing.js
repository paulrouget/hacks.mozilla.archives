function Morphing(ctx, frame0, frame1, width, height, delaunay) {
    this.frame0 = frame0;
    this.frame1 = frame1;
    this.width = width;
    this.height = height;
    this.delaunay = delaunay;
    this.cache = [];
    this.ctx = ctx;
}

Morphing.prototype.forEachPixels = function(t, tr, apply) {
    // SAFARI
    //var [At, Bt, Ct] = tr.getPointsAtT(t);
    var p = tr.getPointsAtT(t);
    var At = p[0];
    var Bt = p[1];
    var Ct = p[2];

    // Find order of the vertex, top to bottom
    var minY = At;
    if (Bt.y < minY.y) {
        minY = Bt;
    }
    if (Ct.y < minY.y) {
        minY = Ct;
    }

    var maxY = At;
    if (Bt.y > maxY.y) {
        maxY = Bt;
    }
    if (Ct.y > maxY.y) {
        maxY = Ct;
    }


    var middleY;
    if (At != maxY && At!= minY) middleY = At;
    if (Bt != maxY && Bt!= minY) middleY = Bt;
    if (Ct != maxY && Ct!= minY) middleY = Ct;

    minY.y = Math.floor(minY.y);
    maxY.y = Math.ceil(maxY.y);

    // Find the longer line, then the two short ones
    var bigLine = new Line();
    bigLine.initFromCoords(minY, maxY);

    var shortLine1 = new Line();
    shortLine1.initFromCoords(minY, middleY);

    var shortLine2 = new Line();
    shortLine2.initFromCoords(maxY, middleY);

    for (var y = minY.y; y <= maxY.y; y += 1) {

        var x0 = bigLine.getX(y);

        var shortLine;
        if (y < middleY.y) {
            shortLine = shortLine1;
        } else {
            shortLine = shortLine2;
        }
        var x1 = shortLine.getX(y);

        var xLeft = Math.min(x0, x1);
        var xRight = Math.max(x0, x1);

        if (xLeft < 0) xLeft = 0;
        xLeft = Math.floor(xLeft);
        if (xLeft < 0) xLeft = 0;
        xRight = Math.ceil(xRight);
        if (xRight >= this.width) xRight = this.width - 1;

        var pt = new Coords(xLeft, y);

        for (; pt.x <= xRight; pt.x += 1) {
            apply(pt);
        }
    }
}

Morphing.prototype.computeCache = function() {
    var self = this;
    for (var j = 0; j < this.delaunay.triangles.length; j++) {
            var tr = this.delaunay.triangles[j];
            var m11, m12, m21, m22, dx, dy;
            [m11, m12, m21, m22, dx, dy] = this.getTransform(tr, 0, 1000);

            this.forEachPixels(0, tr, function(p0) {
                var x = m11 * p0.x + m21 * p0.y + dx;
                var y = m12 * p0.x + m22 * p0.y + dy;
                var p1 = new Coords(x, y);
                self.normalize(p1);
                if (!self.cache[p0.x]) {
                    self.cache[p0.x] = [];
                }
                self.cache[p0.x][p0.y] = 4 * (p1.x + p1.y * self.width);
            });
    }
}

Morphing.prototype.go = function(steps) {
    var anim = [];

    var d = this.delaunay;
    var height = this.height;
    var width = this.width;

    var delta = 1000 / steps;

    anim.push(this.frame0);
    this.computeCache();

    var self = this;
    for (var i = 1; i < steps; i++) {
        log("Frame " + i + "/" + (steps - 1));
        var t = i * delta;
        var framet = this.ctx.createImageData(this.width, this.height);
        framet.data = anim[i - 1].data.concat();
        anim.push(framet);
        for (var j = 0; j < d.triangles.length; j++) {
            var tr = d.triangles[j];
            var m11, m12, m21, m22, dx, dy;
            [m11, m12, m21, m22, dx, dy] = this.getTransform(tr, t, 0);

            this.forEachPixels(t, tr, function(pt) {
                var i0, it, i1;

                var x = m11 * pt.x + m21 * pt.y + dx;
                var y = m12 * pt.x + m22 * pt.y + dy;
                var p0 = new Coords(x, y);
                self.normalize(p0);

                var i1 = self.cache[p0.x][p0.y];
                if (i1 === undefined) return;

                i0 = 4 * (p0.x + p0.y * self.width);
                it = 4 * (pt.x + pt.y * self.width);

                var r0 = self.frame0.data[i0 + 0];
                var g0 = self.frame0.data[i0 + 1];
                var b0 = self.frame0.data[i0 + 2];

                var r1 = self.frame1.data[i1 + 0];
                var g1 = self.frame1.data[i1 + 1];
                var b1 = self.frame1.data[i1 + 2];

                var delta = t / 1000;
                var rt = r0 + (r1 - r0) * delta;
                var gt = g0 + (g1 - g0) * delta;
                var bt = b0 + (b1 - b0) * delta;

                framet.data[it + 0] = Math.floor(rt);
                framet.data[it + 1] = Math.floor(gt);
                framet.data[it + 2] = Math.floor(bt);
                framet.data[it + 3] = 255;
            });
        }
    }
    anim.push(this.frame1);
    return anim;
}

Morphing.prototype.normalize = function(p) {
    p.x = Math.floor(p.x);
    p.y = Math.floor(p.y);

    if (p.x < 0) p.x = 0;
    if (p.y < 0) p.y = 0;

    if (p.x >= this.width) p.x = this.width - 1;
    if (p.y >= this.height) p.y = this.height - 1;
}

Morphing.prototype.getTransform = function(tr, t0, t1) {
    /* SAFARI
    var [A0, B0, C0] = tr.getPointsAtT(t0);
    var [A1, B1, C1] = tr.getPointsAtT(t1);
    */

    var p = tr.getPointsAtT(t0);
    var A0 = p[0];
    var B0 = p[1];
    var C0 = p[2];

    p = tr.getPointsAtT(t1);
    var A1 = p[0];
    var B1 = p[1];
    var C1 = p[2];


    var denom = A0.x * (C0.y - B0.y) - B0.x * C0.y + C0.x * B0.y + (B0.x - C0.x) * A0.y;
    if (denom == 0) {
        throw("denom == 0");
    }
    var m11 = - (A0.y * (C1.x - B1.x) - B0.y * C1.x + C0.y * B1.x + (B0.y - C0.y) * A1.x) / denom;
    var m12 = (B0.y * C1.y + A0.y * (B1.y - C1.y) - C0.y * B1.y + (C0.y - B0.y) * A1.y) / denom;
    var m21 = (A0.x * (C1.x - B1.x) - B0.x * C1.x + C0.x * B1.x + (B0.x - C0.x) * A1.x) / denom;
    var m22 = - (B0.x * C1.y + A0.x * (B1.y - C1.y) - C0.x * B1.y + (C0.x - B0.x) * A1.y) / denom;
    var dx = (A0.x * (C0.y * B1.x - B0.y * C1.x) + A0.y * (B0.x * C1.x - C0.x * B1.x) + (C0.x * B0.y - B0.x * C0.y) * A1.x) / denom;
    var dy = (A0.x * (C0.y * B1.y - B0.y * C1.y) + A0.y * (B0.x * C1.y - C0.x * B1.y) + (C0.x * B0.y - B0.x * C0.y) * A1.y) / denom;

    return([m11, m12, m21, m22, dx, dy]);
}

