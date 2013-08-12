/**
 * route rendering object
 */
module.exports = function(app, informationArchitecture) {
  return {
    /**
     * Index page
     */
    index: function(req, res) {
      res.render("index.html", informationArchitecture);
    },

    /**
     * Set view
     */
    photo: function(req, res) {
      var photos = informationArchitecture.photos,
          photo = photos[res.locals.photo];
      informationArchitecture.photo = photo;
      res.render("dedicated_photo.html", informationArchitecture);
      delete informationArchitecture.photo;
    },

    /**
     * Set view
     */
    set: function(req, res) {
      var photosets = informationArchitecture.photosets,
          photoset = photosets[res.locals.set];
      informationArchitecture.photoset = photoset;
      res.render("dedicated_set.html", informationArchitecture);
      delete informationArchitecture.photoset;
    },

    /**
     * Collection view
     */
    collection: function(req, res) {
      var collections = informationArchitecture.collections,
          collection = collections[res.locals.collection];
      informationArchitecture.collection = collection;
      res.render("dedicated_collection.html", informationArchitecture);
      delete informationArchitecture.collection;
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
