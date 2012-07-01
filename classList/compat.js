function containsClass(elm, className)
{
    if (!elm || !elm.className)
    {
        return false;
    }
    var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
    return elm.className.match(re)
}

function addClass(elm, className)
{
    if (!elm)
    {
        return false;
    }
    if (!containsClass(elm, className))
    {
        elm.className += (elm.className ? " " : "") + className;
    }
}

function removeClass(elm, className)
{
    if (!elm || !elm.className)
    {
        return false;
    }
    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    elm.className = elm.className.replace(regexp, "$2");
}

function toggleClass(elm, className)
{
    if (containsClass(elm, className))
    {
        removeClass(elm, className);
    } else {
        addClass(elm, className);
    }
}
