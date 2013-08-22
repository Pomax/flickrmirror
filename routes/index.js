/**
 * route rendering object
 */
module.exports = function(username, app, informationArchitecture) {
  var setSize = 18,
      ia = informationArchitecture;

  ia.user_name = username || "";

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

  var buildOptions = function(req, container) {
    var page = parseInt(req.query.page) || 1,
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
      page: page,
      start: start,
      startpage: startpage,
      end: end,
      endpage: endpage,
      lastpage: lastpage,
      navpages: navpages
    };
  }

  return {
    /**
     * Index page
     */
    index: function(req, res) {
      var options = buildOptions(req, ia.photo_keys);
      (function buildCollectionThumbnails(){
        Object.keys(ia.collections).forEach(function(collection) {
          collection = ia.collections[collection];
          var thumbnails = [];
          while(thumbnails.length < 12) {
            collection.set.forEach(function(set) {
              set = ia.photosets[set.id];
              var photos = set.photos,
                  len = photos.length,
                  idx = (Math.random() * len) | 0;
              thumbnails.push(photos[idx]);
            });
          }
          collection.thumbnails = thumbnails.slice(0,12);
        });
      }());
      res.render("index.html", ia.enrich(options));
    },

    /**
     * Photo view
     */
    photo: function(req, res) {
      var photos = ia.photos,
          photo = photos[res.locals.photo],
          pos = ia.photo_keys.indexOf(photo.id),
          pkey = pos>0 ? pos-1 : false,
          nkey = pos<ia.photo_keys.length-1 ? pos +1 : false;
      if(pkey) { photo.prev = photos[ia.photo_keys[pkey]]; }
      if(nkey) { photo.next = photos[ia.photo_keys[nkey]]; }
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
        photo: photo
      }));
      delete ia.photo;
    },

    /**
     * Photo lightbox view
     */
    lightbox: function(req, res) {
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
      var photosets = ia.photosets,
          photoset = photosets[res.locals.set],
          options = buildOptions(req, photoset.photos);
      options.photoset = photoset;
      res.render("dedicated_set.html", ia.enrich(options));
      delete ia.photoset;
    },

    /**
     * Collection view
     */
    collection: function(req, res) {
      var collections = ia.collections,
          collection = collections[res.locals.collection];
      res.render("dedicated_collection.html", ia.enrich({
        collection: collection
      }));
      delete ia.collection;
    },

    /**
     * set up URL routing
     */
    parameters: (function(app) {
      ["photo", "set", "collection"].forEach(function(param) {
        app.param(param, function(req, res, next, value) {
          res.locals[param] = value;
          next();
        });
      });
    }(app))
  };

};
