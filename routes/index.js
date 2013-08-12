/**
 * route rendering object
 */
module.exports = function(app, informationArchitecture) {

  var setSize = 18,
      ia = informationArchitecture;

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

  return {
    /**
     * Index page
     */
    index: function(req, res) {
      var page = parseInt(req.query.page) || 1,
          startpage = page -1,
          start = startpage * setSize,
          endpage = page,
          end = endpage * setSize,
          lastpage = (ia.photo_keys.length / setSize) | 0,
          navpages = [],
          n;
      for(n = Math.max(startpage-3,2)|0; n<Math.min(endpage+4,lastpage-1); n++) {
        navpages.push(n);
      }
      res.render("index.html", ia.enrich({
        page: page,
        start: start,
        end: end,
        lastpage: lastpage,
        navpages: navpages
      }));
    },

    /**
     * Set view
     */
    photo: function(req, res) {
      var photos = ia.photos,
          photo = photos[res.locals.photo];
      res.render("dedicated_photo.html", ia.enrich({
        photo: photo
      }));
      delete ia.photo;
    },

    /**
     * Set view
     */
    set: function(req, res) {
      var photosets = ia.photosets,
          photoset = photosets[res.locals.set];
      res.render("dedicated_set.html", ia.enrich({
        photoset: photoset
      }));
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
