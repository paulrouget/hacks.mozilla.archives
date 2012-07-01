var containsClass = function (elm, className) {
    if (document.documentElement.classList) {
        containsClass = function (elm, className) {
            return elm.classList.contains(className);
        }
    } else {
        containsClass = function (elm, className) {
            if (!elm || !elm.className) {
                return false;
            }
            var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
            return elm.className.match(re);
        }
    }
    return containsClass(elm, className);
}

var addClass = function (elm, className) {
    if (document.documentElement.classList) {
        addClass = function (elm, className) {
            elm.classList.add(className);
        }
    } else {
        addClass = function (elm, className) {
            if (!elm) {
                return false;
            }
            if (!containsClass(elm, className)) {
                elm.className += (elm.className ? " " : "") + className;
            }
        }
    }
    addClass(elm, className);
}

var removeClass = function (elm, className) {
    if (document.documentElement.classList) {
        removeClass = function (elm, className) {
            elm.classList.remove(className);
        }
    } else {
        removeClass = function (elm, className) {
            if (!elm || !elm.className) {
                return false;
            }
            var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
            elm.className = elm.className.replace(regexp, "$2");
        }
    }
    removeClass(elm, className);
}

var toggleClass = function (elm, className)
{
    if (document.documentElement.classList) {
        toggleClass = function (elm, className) {
            return elm.classList.toggle(className);
        }
    } else {
        toggleClass = function (elm, className) {
            if (containsClass(elm, className))
            {
                removeClass(elm, className);
                return false;
            } else {
                addClass(elm, className);
                return true;
            }
        }
    }
    return toggleClass(elm, className);
}