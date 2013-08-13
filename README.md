# A Node.js Flickr downsync and re-serve app

For when you want to download all your Flickr stuffs, and then
serve it yourself instead, based on the data that Flickr has.

Like, say, you don't like the new design. Make your own!

## install

Clone the repo, ensure you have Node installed (head over
to http://nodejs.org if you don't), then run `npm install`
in the flickrmirror directory.

After that, rename the `env.dist` file to `.env`, open it
in a text editor, and input your Flickr API key and secret,
as well as your screen name.

If you do not have a Flickr API key, you can trivially get a
non-commercial one for free by going to:

  http://www.flickr.com/services/apps/create/apply

After this, you have two options when it comes to running the
program. I recommend running them in the order listed below:

## running: downsync

```
$> node app --downsync
```

This builds a `./data` dir with an `image` subdir for your
images, and an `ia` subdir for the Flickr information architecture.

Note: This will open a browser on first use, for you to authorise
the application, using your API key, to access your Flickr data.
Authorising will give you a code like "123-456-789", input that
number (with dashes) in the prompt and then hit enter to continue.

## running: locally off the downsynced data

```
$> node app
```

This will run a server with a minimal Flickr-alike server
on your own computer. If you open your browser and tell it
to go to `http://localhost:3000`, you should see your photos.

# Notable packages used

* `flickrapi`, for Flickr syncing
* `express`, for easy HTTP server work
* `nunjucks`, for easy templating
* `stylus`, for easy stylesheets
