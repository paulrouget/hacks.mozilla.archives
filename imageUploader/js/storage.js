var Storage = {};

Storage.init = function() {
  var index = localStorage.getItem("index");
  if (!index) {
    localStorage.setItem("index", JSON.stringify([]));
  }

  this.getFiles();
}

Storage.saveCredential = function(username, password) {
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}

Storage.removeFile = function(id) {
  var index = JSON.parse(localStorage.getItem("index"));

  index.remove(id);

  localStorage.removeItem(id);
  localStorage.removeItem(id + "comment");

  localStorage.setItem("index", JSON.stringify(index));
}


Storage.saveFile = function(canvas) {
  var index = JSON.parse(localStorage.getItem("index"));

  var id = canvas.storageId;
  if (!id) {
    id = "img" + new String(Math.floor(Math.random() * 100000));
    index.push(id);
  }

  localStorage.setItem(id, canvas.toDataURL("image/png"));
  if (canvas.comment)
    localStorage.setItem(id + "comment", canvas.comment);

  canvas.storageId = id;

  localStorage.setItem("index", JSON.stringify(index));
}

Storage.getFiles = function() {
  var index = JSON.parse(localStorage.getItem("index"));
  Files.newInput(index);
}

Storage.getFile = function(id) {
  return localStorage.getItem(id);
}

Storage.getComment = function(id) {
  var comment = localStorage.getItem(id + "comment");
  return comment;
}

Storage.getCredential = function() {
  if (!localStorage.getItem("username")) {
    return null;
  }
  return {username: localStorage.getItem("username"),
          password: localStorage.getItem("password")};
}

window.addEventListener("load", function() { Storage.init() }, true);
