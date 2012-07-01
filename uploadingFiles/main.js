var dropbox, preview;

function init() {
    preview = document.getElementById("preview");
    dropbox = document.getElementById("dropbox");
    window.addEventListener("dragenter", dragenter, true);
    window.addEventListener("dragleave", dragleave, true);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}

function dragenter(e) {
    e.preventDefault();
    dropbox.setAttribute("dragenter", true);
}

function dragleave(e) {
    dropbox.removeAttribute("dragenter");
}

function dragover(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    var dt = e.dataTransfer;
    var files = dt.files;
    dropbox.removeAttribute("dragenter");

    handleFiles(files);
}

function handleFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;

        if (!file.type.match(imageType)) continue;

        var img = document.createElement("img");
        img.classList.add("obj");
        img.file = file;
        preview.appendChild(img);
        var reader = new FileReader();
        reader.onloadend = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
        reader.readAsDataURL(file);
    }

}

function FileUpload(img, bin) {
    this.ctrl = createThrobber(img);
    var xhr = new XMLHttpRequest();

    var self = this;
    xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                self.ctrl.update(percentage);
            }
    }, false);

    xhr.upload.addEventListener("load", function(e){
            self.ctrl.update(100);
                var canvas = self.ctrl.ctx.canvas;
                canvas.parentNode.removeChild(canvas);
            }, false);

    xhr.open("POST", "../resources/webservices/devnull.php");
    xhr.overrideMimeType('text/plain; charset=x-user-defined-binary');
    xhr.sendAsBinary(bin);
}

function sendFiles() {
    var imgs = document.querySelectorAll(".obj");
    for (var i = 0; i < imgs.length; i++) {
        var reader = new FileReader();
        reader.onloadend = (function(aImg) { return function(e) { new FileUpload(aImg, e.target.result); }; })(imgs[i]);
        reader.readAsBinaryString(imgs[i].file);
    }

}

function createThrobber(img) {
    var x = img.x;
    var y = img.y;

    var canvas = document.createElement("canvas");
    preview.appendChild(canvas);
    canvas.width = img.width;
    canvas.height = img.height;
    var size = Math.min(canvas.height, canvas.width);
    canvas.style.top = y + "px";
    canvas.style.left = x + "px";
    canvas.classList.add("throbber");
    var ctx = canvas.getContext("2d");
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "15px monospace";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 14;
    ctx.shadowColor = "white";

    var ctrl = {};
    ctrl.ctx = ctx;
    ctrl.update = function(percentage) {
        var ctx = this.ctx;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, " + (0.8 - 0.8 * percentage / 100)+ ")";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2,
                size / 6, 0, Math.PI * 2, false);
        ctx.strokeStyle = "rgba(255, 255, 255, 1)";
        ctx.lineWidth = size / 10 + 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2,
                size / 6, -Math.PI / 2, (Math.PI * 2) * (percentage / 100) + -Math.PI / 2, false);
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.lineWidth = size / 10;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.baseLine = "middle";
        ctx.textAlign = "center";
        ctx.font = "10px monospace";
        ctx.fillText(percentage + "%", ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
    ctrl.update(0);
    return ctrl;
}

window.addEventListener("load", init, true);
