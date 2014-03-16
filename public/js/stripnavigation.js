/**
 * Cursor navigation for streams
 */
(function() {

  var KeyNavigation = function() {
    document.removeEventListener("DOMContentLoaded", KeyNavigation);
    var stream = document.querySelector(".filmstrip");
    var keyup = function(evt) {
      if(evt.target.nodeName.toLowerCase() === "input") return;
      var key = evt.which;

      // "left"
      if(key === 37) {
        try {
          stream.querySelector(".leftnav").click();
        } catch (e) { console.log(e); }
      }

      // right
      if(key === 39) {
        try {
          stream.querySelector(".rightnav").click();
        } catch (e) { console.log(e); }
      }
    };
    document.addEventListener("keyup", keyup);
  };
  document.addEventListener("DOMContentLoaded", KeyNavigation);

}());