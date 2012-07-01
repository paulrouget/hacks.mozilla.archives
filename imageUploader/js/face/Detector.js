// GNU General Public License
// @Author Karthik Tharavaad <karthik_tharavaad@yahoo.com>


const SCALE = 20.0;

var Detector = {
    _grey8Image:null,
    _dimensions:null,
    _integral: null,

    initialize: function(aCanvas){
        this._grey8Image  = new Grey8Image(aCanvas);
        this._dimensions  = this._grey8Image.dimensions;
        this._integral    = this._calculateIntegral(this._grey8Image.data);
    },

    _calculateIntegral: function(someData){
        var width   = this._dimensions.width;
        var height  = this._dimensions.height;

        var imageIntegral        = new Array(width * height);
        var squareImageIntegral  = new Array(width * height);

        for(var i=0 ; i<= width ; i++)
            imageIntegral[i] = squareImageIntegral[i] = 0;

        var rowsum, rowsum2;
        for (var x=0 ; x<=width ; x++) {
            imageIntegral[x*height]  = 0;
            squareImageIntegral[x*height] = 0;
            rowsum = rowsum2 = 0;
            for (var y=0 ; y<=height ; y++) {
                var index = x*4 + y * 4 * width;
                var grey  = ((0.2989* someData[index] +
                            0.587 * someData[index+1] +
                            0.114 * someData[index+2]) >> 0);

                rowsum += grey;
                rowsum2 += grey*grey;

                var left      = x ? (x-1) + y * (width+1) : 0;
                var ii_this   = x + y * (width+1);
                imageIntegral[ii_this] = imageIntegral[left] + rowsum;
                squareImageIntegral[ii_this] = squareImageIntegral[left] + rowsum2;
            }
        }
        return {ii: imageIntegral, sii: squareImageIntegral};
    },

    find: function(aMaxSize, aMinSize, aFactor, aMaxCount) {
        var imageIntegral = this._integral.ii;
        var squareImageIntegral = this._integral.sii;
        var width = this._dimensions.width;
        var height= this._dimensions.height;

        var [scaleWidth,scaleHeight]  = [width/SCALE, height/SCALE];
        var startScale = Math.min(scaleHeight, scaleWidth);

        var startScale = aMaxSize / SCALE;
        var limit = aMinSize / SCALE;

        var result = [];

        for(var scale = startScale ; scale > limit ; scale *= aFactor){
            var w = Math.round(SCALE*scale) ; //square detector
            var endx = width - w - 1;
            var endy = height - w - 1;
            var step = Math.round(Math.max(scale, 2));
            var inv_area = 1 / (w*w);

            for(var y = 0; y < endy ; y += step){
                for(var x = 0; x < endx ; x += step){
                    var found = this.detectOnSubImage(
                        x, y, scale,
                        imageIntegral,
                        squareImageIntegral,
                        w, width+1, inv_area);
                    if (found) {
                        result.push({x: x, y: y, w: w});
                        if (aMaxCount != 0 && aMaxCount == result.length)
                            return result;

                    }
                }
            }
        }
        return result;
    },

    detectOnSubImage: function(aX, aY, aScale, aImageIntegral, aSquareImageIntegral, w, iiw, inv_area){
        var mean = (aImageIntegral[ (aY + w) * iiw + aX + w ] +
        aImageIntegral[ aY * iiw + aX ] -
        aImageIntegral[ (aY + w) * iiw + aX ] -
        aImageIntegral[ aY * iiw + aX + w ]) * inv_area;

        var vnorm =  (aSquareImageIntegral[ (aY+w) * iiw + aX + w ] +
        aSquareImageIntegral[ aY * iiw + aX ] -
        aSquareImageIntegral[ (aY+w) * iiw + aX ] -
        aSquareImageIntegral[ aY * iiw + aX + w ])* inv_area - (mean*mean);

        vnorm = vnorm > 1 ? Math.sqrt(vnorm) : 1;

        for(var i = 0; i < FaceData.length; i++){
                if(!this._doStage(FaceData[i], aScale, aX, aY, aImageIntegral, aSquareImageIntegral, iiw, inv_area, vnorm))
                    return false;
        }
        return true;
    },

    _doStage: function(aStage, aScale, aX, aY, aImageIntegral, aSquareImageIntegral, iiw, inv_area, vnorm){
        var trees     = aStage[0];
        var threshold = aStage[1];
        var sum = 0;

        for (var i=0 ; i < trees.length ; i++) {
            var tree = trees[i];
            var node = tree[0];

            while(node){
                var vals = node[0];
                var [nodeThreshold, leftval, rightval, leftidx, rightidx] =
                [vals[0],       vals[1], vals[2],  vals[3], vals[4] ];
                var rectSum = this._computeRect(node[1], aScale, aX, aY, aImageIntegral, iiw) * inv_area;

                node = null;
                if (rectSum >= (nodeThreshold * vnorm)){
                    if (rightidx == -1) sum += rightval;
                    else node = tree[rightidx];
                }
                else {
                    if (leftidx == -1) sum += leftval;
                    else node = tree[leftidx];
                }
            }
        }

        if(sum < threshold)
        return false;

        return true;
    },

    _computeRect: function(aRects, aScale, aX, aY, aImageIntegral, iiw){
        var sum = 0;
        for(var i=0 ; i < aRects.length ; i++){
            var rect = aRects[i];
            var rx = (rect[0] * aScale + aX)>>0;
            var ry = (rect[1] * aScale + aY)>>0;
            var rw = (rect[2] * aScale)>>0;
            var rh = (rect[3] * aScale)>>0;
            var wt = rect[4];

            sum +=  (aImageIntegral[ (ry+rh)*iiw + rx + rw ]    +
                     aImageIntegral[ ry * iiw + rx ]            -
                     aImageIntegral[ (ry+rh) * iiw + rx ]       -
                     aImageIntegral[ ry * iiw + rx + rw ]
                    ) * wt;
        }
        return sum;
    }
};
