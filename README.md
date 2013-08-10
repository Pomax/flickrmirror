# A Node.js implementation of the Flickr API

Because it seems like there haven't been any implemented yet...

## example

```
var Flickr = require("FlickrAPI"),
    FlickrOptions = {
      key:    "...",  // Flickr API key
      secret: "..."   // associated secret value
      access_token: ...
      access_token_secret: ...
    }

// Authenticate with our Flickr credentials
Flickr.authenticate(FlickrOptions, function(err, flickr) {

  if(err) { return console.log(err); }

  // At this point we're authenticated, so let's try
  // something. How many photos do I have on Flickr?

  flickr.photos.search({
    user_id: FlickrOptions.user_id,
  }, function(error, result) {
    if(error) {
      return console.log(error);
    }
    console.log("I have " + result.photos.total + " photos on Flickr.");
  });
});
```

## first run

On first run, the authentication function will notice that
there are no `access_token` and `access_token_secret` values
set, and will negotiate these with Flickr using their oauth
API. Once this finishes, the app notify you that you need
additional environment variables to properly use it, such as:

```
$> node app
{ oauth_callback_confirmed: 'true',
  oauth_token: '...',
  oauth_token_secret: '...' }
prompt: oauth_verifier:  123-456-789

Add the following variables to your environment:

export FLICKR_USER_ID="12345678%40N12"
export FLICKR_ACCESS_TOKEN="72157634942121673-3e02b190b9720d7d"
export FLICKR_ACCESS_TOKEN_SECRET="99c038c9fc77673e"
```

On first run the app will pop up a browser for you to authorize
it with Flickr. Once that succeeds, you will get an oauth
verification number that you need to tell the app about, so it
can finalise getting a permanent access token.
