var dropbox;
function init() {
    window.addEventListener("dragenter", dragenter, true);
    dropbox = document.getElementById("dropbox");
    window.addEventListener("dragleave", dragleave, true);
    dropbox.addEventListener("dragover", dragover, true);
    dropbox.addEventListener("drop", drop, true);
}

function dragenter(e) {
    dropbox.setAttribute("dragenter", true);
}

function dragleave(e) {
    dropbox.removeAttribute("dragenter");
}

function dragover(e) {
    e.preventDefault();
}

function drop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    e.preventDefault();

    if (files.length == 0) {
        handleData(dt);
        return;
    }

    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        handleFile(file);
    }
}

function handleData(dt) {
    var bag = document.getElementById("bag");

    var txt = "";
    for (var i = 0; i < dt.types.length; i++) {
        txt += i + " (" + dt.types[i] + ") : " + dt.getData(dt.types[i]);
        txt += "\n";
    }

    function newUrl(url) {
        var div = document.createElement("div");
        var iframe = document.createElement("iframe");
        iframe.src = url;
        div.appendChild(iframe);
        bag.insertBefore(div, bag.firstChild);
    }

    function newImage(url) {
        var img = document.createElement("img");
        img.src = url;
        bag.insertBefore(img, bag.firstChild);
    }

    function newText(txt) {
        var p = document.createElement("p");
        p.appendChild(document.createTextNode(txt));
        bag.insertBefore(p, bag.firstChild);
    }

    // browser tab
    var type0 = "application/x-moz-tabbrowser-tab";
    var type1 = "text/x-moz-text-internal";
    if (dt.types.contains(type0)) {
        newUrl(dt.getData(type1));
        return true;
    }
    // Remote image
    var type = "application/x-moz-file-promise-url";
    if (dt.types.contains(type)) {
        newImage(dt.getData(type));
        return true;
    }
    // link && bookmarks
    var type = "text/x-moz-url";
    if (dt.types.contains(type)) {
        var url = dt.getData("text/x-moz-url-data");
        if (!url) newUrl(dt.getData("text/plain"));
        if (url) {
            newUrl(url);
            return true;
        }
    }

    // Plain text
    var txt = dt.getData("text/plain");
    if (txt) {
        newText(txt);
        return true;
    }
    return false;
}

function handleFile(file) {
    var imageType = /image.*/;
    var videoType = /video.*/;
    var audioType = /audio/;
    var textType = /text.*/;

    var bag = document.getElementById("bag");

    if (!file.type.match(imageType) &&
        !file.type.match(videoType) &&
        !file.type.match(audioType) &&
        !file.type.match(textType)) {
        return false;
    }

    if(file.type.match(imageType)) {
        var img = document.createElement("img");
        var reader = new FileReader();
        reader.onloadend = function() {
            img.src = reader.result;
        }
        reader.readAsDataURL(file);
        img.classList.add("obj");
        bag.insertBefore(img, bag.firstChild);
    }

    if(file.type.match(videoType)) {
        var video = document.createElement("video");
        video.setAttribute("autoplay", true);
        video.setAttribute("controls", true);
        var reader = new FileReader();
        reader.onloadend = function() {
            video.src = reader.result;
        }
        reader.readAsDataURL(file);
        video.classList.add("obj");
        bag.insertBefore(video, bag.firstChild);
    }

    if(file.type.match(audioType)) {
        var audio = document.createElement("audio");
        audio.setAttribute("autoplay", true);
        audio.setAttribute("controls", true);
        var reader = new FileReader();
        reader.onloadend = function() {
            audio.src = reader.result;
        }
        reader.readAsDataURL(file);
        audio.classList.add("obj");
        bag.insertBefore(audio, bag.firstChild);
    }

    if(file.type.match(textType)) {
        var txt = document.createElement("textarea");
        txt.cols = 35;
        txt.rows = 15;
        var reader = new FileReader();
        reader.onloadend = function() {
            txt.value = reader.result;
        }
        reader.readAsText(file);
        txt.classList.add("obj");
        bag.insertBefore(txt, bag.firstChild);
    }

    return true;
}

window.addEventListener("load", init, true);

