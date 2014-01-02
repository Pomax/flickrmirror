module.exports = function(store, finished) {
  var prompt = require("prompt");
  prompt.start();
  console.log("It looks like this is the first time you are running this FlickrMirror,");
  console.log("you will need to set up your first user before you can use the mirror.");
  console.log("This will only add the user as 'known user', and will not downsync from");
  console.log("Flickr until you run the downsync manually.");
  console.log("Please fill in your Flickr username, API key, and API key secret so that");
  console.log("FlickrMirror can negotiate access keys for your content.");
  prompt.get(["username", "email", "apikey", "apisecret"], function(err, result) {
    var user_name = result.username,
        email = result.email,
        api_key = result.apikey,
        secret = result.apisecret;
    console.log("Please also indicate what the Flickr permissions should be for this user.");
    console.log("1 = 'Read' permissions, 2 = 'read + write', 3 = 'read + write + delete'.");
    prompt.get(["permissions"], function(err, result) {
      var level = parseInt(result.permissions, 10),
          permissions = [false,"read","write","delete"][level] || "read";
      // get authorisation
      var Flickr = require("flickrapi"),
          options = {
            api_key: api_key,
            secret: secret,
            permissions: permissions,
            // this is a browser-less auth, and we don't actually want to load an API object.
            nobrowser: true,
            noAPI: true,
            silent: true
            // FIXME: this should be a callback endpoint instead of OOB, really...
          };
      Flickr.authenticate(options, function(err) {
        if (err) {
          console.error("access tokens could not be obtained: ", err);
        }

        var user = new store.UserModel({
          user_name: user_name,
          email: email,
          permissions: permissions,
          user_id: options.user_id,
          api_key: api_key,
          secret: secret,
          access_token: options.access_token,
          access_token_secret: options.access_token_secret
        });
        store.save(user);

        finished(err);
      });
    });
  });
};
