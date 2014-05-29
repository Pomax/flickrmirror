// FIXME: organise routing on a "per page" basis instead of routes vs. route handling

module.exports = function(store, routeUtils, Flickr) {

  var handler = {
    // route binding is handled in a separate file
    bind: require("./routing.js"),

    /**
     * filmstrip routes
     */
    filmstrip: require("./filmstrip")(store, routeUtils, Flickr),

    /**
     * generic index page
     */
    index: function(req, res) {
      res.locals.users = [];
      store.findAll(function(err, result) {
        if (result.length === 1) {
          return res.redirect("/" + result[0].user_name);
        }
        var ia, photocount, setcount, collectioncount;
        result.forEach(function(user) {
          ia = routeUtils.getIA(user.user_name);
          res.locals.users.push({
            name: user.user_name,
            photocount: ia.photo_keys.length,
            setcount: ia.photoset_keys.length,
            collectioncount: ia.collection_keys.length
          });
        });
        res.render("index.html");
      });
    },

    /**
     * kind of a 404 page
     */
    notfound: function(req, res) {
      res.locals.notfound = true;
      res.render("notfound.html");
    },

    /**
     * Sign-up; not user at the moment
     */
    signup: function(req, res) {
      var options = { validators: store.UserModel.validators };
      if(req.session.email) {
        options.validators.email.value = req.session.email;
        options.authenticated = true;
      }
      res.render("signup.html", options);
    },

    /**
     * process a signup request
     */
    processSignup: function(req, res) {
      var options = {
        api_key: req.body.api_key,
        secret: req.body.secret,
        permissions: req.body.permissions
      };
      Flickr.authenticate(options, function(err, result) {
        if(err) { return console.error(err); }
        // create the new user
        var userdata = JSON.parse(JSON.stringify(result.options));
        userdata.email = req.session.email;
        userdata.user_name = req.body.user_name;
        (new store.UserModel(userdata, store)).save();
        // User signed up and saved. Take them back to the main page
        res.redirect("/");
      });
    },

    /**
     * search photographs
     */
    search: function(req, res) {
      // actual searching is done when the param is examined
      res.render("search.html");
    },

    /**
     * Front page
     */
    user: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.userdir);
      if(!ia) { return res.redirect("/notfound"); }
      var options = routeUtils.buildOptions(req, ia.photo_keys);
      options.recent = routeUtils.getRecentPhotos(ia, req, res);
      res.render("user.html", ia.enrich(options));
    },

    /**
     * User profile page
     */
    profile: function(req, res) {
      /*
        if(!res.locals.user) { return res.redirect("/notfound"); }
        var ia = routeUtils.getIA(res.locals.userdir);
        if(!ia) { return res.redirect("/notfound"); }
        var user = getUser(res.locals.userdir);
        var options = routeUtils.buildOptions(req, ia.photo_keys);
        res.render("profile.html", ia.enrich(options).enrich(user));
      */
      res.render("profile.html");
    },

    /**
     * Most recent uploads by a user
     */
    recent: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      res.render("recent.html", {
        recent: routeUtils.getRecentPhotos(false, req, res)
      });
    },

    /**
     * Photo view
     */
    photo: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
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
      var ia = routeUtils.getIA(res.locals.user);
      if(!ia) { return res.redirect("/notfound"); }
      var photos = ia.photos,
          photo = photos[res.locals.photo];
      res.render("lightbox.html", ia.enrich({
        photo: photo
      }));
      delete ia.photo;
    },

    /**
     * All sets view for a user
     */
    sets: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
      if(!ia) { return res.redirect("/notfound"); }
      res.render("all_sets.html", ia);
    },

    /**
     * Set view
     */
    set: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
      var photosets = ia.photosets,
          photoset = photosets[res.locals.set],
          options = routeUtils.buildOptions(req, photoset.photos);
      options.photoset = photoset;
      res.render("dedicated_set.html", ia.enrich(options));
      delete ia.photoset;
    },

    /**
     * All collections for a user
     */
    collections: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
      if(!ia) { return res.redirect("/notfound"); }
      res.render("all_collections.html", ia);
    },

    /**
     * Collection view
     */
    collection: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
      if(!ia) { return res.redirect("/notfound"); }
      var collections = ia.collections,
          collection = collections[res.locals.collection];
      res.render("dedicated_collection.html", ia.enrich({
        collection: collection
      }));
      delete ia.collection;
    },

    /**
     * Collection-as-gallery view
     */
    gallery: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      var ia = routeUtils.getIA(res.locals.user);
      if(!ia) { return res.redirect("/notfound"); }
      var collection = ia.collections[res.locals.collection];
      res.render("collection_gallery.html", ia.enrich({
        collection: collection
      }));
      delete ia.collection;
    },


    /**
     * Reload a user's ia from the browser
     */
    reload: function(req, res) {
      if(!res.locals.user) { return res.redirect("/notfound"); }
      routeUtils.reloadIA(res.locals.user);
      return handler.index(req, res);
    }
  };


  return handler;
};
