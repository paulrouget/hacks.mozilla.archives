var UI = {};

UI.init = function() {
  var usernameField = document.querySelector("#username");
  usernameField.addEventListener("focus", function() {
      if (usernameField.value == "username")
        usernameField.value = "";
  }, true);

  var passwordField = document.querySelector("#password");
  passwordField.addEventListener("focus", function() {
      passwordField.setAttribute("type", "password");
      if (passwordField.value == "password")
        passwordField.value = "";
  }, true);

  var saveButton = document.querySelector("#credentialSave");
  saveButton.addEventListener("click", function() {
      Storage.saveCredential(usernameField.value, passwordField.value);
      UI.closeConfigure();
  }, true);
}

UI.setTransientStatus = function(msg, modal) {
  var p = document.querySelector("#status > p");
  p.innerHTML = msg;

  emile('status', 'top:0px', {
    duration: 600,
    easing: bounce
  });

  if (modal) {
    var veil = document.querySelector("#veil");
    veil.style.display = "block";
  }

  setTimeout(function() {
    emile('status', 'top:-52px', {
      duration: 500,
      after: function() {
        var veil = document.querySelector("#veil");
        veil.style.display = "none";
      }
    });
  }, 3000);
}

UI.setPersistentStatus = function(msg, modal) {
  var p = document.querySelector("#status > p");
  p.innerHTML = msg;

  if (modal) {
    var veil = document.querySelector("#veil");
    veil.style.display = "block";
  }

  emile('status', 'top:0px', {
    duration: 600,
    easing: bounce
  });
}

UI.closeStatus = function() {
  emile('status', 'top:-52px', {
    duration: 500,
    after: function() {
      var veil = document.querySelector("#veil");
      veil.style.display = "none";
    }
  });
}

UI.showConfigure = function(sendWhenIsDone) {
  var veil = document.querySelector("#veil");
  veil.style.display = "block";

  UI.sendWhenIsDone = sendWhenIsDone ? true : false;

  var credential = Storage.getCredential();
  if (credential) {
    var usernameField = document.querySelector("#username");
    var passwordField = document.querySelector("#password");
    usernameField.value = credential.username;
    passwordField.value = credential.password;
    passwordField.setAttribute("type", "password");
  }

  emile('configure', 'top:0px', {
    duration: 600,
    easing: bounce
  });
}

UI.closeConfigure = function() {
  emile('configure', 'top:-87px', {
    duration: 600,
    after: function() {
      var veil = document.querySelector("#veil");
      veil.style.display = "none";
      if (UI.sendWhenIsDone) {
        Twitpic.sendAll();
      }
    }
  });
}


UI.imageClicked = function(e) {
  var canvas = e.target;
  UI.showEditor(canvas);
}

UI.showEditor = function(canvas) {
  Editor.copyCanvas(canvas);
  Editor.orgCanvas = canvas;

  document.getElementById("sidemenuleft").classList.add("disable");

  var comment = document.querySelector("#comment");
  comment.value = canvas.comment ? canvas.comment : "";

  var editor = document.getElementById("editor");

  if (!isMobile) {
    editor.style.top = "0px";
    editor.classList.add("present");
  } else {
    editor.classList.add("present");
  }
}

UI.closeEditor = function(save) {
  document.getElementById("sidemenuleft").classList.remove("disable");

  if (save) {
    Editor.orgCanvas.width = Editor.buffer.width;
    Editor.orgCanvas.height = Editor.buffer.height;
    Editor.orgCanvas.ctx = Editor.orgCanvas.getContext("2d");
    Editor.orgCanvas.ctx.drawImage(Editor.buffer, 0, 0);

    Editor.orgCanvas.classList.remove("portrait");
    Editor.orgCanvas.classList.remove("landscape");
    Editor.orgCanvas.classList.add(Editor.ctx.isPortrait() ? "portrait" : "landscape");

    var comment = document.querySelector("#comment");
    Editor.orgCanvas.comment = comment.value;
    UI.updateTwitterIcon(Editor.orgCanvas);
    UI.centerPreview(Editor.orgCanvas);
    Storage.saveFile(Editor.orgCanvas);
  }

  var editor = document.getElementById("editor");
  editor.classList.remove("present");

  if (!isMobile) {
    var editor = document.querySelector("#editor");
    editor.style.top = "-500px";
    Editor.buffer.width = 20;
    Editor.buffer.height = 20;
  }
}

UI.newThrobber = function(canvas) {
  var throbber = document.createElement("canvas");
  throbber.width = canvas.parentNode.clientWidth;
  throbber.height = canvas.parentNode.clientHeight;
  throbber.classList.add("throbber");
  throbber.ctx = throbber.getContext("2d");

  throbber.ctx.shadowOffsetX = 0;
  throbber.ctx.shadowOffsetY = 0;
  throbber.ctx.shadowBlur = 14;
  throbber.ctx.shadowColor = "white";

  throbber.update = function(percentage) {
    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.8 - 0.8 * percentage / 100)+ ")";
    ctx.fillRect(0, 0, ctx.width, ctx.height);
    ctx.beginPath();
    ctx.arc(ctx.width / 2, ctx.height / 2,
        ctx.width / 6, 0, Math.PI * 2, false);
    ctx.strokeStyle = "rgba(255, 255, 255, 1)";
    ctx.lineWidth = ctx.width / 10 + 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ctx.width / 2, ctx.height / 2,
        ctx.width / 6, -Math.PI / 2, (Math.PI * 2) * (percentage / 100) + -Math.PI / 2, false);
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = ctx.width / 10;
    ctx.stroke();
  };
  throbber.update(0);
  canvas.parentNode.appendChild(throbber);
  return throbber;
}

UI.centerPreview = function(canvas) {
  canvas.style.marginLeft = -(canvas.clientWidth - canvas.parentNode.clientWidth) / 2 + "px";
  canvas.style.marginTop = -(canvas.clientHeight - canvas.parentNode.clientHeight) / 2 + "px";
}

UI.updateTwitterIcon = function(canvas) {
  if (canvas.comment && canvas.comment != "") {
    canvas.parentNode.classList.add("comment");
  } else {
    canvas.parentNode.classList.remove("comment");
  }
}

window.addEventListener("load", function() { UI.init() }, true);
