module.exports = (function(){
  var Habitat = require("habitat");
  Habitat.load(".env");
  var env = new Habitat();
  console.log(env);
  return env;
}());
