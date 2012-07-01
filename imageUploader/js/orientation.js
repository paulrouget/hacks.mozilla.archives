const LANDSCAPE = 0;
const PORTRAIT = 1;
var currentOrientation = LANDSCAPE;

window.addEventListener("MozOrientation", function(e) {
        if (currentOrientation == LANDSCAPE && (e.x < -0.8 || e.x > 0.8)) {
            currentOrientation = PORTRAIT;
            document.body.classList.remove("landscape");
            document.body.classList.add("portrait");
        }

        if (currentOrientation == PORTRAIT && e.x < 0.4 && e.x > -0.4) {
            currentOrientation = LANDSCAPE;
            document.body.classList.add("landscape");
            document.body.classList.remove("portrait");
        }
}, true);

