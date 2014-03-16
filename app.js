/**
 * All the variables the server will be using
 */
var env = require("./lib/envparser.js"),
    Flickr = require("flickrapi"),
    FlickrOptions = env.get("flickr");

/**
 * If the --downsync flag was used, authenticate with flickr and then download everything.
 */
if(!require("./lib/downsync.js")(Flickr, FlickrOptions, env.get("userdir"))) {

  /**
   * No downsync: start up the flickr mirror.
   */
  require("./lib/appconfiguration.js")(env, Flickr);
}
