/**
 * All the variables the server will be using
 */
var argv = (function() {
      var argv = require("argv");
      argv.option({
          name: 'downsync',
          short: 'ds',
          type: 'boolean',
          description: 'Download all photos and information architecture from Flickr',
          example: "'script --downsync"
      });
      argv.option({
          name: 'prune',
          short: 'ds',
          type: 'boolean',
          description: 'Remove any local photos that got deleted on Flickr',
          example: "'script --downsync --prune"
      });
      return argv.run().options;
    }()),
    //  end of argument parsing

    // .env file parsing
    env = (function(){
      var Habitat = require("habitat");
      Habitat.load();
      return new Habitat();
    }()),

    // express server
    express = require("express"),
    expressApp = express(),

    // filesystem access
    fs = require("fs"),
    zlib = require("zlib"),

    // templating
    nunjucks = (function(express) {
      var  nunjucks = require("nunjucks"),
          fsl = new nunjucks.FileSystemLoader('views'),
          env = new nunjucks.Environment(fsl);
      env.express(expressApp);
      return env;
    }(express)),

    // CSS convenience
    stylus = require("stylus"),

    // Flickr access
    Flickr = require("flickrapi"),
    FlickrOptions = env.get("flickr"),

    // data settings
    userdir = env.get("userdir"),
    defaultuser = FlickrOptions.user_name;

/**
 * If the --downsync flag was used, authenticate with flickr and then download everything.
 */
if(argv.downsync) {
  FlickrOptions.afterDownsync = function() {
    console.log("\nDownsync finished");
    process.exit(0);
  };
  return Flickr.authenticate(FlickrOptions, Flickr.downsync(userdir + "/" + defaultuser, argv.prune));
}

/**
 * No downsync: run server using the information architectures in the user directories
 */
var app = expressApp;
app.disable('x-powered-by');
app.configure(function() {
  app.use(express.favicon("public/favicon.png"));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(stylus.middleware({ src: "./public" }));

  // static binding for all users' images
  fs.readdirSync(userdir).forEach(function(name) {
    var stat = fs.statSync(userdir + "/" + name);
    if(stat.isDirectory) {
      app.use("/" + name + "/images", express.static(userdir + "/" + name + "/images"));
    }
  });
  app.use(express.static("public"));

  // set up server logging
  require("./lib/logger").log(express, app, env);
});

/**
 * server routes
 */
require("./routes")(app, Flickr, "./userdata").bind(app);

/**
 * Special route: default route is for the .env's flickr user
 */
if(defaultuser) {
  app.get('/', function(req, res) { res.redirect('/' + defaultuser + '/'); });
}

/**
 * Start the server process
 */
app.listen(env.get("port"), function(err) {
  console.log("Node server listening on http://127.0.0.1:" + env.get("port"));
});
