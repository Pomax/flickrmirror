/**
 * route rendering object
 */
module.exports = function(app, Flickr, userdatadir, defaultuser) {
  var fs = require("fs");
  var setSize = 18;
  var ias = {};
  var recent = {};

  /**
   * Find correct spelling for the username
   */
  var findSpelling = function(user) {
    var dirs = fs.readdirSync(userdatadir);
    for(var i = dirs.length-1; i >=0; i--) {
      name = dirs[i].trim();
      if(name.toLowerCase() === user.toLowerCase()) {
        return name;
      }
    }
    return false;
  };

  /**
   * build a user's information architecture
   */
  var getIA = function(user) {
    if(ias[user]) {
      return ias[user];
    }
    var ia;
    if(!ias[user]) {
      var loc = userdatadir + "/" + user;
      ia = Flickr.loadLocally(loc);
      ias[user] = ia;
    }
    if(!ia.enrich) {
      ia.enrich = function(options) {
        var enriched = {};
        Object.keys(ia).forEach(function(key) {
          enriched[key] = ia[key];
        });
        Object.keys(options).forEach(function(key) {
          enriched[key] = options[key];
        });
        return enriched;
      };
    }
    return ia;
  };

  /**
   * grab the user's information
   */
  var getUser = function(user) {
    var data = fs.readFileSync(userdatadir + "/" + user + "/"+ user + ".json");
    try {
      var obj = JSON.parse(data);
      delete obj.password;
      return obj;
    } catch (e) { return {}; }
  };

  /**
   * Refresh a user's information architecture
   */
  var reloadIA = function(user) {
    delete ias[user];
    getIA(user);
  };

  /**
   * List of recently uploaded photos
   */
  var getRecentPhotos = function(ia, req, res) {
    ia = ia || getIA(res.locals.userdir);
    var user = res.locals.user;
    var batch = recent[user];
    var keys = ia.photo_keys;
    if(!batch || batch[0].id !== keys[0]) {
      var photos = Object.keys(ia.photos).map(function(key) {
        return ia.photos[key];
      });
      photos.sort(function(a,b) {
        return parseInt(b.dateuploaded, 10) - parseInt(a.dateuploaded, 10);
      });
      var listing = [photos[0]];
      for (var i=1; i<photos.length; i++) {
        if (parseInt(photos[i].dateuploaded, 10) < parseInt(listing[i-1].dateuploaded, 10) - 86400) {
          break;
        }
        listing.push(photos[i]);
      }
      recent[user] = listing;
    }
    return recent[user];
  };

  /**
   * Multi-page pages like the photostream and set-views
   * require some "page" handling.
   */
  var buildOptions = function(req, container) {
    var page = parseInt(req.query.page,10) || 1,
        startpage = page - 1,
        start = startpage * setSize,
        endpage = page,
        end = endpage * setSize,
        lastpage = Math.ceil(container.length / setSize) | 0,
        navpages = [],
        n;
    for(n = Math.max(startpage-3,2); n<=Math.min(endpage+3,lastpage-1); n++) {
      navpages.push(n);
    }
    return {
      hostname: req.host,
      page: page,
      start: start,
      startpage: startpage,
      end: end,
      endpage: endpage,
      lastpage: lastpage,
      navpages: navpages
    };
  };

  /**
   * To get to actual sets contained by collections,
   * we may need to resolve nested collections of
   * arbitrary depth.
   */
  var getSetsInCollection = function(collection, safety_catch) {
    // make sure that we don't infinitely recurse.
    safety_catch = safety_catch || 1;
    if(safety_catch>5) return [];
    // if not cut short, find sets.
    var sets = [];
    // collection of sets:
    if(collection.set) {
      collection.set.forEach(function(s) { sets.push(s); });
      return sets;
    }
    // collection of collections:
    if(collection.collection) {
      collection.collection.forEach(function(c) {
        sets = sets.concat(getSetsInCollection(c, safety_catch + 1));
      });
      return sets;
    }
    // collection of ???
    return sets;
  };

  /**
   * The route handler
   */
  var handler = {
    bind: function(app) {
      app.get('/signup',                        this.signup);
      app.get('/notfound',                      this.notfound);
      app.get('/:user',                         this.index);
      app.get('/:user/profile',                 this.user);
      app.get('/:user/recent',                  this.recent);
      app.get('/:user/photos/:photo',           this.photo);
      app.get('/:user/photos/:photo/lightbox',  this.lightbox);
      app.get('/:user/sets',                    this.sets);
      app.get('/:user/sets/:set',               this.set);
      app.get('/:user/collections/:collection', this.collection);
      app.get('/:user/reload',                  this.reload);
    },

    /**
     * User profile page
     */
    user: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.userdir);
      var user = getUser(res.locals.userdir);
      var options = buildOptions(req, ia.photo_keys);
      res.render("profile.html", ia.enrich(options).enrich(user));
    },

    /**
     * 404 page
     */
    notfound: function(req, res) {
      res.locals.notfound = true;
      res.render("notfound.html");
    },

    /**
     * Sign-up; not user at the moment
     */
    signup: function(req, res) {
      res.render("signup.html");
    },

    /**
     * Front page
     */
    index: function(req, res) {
      if(!res.locals.user) { res.locals.user = defaultuser; }
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.userdir);
      var options = buildOptions(req, ia.photo_keys);
      options.recent = getRecentPhotos(ia, req, res);
      res.render("index.html", ia.enrich(options));
    },

    /**
     * Most recent uploads by a user
     */
    recent: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      res.render("recent.html", {
        recent: getRecentPhotos(false, req, res)
      });
    },

    /**
     * Photo view
     */
    photo: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.user);
      var photos = ia.photos,
          photo = photos[res.locals.photo],
          pos = ia.photo_keys.indexOf(photo.id),
          pkey = pos>0 ? pos-1 : false,
          nkey = pos<ia.photo_keys.length-1 ? pos +1 : false;
      if(pkey !== false) { photo.prev = photos[ia.photo_keys[pkey]]; }
      if(nkey !== false) { photo.next = photos[ia.photo_keys[nkey]]; }
      var viewsizes = {
            "b" : "large",
            "c" : "medium800",
            "z" : "medium",
            "o" : "original",
          },
          viewkeys = Object.keys(viewsizes),
          viewsize;
      for(var v=0; v<4; v++) {
        viewsize = viewkeys[v];
        if(photo.sizes.indexOf(viewsize) > -1) {
          photo.viewsize = viewsizes[viewsize];
          break;
        }
      }
      res.render("dedicated_photo.html", ia.enrich({
        hostname: req.host,
        photo: photo
      }));
      delete ia.photo;
    },

    /**
     * Photo lightbox view
     */
    lightbox: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.user);
      var photos = ia.photos,
          photo = photos[res.locals.photo];
      res.render("lightbox.html", ia.enrich({
        photo: photo
      }));
      delete ia.photo;
    },

    /**
     * Set view
     */
    set: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.user);
      var photosets = ia.photosets,
          photoset = photosets[res.locals.set],
          options = buildOptions(req, photoset.photos);
      options.photoset = photoset;
      res.render("dedicated_set.html", ia.enrich(options));
      delete ia.photoset;
    },

    /**
     * All sets view for a user
     */
    sets: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.user);
      res.render("all_sets.html", ia);
    },

    /**
     * Collection view
     */
    collection: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = getIA(res.locals.user);
      var collections = ia.collections,
          collection = collections[res.locals.collection];
      res.render("dedicated_collection.html", ia.enrich({
        collection: collection
      }));
      delete ia.collection;
    },

    /**
     * Reload a user's ia from the browser
     */
    reload: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      reloadIA(res.locals.user);
      return handler.index(req, res);
    },

    /**
     * set up URL parameter parsing
     */
    parameters: (function(app) {
      // user parameter
      app.param("user", function(req, res, next, user) {
        res.locals.user = user;
        res.locals.userdir = findSpelling(user);
        res.locals.ownpage = false;
        next();
      });

      // content parameters
      ["photo", "set", "collection"].forEach(function(param) {
        app.param(param, function(req, res, next, value) {
          res.locals[param] = value;
          next();
        });
      });
    }(app))
  };

  return handler;
};
