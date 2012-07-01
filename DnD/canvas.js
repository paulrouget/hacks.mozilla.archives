(function(){
  var extend = {
    defineCrop: function() {
        this.stopDrawing();
        var frame = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var self = this;

        this.updateCrop = function(e) {
            if (!self.isCroping) return;
            var x = e.clientX - self.canvas.offsetLeft -
                self.canvas.offsetParent.offsetLeft + window.pageXOffset -
                self.canvas.clientLeft;
            var y = e.clientY - self.canvas.offsetTop -
                self.canvas.offsetParent.offsetTop + window.pageYOffset -
                self.canvas.clientTop;
            if (!self.org.x) {
                self.org.x = x;
                self.org.y = y;
                return;
            }
            var size = Math.min(Math.abs(self.org.x - x), Math.abs(self.org.y - y));

            if (x > self.org.x)
                x = self.org.x + size;
            else
                x = self.org.x - size;
            if (y > self.org.y)
                y = self.org.y + size;
            else
                y = self.org.y - size;

            var rect = {};
            rect.x0 = Math.min(x, self.org.x);
            rect.x1 = Math.max(x, self.org.x);
            rect.y0 = Math.min(y, self.org.y);
            rect.y1 = Math.max(y, self.org.y);

            self.crop = rect;

            self.putImageData(frame, 0, 0);
            self.fillRect(0, 0, rect.x0, self.canvas.height);
            self.fillRect(rect.x1, 0, self.canvas.width - rect.x1, self.canvas.height);
            self.fillRect(rect.x0, 0, rect.x1 - rect.x0, rect.y0);
            self.fillRect(rect.x0, rect.y1, rect.x1 - rect.x0, self.canvas.height);
            self.strokeRect(rect.x0 - 2, rect.y0 - 2, rect.x1 - rect.x0 + 4,
                            rect.y1 - rect.y0 + 4);
        }

        this.cropDefined = function(e) {
            self.canvas.removeEventListener("mousemove", self.updateCrop, false);
            self.canvas.removeEventListener("mousedown", function() {self.isCroping = true}, false);
            self.canvas.removeEventListener("mouseup", self.cropDefined, false);

            self.drawImage(self.canvas, self.crop.x0, self.crop.y0,
                                        self.crop.x1 - self.crop.x0,
                                        self.crop.y1 - self.crop.y0,
                                        0, 0, self.canvas.width, self.canvas.height);


        }



        var self = this;

        this.strokeStyle = "red";
        this.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.org = {x: null, y: null};
        this.isCroping = false;
        this.canvas.addEventListener("mousemove", this.updateCrop, false);
        this.canvas.addEventListener("mousedown", function() {self.isCroping = true}, false);

        this.canvas.addEventListener("mouseup", self.cropDefined, false);
    },
    startDrawing: function(color) {
        this.fillStyle = color;

        var self = this;
        this.draw = function(e) {
            if (!self.isDrawing) return;
            var x = e.clientX - self.canvas.offsetLeft -
                self.canvas.offsetParent.offsetLeft + window.pageXOffset -
                self.canvas.clientLeft;
            var y = e.clientY - self.canvas.offsetTop -
                self.canvas.offsetParent.offsetTop + window.pageYOffset -
                self.canvas.clientTop;
            self.fillCircle(x, y, self.canvas.width / 15);
        }

        this.isDrawing = false;
        this.canvas.addEventListener("mousemove", this.draw, false);
        this.canvas.addEventListener("mousedown", function() {self.isDrawing = true}, false);
        this.canvas.addEventListener("mouseup", function() {self.isDrawing = false}, false);
    },
    stopDrawing: function() {
        this.canvas.removeEventListener("mousemove", this.draw, false);
        this.canvas.removeEventListener("mousedown", function() {self.isDrawing = true}, false);
        this.canvas.removeEventListener("mouseup", function() {self.isDrawing = false}, false);
    },
    addLabel: function(txt, color) {
        var oldColor = this.fillStyle;
        var canvas = this.canvas;
        this.textAlign = "center";
        this.textBaseline = "bottom";
        var font = 0;
        while (true) {
            this.font = font + "px monospace";
            var m = this.measureText(txt).width;
            if (m > canvas.width || font > canvas.width / 4) {
                font--;
                this.font = font + "px monospace";
                break;
            }
            font++;
        }
        this.fillStyle = color;
        this.fillText(txt, canvas.width / 2,
                           canvas.height, canvas.width);
        this.fillStyle = oldColor;
    },
    bw: function() {
      var frame = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
      for (var i = 0; i < frame.data.length; i += 4) {
        var r = frame.data[i + 0];
        var g = frame.data[i + 1];
        var b = frame.data[i + 2];
        var v = r + g + b;
        v /= 3;
        frame.data[i + 0] = v;
        frame.data[i + 1] = v;
        frame.data[i + 2] = v;
      }
      this.putImageData(frame, 0, 0);
    }
  };

  for(var key in extend)
    CanvasRenderingContext2D.prototype[key] = extend[key];
})();

