# A Node.js Flickr downsync and re-serve app

For when you like using Flickr for its image hosting and photo organisation into sets and collections, but you're less than enthusiastic about how they're presenting your work.

Create a mirror that can downsync from Flickr with your own UX and styling!

FlickrMirror does this for you, and comes with a default look and feel based on the original (pre-tiles) Flickr, to get you started.

## human-friendly installation guide

The nicely styled, human-friendly installation guide for this project is over at http://pomax.github.io/flickrmirror

The rest of this readme is for people who want to actually fork and clone this repo and then work more closely with the source code. The effect is the same, but the text makes some assumptions about your level of technological know-how.

## install

Clone the repo, ensure you have Node installed (head over to http://nodejs.org if you don't), and run `npm install` to install all dependencies.

After that, copy the `env.dist` to `.env` (for instance with `copy env.dist .env`). Open this `.env` file and customise it based on what you need the app to do. There are only a handful of application settings, so the only setting that generally really matters is your port number.

### First time run

Once you've cloned and copied the environment file, run `node app`, which will register it has never been run before, and will ask you to input some data so that it can set up your first user account. It will ask you for the following values:

* `username`: Your human readable username. Not the ...@... one, unless that's the only one you have.
* `email`: The flickrmirror user login is based on Persona, so whatever email address you use for that, use that. However, if you do not intend to make use of the user system, you can fill in any old random value.
* `apikey`: Your personal Flickr API key. If you don't have one, get one for free over at http://www.flickr.com/services/apps/create/apply
* `apisecret`: The secret value associated with your Flickr API key.
* `permissions`:  1 = read, 2 = read + write, or 3 = read + write + delete.

This will prompt you to visit a URL on flickr that gives your FlickrMirror instance access to your data with the permissions you indicated, authorising of which will write your user information to a user store file for future use by the FlickrMirror.

At this point your FlickrMirror will run, but it won't have any data to show, so next up you'll want to downsync your data.

### running: downsync

```
$> node app --downsync
```

This builds a `./userdata` dir with a subdirectory for each user registered for your mirror, with each having an `image` subdir for thier image files, and an `ia` subdir for the Flickr information architecture.

#### Downsyncing with multiple users

To downsync a specific user when you have multiple users registered on your FlickrMirror, use:

```
$> node app --downsync --user=UserName
```

## running locally off the downsynced data

```
$> node app
```

This will run a server with a minimal Flickr-alike server on your own computer. If you open your browser and tell it to go to `http://localhost:3000` (unless you changed the `PORT` environment variable, of course), you should see your photos.

## Adding users

If you want to add more users to your flickrmirror (say you're running the mirror for your friends or family members) then these can sign up using the `http://.../signup` link. Note that signing up does **not** downsync their data, so after someone signs up, they still need to ask you to do a downsync for them. This may change in future versions, but right now signup is unrestricted, so automatically downsyncing would be rather not-nice towards you as FlickrMirror operator.

# Notable packages used

* `flickrapi`, https://npmjs.org/package/flickrapi, for Flickr syncing
* `express`, http://expressjs.com, for easy HTTP server work
* `nunjucks`, http://nunjucks.jlongster.com, for easy templating
* `stylus`, http://learnboost.github.io/stylus, for easy stylesheets

## Logging

Flickrmirror uses connect's `logger` function to effect server logs in the `logs` directory. If you didn't override the `.env` value, it will create a new log every 24 hours. Override the `LOGCYCLE` value to effect different log cycling; the value represents the number of milliseconds between cycles. The logging format can be controlled with the `LOGFORMAT` value, which can be any of the ones listed on http://www.senchalabs.org/connect/logger.html
