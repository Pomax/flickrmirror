module.exports = (function(){
  var Habitat = require("habitat");
  Habitat.load();
  var env = new Habitat();
  console.log("running flickrmirror with hostname: " + env.get("hostname"));
  return env;
}());
