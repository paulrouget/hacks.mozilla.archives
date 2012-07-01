const USE_WORKER = false;
var gPoints = [];

/******/
/* UI */
/******/

var elts = {};
var ctx = {};
var area = {};


var lastX, lastY;
function handleClick(e) {
    var x = e.clientX - elts.pg.offsetLeft -
        elts.pg.offsetParent.offsetLeft + window.pageXOffset;
    var y = e.clientY - elts.pg.offsetTop -
        elts.pg.offsetParent.offsetTop + window.pageYOffset;

    if (x < area.width) {
        lastX = x;
        lastY = y;
    } else {
        x -= area.width;
        if (!lastX) return;
        gPoints.push({
                            src: {x: lastX, y: lastY},
                            dest: {x: x, y: y}
                        });
        lastX = undefined;
        lastY = undefined;
        drawRelation(gPoints[gPoints.length - 1]);
    }
}



var frame0;
var frame1;

var localStorageAvailable;
function init() {
    elts.source = document.getElementById("source");
    elts.dest = document.getElementById("destination");
    elts.pg = document.getElementById("playground");
    elts.result = document.getElementById("result");

    area.width = elts.source.width;
    area.height = elts.source.height;

    elts.pg.width = area.width * 2;
    elts.pg.height = area.height;
    elts.result.width = area.width;
    elts.result.height = area.height;

    ctx.pg = elts.pg.getContext("2d");
    ctx.result = elts.result.getContext("2d");

    ctx.pg.drawImage(elts.source, 0, 0);
    ctx.pg.drawImage(elts.dest, area.width, 0);

    frame0 = ctx.pg.getImageData(0, 0, area.width, area.height);
    frame1 = ctx.pg.getImageData(area.width, 0, area.width, area.height);

    elts.pg.addEventListener("click", handleClick, true);

    localStorageAvailable = (typeof(localStorage) != "undefined");

    if (localStorageAvailable && localStorage.data) {
        document.getElementById("loadButton").removeAttribute("disabled");
        document.getElementById("purgeButton").removeAttribute("disabled");
    }
}

/*********************/
/* Workers... or not */
/*********************/

function launch() {
    setTimeout(launch2, 0);
}

function launch2() {
    var w = {};
    if (USE_WORKER) {
        w = new Worker("processor.js");
    } else {
        w.postMessage = function(args) {
            onmessage({data: args});
        }
        window.postMessage = function(args) {
            w.onmessage({data: args});
        }
    }

    var start = Date.now();
    w.onmessage = function(event) {
        drawResult(event);
        var totalDuration = Date.now() - start;
        log("Total time: " + totalDuration + "ms");
    }
    w.postMessage({
                    ctx: ctx.result,
                    area: area,
                    points: gPoints,
                    frame0: frame0,
                    frame1: frame1,
                    steps: 10});
}

/*****************/
/* Local storage */
/*****************/

function load() {
    gPoints = JSON.parse(localStorage.data);
    for (var i = 0; i < gPoints.length; i++) {
        drawRelation(gPoints[i]);
    }
}

function purge() {
    if (!localStorageAvailable) return;
    if (!confirm("Are you sure you want to purge local data?")) return;
    delete(localStorage.data);
    document.getElementById("loadButton").setAttribute("disabled", true);
    document.getElementById("purgeButton").setAttribute("disabled", true);
}

function save() {
    if (!localStorageAvailable) return;
    localStorage.data = JSON.stringify(gPoints);
    document.getElementById("loadButton").removeAttribute("disabled");
    document.getElementById("purgeButton").removeAttribute("disabled");
}

function _export() {
    if (!localStorageAvailable) return;
    alert(localStorage.data);
}

function _import() {
    var json = prompt("???");
    gPoints = JSON.parse(json);
    for (var i = 0; i < gPoints.length; i++) {
        drawRelation(gPoints[i]);
    }
}

/*******************/
/* GRAPHICAL STUFF */
/*******************/

function drawRelation(p) {
    ctx.pg.fillStyle = "red";
    ctx.pg.strokeStyle = "yellow";
    var p0 = p.src;
    var p1 = p.dest;
    ctx.pg.fillCircle(p0.x, p0.y, 3);
    ctx.pg.fillCircle(p1.x + area.width, p1.y, 3);
    ctx.pg.beginPath();
    ctx.pg.moveTo(p0.x, p0.y);
    ctx.pg.lineTo(p1.x + area.width, p1.y);
    ctx.pg.stroke();
}

function drawResult(event) {
    var anim = event.data;
initAnimation(anim);
return;
    var frames = [];
    for (var i = 0; i < anim.length; i++) {
        var frame;
        if (ctx.result.createImageData)
            frame = ctx.result.createImageData(area.width, area.height);
        else
            frame = ctx.result.getImageData(0, 0, area.width, area.height);

        frames.push(frame);
	console.log(anim[i][0]);
	console.log("type of: " + frame.data);
        Array.prototype.concat.call(frame.data, anim[i]);
	console.log(frame.data[0]);
    }

    initAnimation(frames);
}

var currentIdx = null;
function drawFrame(frames, idx) {
    if (frames.length <= idx) return;
    if (currentIdx == idx) return;
    currentIdx = idx;
    var frame = frames[idx];
    ctx.result.putImageData(frame, 0, 0);
    var ctrlsWidth = area.width - 20;
    var step = ctrlsWidth / (frames.length - 1);
    ctx.result.fillStyle = "white";
    ctx.result.fillRect(10, area.height - 15, ctrlsWidth, 10);
    ctx.result.fillStyle = "red";
    ctx.result.fillCircle(10 + idx * step, area.height - 10, 3);
}
function initAnimation(frames) {
    var steps = frames.length;
    drawFrame(frames, 0);
    elts.result.addEventListener("mousemove", function(e) {

        var x = e.clientX - elts.result.offsetLeft - elts.result.offsetParent.offsetLeft + window.pageXOffset;
        var stepPx = elts.result.width / (steps);
        var idx = Math.floor(x / stepPx);
        drawFrame(frames, idx);
    }, true);
}
