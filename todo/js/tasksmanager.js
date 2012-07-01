const TasksManager = {
  get panel() {
    delete this.panel;
    return this.panel = document.getElementById("panel");
  },

  initialize: function lm_initialize() {
    this.server = new TasksServer(location);
    document.body.addEventListener("online", function() {
      TasksManager._rebuild();
    }, false);

    // just ensure that some images are visible when going into offline
    // mode
    var img1 = new Image();
    img1.src = "images/sync.png";
    var img2 = new Image();
    img2.src = "images/no-sync.png";

    this._rebuild();
  },

  uninitialize: function lm_uninitalize() {
    var items = [];
    for (var i = 1; i < this.panel.children.length; i++) {
      var item = this.panel.children[i];
      items.push({ 'id':item.getAttribute("id"), 'title':item.getAttribute("title"), 'sync':item.getAttribute("sync")});
    }
    this.server.close(items);
  },

  create : function lm_create() {
    var title = window.prompt("New task:");
    if (title) {
      var res = this.server.add(title);
      var id = res[0];
      var online = res[1];
      this._append(id, title, online);
    }
  },

  remove: function lm_remove(anItem) {
    TasksEffects.remove(anItem);
    this.server.remove(anItem.getAttribute("id"));
  },

  _rebuild: function() {
    // remove all the previously loaded items
    while(this.panel.lastChild != this.panel.firstElementChild)
      this.panel.removeChild(this.panel.lastChild);

    // build a new list
    var items = this.server.getAll();
    if (items) {
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        this._append(item.id, item.title, item.sync);
      }
    }
  },

  _append: function lm_append(aId, aTitle, aSync) {  
    var item = document.createElement("li");
    item.setAttribute("id", aId);
    item.setAttribute("title", aTitle);
    item.setAttribute("sync", aSync);
    item.appendChild(document.createTextNode(aTitle));

    var image = document.createElement("img");
    image.setAttribute("onclick", "TasksManager.remove(this.parentNode);");
    image.src = "images/close-40.png";
    item.appendChild(image);

    item.style.MozOpacity = 0.0;
    this.panel.appendChild(item);
    TasksEffects.append(item);
  }
};

