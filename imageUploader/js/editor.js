var Editor = {};

Editor.init = function() {
  this.buffer = document.getElementById("buffer");
  this.ctx = this.buffer.getContext("2d");
  this.ctx.initDnD();
}

Editor.copyCanvas = function(canvas) {
  this.buffer.width = canvas.width;
  this.buffer.height = canvas.height;
  this.ctx = this.buffer.getContext("2d");
  this.ctx.drawImage(canvas, 0, 0);
}

Editor.poster = function() {
  var msg = window.prompt("Message?");
  if (msg) this.ctx.poster(msg);
}

window.addEventListener("load", function() { Editor.init() }, true);
