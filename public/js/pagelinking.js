/**
 * user by views/blocks/pages.html
 */
(function() {
  var pageblocks = document.querySelectorAll("ul.pages li");
  // move click functionality up to the <li> from
  // the contained <a>, and make the <li> seem the
  // clickable thing instead.
  Array.prototype.forEach.call(pageblocks, function(li) {
    var a = li.querySelector("a");
    if (a) {
      li.setAttribute("tabindex",0);
      li.style.cursor = "pointer";
      li.onclick = function() { a.click(); };
      // pass focus on to owning li instead
      a.onfocus = function() { li.focus(); };
    }
  });
}());
