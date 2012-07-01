var MAX_SIZE;
var MAX_FILES = 6;

var operationCount = 0;

var Files = {};

Files.newInput = function(files) {
  MAX_SIZE = isMobile ? 400 : 600;
  var currentFilesCount = document.querySelectorAll("#previews > div").length;
  var allowedFilesCount = MAX_FILES - currentFilesCount;
  allowedFilesCount = Math.min(allowedFilesCount, files.length);

  if (allowedFilesCount <= 0) return;

  setTimeout(function() {
    for (var i = 0; i < allowedFilesCount; i++) {
      var file = files[i];
      var imageType = /image.*/;

      if (!file && (typeof(file) != "string") && !file.type.match(imageType)) {
        operationCount--;
        if (operationCount == 0) {
          UI.closeStatus();
        }
        continue;
      }

      if (typeof(file) != "string") {
        var reader = new FileReader();
        reader.onload = (function(aFile) {return function(e) {
            Files.resize(e.target.result, true, null);
        }})(file);
        reader.readAsDataURL(file);
      } else {
        Files.resize(Storage.getFile(file), false, file);
      }
    }
  }, 1000);

  operationCount = allowedFilesCount;
  UI.setPersistentStatus("Loading and resizing files", true);
}

Files.resize = function(url, save, id) {
  var img = document.createElement("img");
  img.style.display = "none";
  document.body.appendChild(img);


  img.addEventListener("load", function(e) {
      var ratio = 1;

      if (img.width > MAX_SIZE || img.height > MAX_SIZE) {
        var size = Math.max(img.width, img.height);
        ratio = MAX_SIZE / size;
      }

      var canvas = document.createElement("canvas");
      var div = document.createElement("div");
      div.setAttribute("draggable", "true");
      div.addEventListener("dragstart", function(e) {DnD.makePreviewDraggable(e)}, true);
      div.addEventListener("drag", function(e) {DnD.previewIsBeingDragged(e)}, true);
      div.addEventListener("dragend", function(e) {DnD.previewHasBeenDragged(e)}, true);
      div.appendChild(canvas);
      canvas.addEventListener("click", function(e) {UI.imageClicked(e)}, true);

      var previews = document.querySelector("#previews");
      previews.appendChild(div);
      document.body.classList.add("imagesPresent");

      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.ctx = canvas.getContext("2d");
      canvas.ctx.save();
      canvas.ctx.scale(ratio, ratio);
      canvas.ctx.drawImage(img, 0, 0);
      canvas.ctx.restore();

      canvas.classList.add(canvas.ctx.isPortrait() ? "portrait" : "landscape");

      if (save) {
        Storage.saveFile(canvas);
      } else {
        canvas.storageId = id;
        canvas.comment = Storage.getComment(id);
        UI.updateTwitterIcon(canvas);
      }

      UI.centerPreview(canvas);

      document.body.removeChild(img);
      operationCount--;
      if (operationCount == 0) {
        UI.closeStatus();
      }
  }, true);
  img.src = url;
}

Files.remove = function(canvas) {
  var div = canvas.parentNode;
  Storage.removeFile(div.firstChild.storageId);
  var previews = div.parentNode;
  previews.removeChild(div);
  if (!previews.hasChildNodes()) {
    document.body.classList.remove("imagesPresent");
  }
}

Files.removeFromTash = function(div) {
  if (!div) return;
  var previews = document.querySelector("#previews");
  div.classList.remove("dragged");
  var trashbox = document.querySelector("#trashbox");
  trashbox.classList.remove("empty");
  trashbox.appendChild(div);

  emile("sidemenuright", 'right: -150px', {
    duration: 300,
    after: function() {
      Storage.removeFile(div.firstChild.storageId)
      trashbox.removeChild(div);
      trashbox.classList.add("empty");
      if (!previews.hasChildNodes()) {
        document.body.classList.remove("imagesPresent");
      }
      emile("sidemenuright", "right: 0px;", {
        duration: 700,
        easing: bounce
      });
    }
  });
}
