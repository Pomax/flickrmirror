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
    env = (function(){
      var Habitat = require("habitat");
      Habitat.load();
      return new Habitat();
    }()),
    express = require("express"),
    expressApp = express(),
    fs = require("fs"),
    nunjucks = (function(express) {
      var  nunjucks = require("nunjucks"),
          fsl = new nunjucks.FileSystemLoader('views'),
          env = new nunjucks.Environment(fsl);
      env.express(expressApp);
      return env;
    }(express)),
    stylus = require("stylus"),

    Flickr = require("flickrapi"),
    FlickrOptions = env.get("flickr"),

    userdir = env.get("userdir"),
    defaultuser = FlickrOptions.user_name;

// Authenticate with flickr and then download everything.
if(argv.downsync) {
  FlickrOptions.afterDownsync = function() {
    console.log("\nDownsync finished");
    process.exit(0);
  };
  return Flickr.authenticate(FlickrOptions, Flickr.downsync(userdir + "/" + defaultuser, argv.prune));
}

// No downsync: run server using IA
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

  // server routes
  var routes = require("./routes")(app, Flickr, "./userdata");

  app.get('/signup',                        routes.signup);
  app.get('/notfound',                      routes.notfound);

  app.get('/:user',                         routes.index);
  app.get('/:user/profile',                 routes.user);
  app.get('/:user/recent',                  routes.recent);
  app.get('/:user/photos/:photo',           routes.photo);
  app.get('/:user/photos/:photo/lightbox',  routes.lightbox);
  app.get('/:user/sets',                    routes.sets);
  app.get('/:user/sets/:set',               routes.set);
  app.get('/:user/collections/:collection', routes.collection);
  app.get('/:user/reload',                  routes.reload);


  // default route is for the .env's flickr user
  if(defaultuser) {
    app.get('/', function(req, res) { res.redirect('/' + defaultuser + '/'); });
  }
});

// start listening
app.listen(env.get("port"), function(err) {
  console.log("Node server listening on http://127.0.0.1:" + env.get("port"));
});
