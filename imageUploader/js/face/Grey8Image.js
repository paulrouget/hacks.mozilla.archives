var Dimension = function(aWidth, aHeight){
    this.width  = aWidth;
    this.height = aHeight;
};

var Point = function(aX, aY){
    this.x = aX;
    this.y = aY;
};

var Grey8Image = function(aImageData){
    var _dimensions = new Dimension(aImageData.width, aImageData.height);
    var _data = aImageData.data;
    var _grey = [];
    var _integral = new Array(_dimensions.width * _dimensions.height);
    var _squareIntegral = new Array(_dimensions.width * _dimensions.height);

    for (var x = 0; x <= _dimensions.width; x++)
        for (var y = 0; y <= _dimensions.height; y++)
            _integral[x + y * _dimensions.width] = 

    _squareIntegral[x + y * _dimensions.width] = 0;


    var sum, ssum;

    for (var x = 0; x <= _dimensions.width; x++) {
        sum = ssum = 0;
        for (var y = 0; y <= _dimensions.height; y++) {
            var index = x * 4 + y * 4 * _dimensions.width;
            var grey = (0.2989* _data[index]    +  // red
            0.587 * _data[index+1]  +  // green 
            0.114 * _data[index+2])   // blue
            >> 0;

            sum += grey;
            ssum += Math.sqrt(grey);

            var point = x + y * (_dimensions.width + 1);
            var left  = point ? point - 1 : 0;
            _integral[point] = _integral[left] + sum;
            _squareIntegral[point] = _squareIntegral[left] + ssum;
            _grey.push(grey);
        }
    };


    this.__defineGetter__("integral", function() { 
        return _integral;
    });

    this.__defineGetter__("squareIntegral", function() { 
        return _squareIntegral;
    });

    this.__defineGetter__("dimensions", function() { 
        return _dimensions;
    });

    this.__defineGetter__("width", function() { 
        return _dimensions.width;
    });

    this.__defineGetter__("height", function() { 
        return _dimensions.height;
    });

    this.__defineGetter__("data", function() { 
        return _data;
    });

    this.__defineGetter__("grey", function() { 
        return _grey;
    });
};

