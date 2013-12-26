/**
 * Make descriptions "popover" when mousing over an image.
 */
(function(){
  var entries = document.querySelectorAll(".stream.entry");
  Array.prototype.forEach.call(entries, function(e) {
    console.log(e);
    var img =  e.querySelector("img"),
        desc = e.querySelector(".description");
    desc.style.display = "none";
    img.addEventListener("mouseover", function() { desc.style.display = "block"; });
    img.addEventListener("mouseout", function() { desc.style.display = "none"; });
  });
}());
