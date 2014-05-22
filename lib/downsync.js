module.exports = function(Flickr, FlickrOptions, userdir) {
  var argv = require("./argparser.js");
  if(argv.downsync) {
    var store = require("./datastore.js");
    if(argv.user) {
      store.findBy({ user_name: argv.user}, function(err, results) {
        FlickrOptions = results[0];
        FlickrOptions.force_auth = true;
        FlickrOptions.afterDownsync = function() {
          console.log("\nDownsync finished");
          process.exit(0);
        };
        return Flickr.authenticate(FlickrOptions, Flickr.downsync(userdir + "/" + argv.user, argv.prune));
      });
    } else {
      // default user?
      store.findAll(function(err, results) {
        if(results.length === 0) {
          console.error("No users are registered for this FlickrMirror yet!");
        }
        else if(results.length === 1) {
          // fixme: technically repeated code from the "with argv.user" case, above.
          FlickrOptions = results[0].asData();
          FlickrOptions.force_auth = true;
          FlickrOptions.afterDownsync = function() {
            console.log("\nDownsync finished");
            process.exit(0);
          };
          Flickr.authenticate(FlickrOptions, Flickr.downsync(userdir + "/" + FlickrOptions.user_name, argv.prune));
        }
        else { console.error("This FlickrMirror has more than on user, but no --user=... runtime argument was passed along with the downsync instruction."); }
      });
    }
  }
  return !!argv.downsync;
};
