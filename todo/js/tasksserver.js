var storage = localStorage;

const TasksServer = function(aLocation) {
  function getID() {
    var id = (storage.getItem("lastID") && storage.getItem("lastID") != "") ? parseInt(storage.getItem("lastID")) : 0;
    storage.setItem("lastID", id + 1);
    return id;
  };

  function xhr(aAction) {
    var request = new XMLHttpRequest();
    request.open('GET', "http://demos.hacks.mozilla.org/openweb/todo/php/tasks.php?action=" + aAction, false);
    request.send(null);  
    return (request.status == 200) ? request.responseXML
                                   : null;
  };

  this.isOnline = function() {
    if (!navigator.onLine) return false;
    try {
      var request = new XMLHttpRequest();
      request.open('GET', "http://demos.hacks.mozilla.org/openweb/todo/php/tasks.php?action=get&date=" + Date.now(), false);
      request.send(null);
      return (request.status == 200);
    }
    catch(e) {
      return false;
    }
  };

  this.getAll = function() {
    if (!this.isOnline()) {
      return JSON.parse(storage.getItem("local"));
    }


    var self = this;

    var toStore = JSON.parse(storage.getItem("toStore"));
    if (toStore) {
      toStore.forEach(function(aElement, aIndex, aArray) {
        self.add(aElement.title);
      });
      storage.removeItem("toStore");
    }

    var toDeletes = JSON.parse(storage.getItem("toDelete"));
    if (toDeletes) {
      toDeletes.forEach(function(aElement, aIndex, aArray) {
        self.remove(aElement.id);
      });
      storage.removeItem("toDelete");
    }

    var items = xhr("get");
    var tasksNodes = items.getElementsByTagName("task");
    var tasks = [];
    for (var i = 0; i < tasksNodes.length; i++) {
      var task = tasksNodes[i];
      tasks.push({'id':task.getAttribute("id"), 'title':task.getAttribute("title"), 'sync':"true"});
    }
    return tasks;
  };

  this.close = function(aItems) {
    storage.setItem("local", JSON.stringify(aItems));
  };

  this.add = function(aTitle) {
    var id = getID();
    if (this.isOnline()) {
      xhr("store&id=" + id + "&title=" + aTitle);
      return [id, true];
    }

    var items = JSON.parse(new String(storage.getItem("toStore")));
    if (!items) items = [];
    items.push({'id': id, 'title': aTitle, 'sync':"false"});
    storage.setItem("toStore", JSON.stringify(items));

    return [id, false];
  };

  this.remove = function(aId) {
    if (this.isOnline()) {
      xhr("delete&id=" + aId);
      return;
    }

    var items = JSON.parse(new String(storage.getItem("toDelete")));
    if (!items) items = [];

    // look if the items was added during this during offline
    var preventStore = false;

    var addItems = JSON.parse(new String(storage.getItem("toStore")));
    if (addItems) {
      
      addItems = addItems.filter(function(aElement, aIndex, aArray) {
        if (aElement.id == aId) {
          preventStore = true;
          return false;
        }
        return true;
      });
  
      if (preventStore) {
        storage.setItem("toStore", JSON.stringify(addItems));
        return;
      }
    }

    items.push({'id': aId});
    storage.setItem("toDelete", JSON.stringify(items));
  };
};

