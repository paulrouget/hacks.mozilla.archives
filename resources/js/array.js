Array.prototype.remove = function(s) {
    var i = this.indexOf(s);
    if(i != -1) {
        this.splice(i, 1);
    }
}


