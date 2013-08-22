# A Node.js Flickr downsync and re-serve app

For when you want to download all your Flickr stuffs, and then
serve it yourself instead, based on the data that Flickr has.

Like, say, you don't like the new design. Make your own!

## human-friendly installation guide

The nicely styled, human-friendly installation guide for
this project is over at http://pomax.github.io/flickrmirror

The rest of this readme is for people who want to actually
fork and clone this repo and then work more closely with
the source code. The effect is the same, but the text makes
some assumptions about your level of technological know-how.

## install

Clone the repo, ensure you have Node installed (head over
to http://nodejs.org if you don't), and run `npm install`
to install all dependencies.

After that, rename the `env.dist` file to `.env`, open it
in a text editor, and input your Flickr API key and secret,
as well as your screen name. Also note the permissions var,
which can be set to "read", "write", or "delete". The template
env.dist has this set to "read" since it only downsyncs by
default, but you can change this to whatever you like.

If you do change it, you'll have to kill off your access
token and secret, and rerun the authorisation, since you
will need new auth creds. to run with wider permissions.

Also, if you do not have a Flickr API key, you can trivially
get a non-commercial one for free by going to:

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

Also make sure to copey over the generated enviroment variables
to the .env file.

## running: locally off the downsynced data

```
$> node app
```

This will run a server with a minimal Flickr-alike server
on your own computer. If you open your browser and tell it
to go to `http://localhost:3000`, you should see your photos.

# Notable packages used

* `flickrapi`, https://npmjs.org/package/flickrap, for Flickr syncing
* `express`, http://expressjs.com, for easy HTTP server work
* `nunjucks`, http://nunjucks.jlongster.com, for easy templating
* `stylus`, http://learnboost.github.io/stylus, for easy stylesheets
