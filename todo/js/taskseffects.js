var TasksEffects = {
  ensureElementIsVisible: function(anItem) {
    var rect = anItem.getBoundingClientRect();
    //window.scroll(0, rect.top);
  },

  _show: function(anItem) {
    if (anItem.style.MozOpacity < 1.0) {
      anItem.style.MozOpacity = parseFloat(anItem.style.MozOpacity) + 0.2;
      setTimeout(function() { TasksEffects._show(anItem); }, 100);
    }
  },

  _hide: function(anItem) {
    if (anItem.style.MozOpacity > 0.0) {
      anItem.style.MozOpacity = parseFloat(anItem.style.MozOpacity) - 0.2;
      setTimeout(function() { TasksEffects._hide(anItem); }, 40);
    }
    else {
      anItem.parentNode.removeChild(anItem);
    }
  },

  append: function(anItem) {
    this.ensureElementIsVisible(anItem);
    this._show(anItem);
  },

  remove: function(anItem) {
    this._hide(anItem);
  }
};
