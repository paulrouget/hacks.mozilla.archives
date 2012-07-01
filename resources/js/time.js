function time(func) {
    var start = Date.now();
    func();
    var d = Date.now() - start;
    return d;
}
