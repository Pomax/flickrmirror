/**
 * Cursor navigation for streams
 */
(function() {

  var KeyNavigation = function() {
    document.removeEventListener("DOMContentLoaded", KeyNavigation);
    var stream = document.querySelector(".cursor.navigate");
    var keyup = function(evt) {
      if(evt.target.nodeName.toLowerCase() === "input") return;
      var key = evt.which;

      // "left"
      if(key === 37) {
        stream.querySelector(".left.cursor").click();
      }

      // right
      if(key === 39) {
        stream.querySelector(".right.cursor").click();
      }
    };
    document.addEventListener("keyup", keyup);
  };
  document.addEventListener("DOMContentLoaded", KeyNavigation);

}());