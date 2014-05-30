(function() {

  var list = document.querySelectorAll(".gallery .photos .stream.entry");
  list = Array.prototype.slice.call(list);

  var query = window.location.search.replace("?",'').split("&");
  var page = query.filter(function(e) { return e.indexOf("page=") > -1; });
  page = page.length > 0 ? parseInt(page[0].split("=")[1],10) : 1;
  var idx = query.indexOf("p=1") > -1 ? list.length-1 : 0;

  var prevpage = document.createElement("a");
  prevpage.href = "?page=" + (page - 1) + "&p=1";

  var nextpage = document.createElement("a");
  nextpage.href = "?page=" + (page + 1);

  // Completely rework how the filmstrip works...
  var strip = document.querySelectorAll(".filmstrip a img");
  strip = Array.prototype.slice.call(strip);
  strip.forEach(function(img, i) {
    var a = img.parentNode;
    a.removeAttribute("href");
    var str = a.outerHTML;
    str = str.replace("<a", "<span").replace("</a>","</span>");
    a.outerHTML = str;
  });
  strip = document.querySelectorAll(".filmstrip span img");
  strip = Array.prototype.slice.call(strip);
  strip.forEach(function(img, i) {
    img.onclick = (function(i) {
      return function() {
        unmark();
        idx = i;
        mark();
      }
    }(i));
  });

  function mark() {
    list[idx].classList.add("selected");
    strip[idx].classList.add("selected");
  }

  function unmark() {
    list[idx].classList.remove("selected");
    strip[idx].classList.remove("selected");
  }

  function next() {
    unmark();
    idx++;
    if(idx > list.length -1) { return nextpage.click(); }
    mark();
  }

  function prev() {
    unmark();
    idx--;
    if(idx < 0) { return prevpage.click(); }
    mark();
  }

  document.addEventListener("keydown", function(evt) {
    switch(evt.which) {
      case 37: return prev();
      case 39: return next();
    }
  });
  mark();

  document.body.focus();

}());