var Twitpic = {};

Twitpic.init = function() {
}

Twitpic.sendAll = function() {
  var credential = Storage.getCredential();
  if (!credential) {
    UI.showConfigure(true);
    return;
  }

  var images = document.querySelectorAll("#previews > div > canvas");
  for (var i = 0; i < images.length; i++) {
    this.sendOne(images[i], credential);
  }
}

Twitpic.sendOne = function(canvas, credential) {
  var ctrl = UI.newThrobber(canvas);

  var xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", (function(aCtrl) {return function(e) {
      if (e.lengthComputable) {
          var percentage = Math.round((e.loaded * 100) / e.total);
          aCtrl.update(percentage);
      }
  }})(ctrl), false);

  xhr.upload.addEventListener("load", (function(aCtrl) {return function(e) {
      aCtrl.update(100);
      var canvas = aCtrl.ctx.canvas;
      var div = canvas.parentNode;
      div.removeChild(canvas);
      emile(div, 'width: 0px', {
        duration: 500,
        after: function() {
          Files.remove(div.firstChild);
        }
      });
  }})(ctrl), false);

  xhr.upload.addEventListener("error", function(e) {
          alert("Upload Error");
  }, false);


  var params = {};
  params["username"] = credential.username;
  params["password"] = credential.password;
  params["media"] = canvas;

  if (canvas.comment && canvas.comment != "") {
    params["message"] = canvas.comment;
    xhr.open("POST", "http://twitpic.com/api/uploadAndPost");
  } else {
    xhr.open("POST", "http://twitpic.com/api/upload");
  }

  xhr.sendCanvas(params);
}

window.addEventListener("load", function() { Twitpic.init() }, true);
