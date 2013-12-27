/**
 * route rendering object
 */
module.exports = function(app, env, Flickr) {
  var port = env.get("port");
  var default_persona_host = "http://localhost" + (port != 80 ? ":" + port : '');
  var domainURL = env.get("persona_host", default_persona_host);

  var store = require("../lib/datastore.js");
  var routeUtils = require("./routeutils.js")(env, store, Flickr);
  var handler = require("./handler.js")(store, routeUtils, Flickr);

  require("express-persona")(app, { audience: domainURL });
  handler.bind(app, store, routeUtils);
};
