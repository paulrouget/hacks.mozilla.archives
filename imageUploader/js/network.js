var NetworkManager = {
  init: function() {

    window.addEventListener("online", function() {
      NetworkManager.online();
    }, true);
    window.addEventListener("offline", function() {
      NetworkManager.offline();
    }, true);

    if (navigator.onLine) {
      document.body.classList.add("online");
    } else {
      NetworkManager.offline();
    }
  },
  online: function() {
    document.body.classList.add("online");
    UI.setTransientStatus("online");
  },
  offline: function() {
    document.body.classList.remove("online");
    UI.setTransientStatus("offline");
  },
};
window.addEventListener("load", function() { NetworkManager.init() }, true);
