(function(){
  XMLHttpRequest.prototype.sendCanvas = function(params) {
    var BOUNDARY = "---------------------------1966284435497298061834782736";
    var rn = "\r\n";

    var req = "--" + BOUNDARY;


    for (var i in params) {
      req += rn + "Content-Disposition: form-data; name=\"" + i + "\"";
      if (typeof params[i] != "string") {
        var canvas = params[i];
        var url = canvas.toDataURL("image/png");
        var base64 = url.substr(url.indexOf(",") + 1);
        var bin = window.atob(base64);
        req += "; filename=\"fromcanvas.png\"" + rn + "Content-type: image/png";

        req += rn + rn + bin + rn + "--" + BOUNDARY;
      } else {
        req += rn + rn + params[i] + rn + "--" + BOUNDARY;
      }
    }
    req += "--";

    this.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + BOUNDARY);
    this.sendAsBinary(req);
  };
})();

