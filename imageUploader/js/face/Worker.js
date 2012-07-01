importScripts('Detector.js', 'Grey8Image.js', 'FaceData.js');

function sqr(v) { return v * v; }

onmessage = function(event) {
    var imgData = {};
    imgData.width = event.data.width;
    imgData.height = event.data.height;
    imgData.data = event.data.data;
    Detector.initialize(event.data);
    var result = Detector.find(event.data.maxWidth, event.data.minWidth, event.data.factor, event.data.maxCount);
    var maxDist = sqr(event.data.dist);

    var refs = [];

    for (var i = 0; i < result.length; i++) {
        var rect = result[i];
        var k;
        for (k = 0; k < refs.length; k++) {
            var ref = refs[k];
            var dist = sqr(ref.x - rect.x) + sqr(ref.y - rect.y);
            if (dist < maxDist) {
                ref.weight++;
                ref.x += 1/(ref.weight) * (rect.x - ref.x);
                ref.y += 1/(ref.weight) * (rect.y - ref.y);
                break;
            }
        }
        if (k == refs.length) {
            rect.weight = 1;
            refs.push(rect);
        }
    }

    postMessage(refs);
};
