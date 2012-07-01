var dropbox, bag;

var desc, author, device, invalid, exifbox, dlExif;
function init() {
    window.addEventListener("dragenter", dragenter, true);
    dropbox = document.getElementById("dropbox");
    bag = document.getElementById("bag");
    window.addEventListener("dragleave", dragleave, true);
    dropbox.addEventListener("dragover", dragover, true);
    dropbox.addEventListener("drop", drop, true);
    bag.addEventListener("dragover", dragover, true);
    bag.addEventListener("drop", drop, true);

    desc = document.getElementById("desc");
    author = document.getElementById("rights");
    device = document.getElementById("device");

    invalid = document.getElementById("invalid");
    exifbox = document.getElementById("exifbox");
    dlExif = document.getElementById("exif");
}

function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
    dropbox.setAttribute("dragenter", true);
}

function dragleave(e) {
    e.stopPropagation();
    e.preventDefault();
    dropbox.removeAttribute("dragenter");
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function filter(str) {
  str = new String(str);
  return str.replace(/[^a-zA-Z0-9 ]/g, '');
}

function drop(e) {
    var dt = e.dataTransfer;
    var files = dt.files;

    e.stopPropagation();
    e.preventDefault();

    if (files.length > 0) {
        if (!handleFile(files[0])) {
            invalid.style.visibility = "visible";
            exifbox.style.visibility = "collapse";
        } else {
            invalid.style.visibility = "collapse";
            exifbox.style.visibility = "visible";
            var binaryReader = new FileReader();
            binaryReader.onloadend = function() {
                var exif = findEXIFinJPEG(binaryReader.result);
                var dl = dlExif;
                while (dl.hasChildNodes()) {
                    dl.removeChild(dl.firstChild);
                }
                if (!exif) {
                    var p = document.createElement("p");
                    p.innerHTML = "No EXIF data";
                    dl.appendChild(p);
                    desc.innerHTML = "n/a";
                    device.innerHTML = "n/a";
                    author.innerHTML = "n/a";
                    return;
                } else {
                    if ("ImageDescription" in exif) {
                        desc.innerHTML = filter(exif["ImageDescription"]);
                    } else {
                        desc.innerHTML = "n/a";
                    }
                    if ("Model" in exif) {
                        device.innerHTML = filter(exif["Model"]);
                    } else {
                        device.innerHTML = "n/a";
                    }
                    if ("Copyright" in exif) {
                        author.innerHTML = filter(exif["Copyright"]);
                    } else {
                        author.innerHTML = "n/a";
                    }
                    for (var i in exif) {
                        if (i == "undefined") continue;
                        if (i == "MakerNote") continue;
                        if (i == "UserComment") continue;
                        var dt = document.createElement("dt");
                        var dd = document.createElement("dd");

                        dt.innerHTML = filter(i) + ":";
                        dd.innerHTML = filter(exif[i]);
                        dl.appendChild(dt);
                        dl.appendChild(dd);
                    }
                    if ("GPSLatitude" in exif) {
                        var lat = exif["GPSLatitude"];
                        var lon = exif["GPSLongitude"];
                        var param = lat[0] + "+";
                        param += lat[1] + "+";
                        param += Math.round(lat[2]) + exif["GPSLatitudeRef"] + ",";
                        param += lon[0] + "+";
                        param += lon[1] + "+";
                        param += Math.round(lon[2]) + exif["GPSLongitudeRef"];
                        var iframe = document.createElement("iframe");
                        var p = document.createElement("p");
                        p.innerHTML = "Location of this photo (from GPS EXIF data):";
                        bag.appendChild(p);
                        p.classList.add("label");
                        bag.appendChild(iframe);
                        var src = "http://maps.google.com/maps?f=q&hl=en&geocode=&q=" + param + "&z=7&output=embed&iwloc=near";
                        iframe.src = src;
                        iframe.width = "300";
                        iframe.height = "300";
                        bag.appendChild(iframe);
                    }
                }
            }
            binaryReader.readAsBinaryString(files[0]);
        }
    }
}

function handleFile(file) {
    var imageType = /image\/jpeg/;

    while (bag.hasChildNodes()) {
        bag.removeChild(bag.firstChild);
    }

    if (!file.type.match(imageType)) {
        return false;
    }

    var img = document.createElement("img");
    var dataURLReader = new FileReader();
    dataURLReader.onloadend = function() {
        img.src = dataURLReader.result;
    }

    dataURLReader.readAsDataURL(file);
    img.classList.add("obj");
    dropbox.style.display = "none";
    bag.appendChild(img);

    return true;
}

window.addEventListener("load", init, true);

