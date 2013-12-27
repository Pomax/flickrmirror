var express = require("express"),
    app = express(),
    fs = require("fs"),
    zlib = require("zlib"),
    nunjucks = require("./nunjucksloader.js")(app),
    stylus = require("stylus"),
    store = require("./datastore.js"),
    logger = require("./logger");

module.exports = function(env, Flickr) {
  var userdir = env.get("userdir");

  /**
   * configure app, bind routes, and start up
   */
  function setup() {
    app.configure(function() {
      app.disable('x-powered-by');
      app.use(express.favicon("public/favicon.png"));
      app.use(express.compress());
      app.use(express.bodyParser());
      app.use(express.cookieParser());
      app.use(express.session({
        secret: env.secret || "default cookie secret is so secretive O_O",
        cookie: { expires: false }
      }));
      app.use(express.methodOverride());
      app.use(stylus.middleware({ src: "./public" }));

      // static binding for all user images
      store.findAll(function(err, docs) {
        docs.forEach(function(doc) {
          var name = doc.user_name,
              stat = fs.statSync(userdir + "/" + name);
          if(stat.isDirectory) {
            app.use("/" + name + "/images", express.static(userdir + "/" + name + "/images"));
          }
        });
      });

      app.use(express.static("public"));
      logger.log(express, app, env);
    });

    /**
     * setup server routes:
     */
    require("../routes")(app, env, Flickr);

    /**
     * Start the server process:
     */
    app.listen(env.get("port"), function(err) {
      console.log("Node server listening on http://127.0.0.1:" + env.get("port"));
    });
  }

  if(store.firsttime) { store.firsttime(setup); } else { setup(); }
};
