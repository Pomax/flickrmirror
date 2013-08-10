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
      res.render("photo.html", informationArchitecture);
    },

    /**
     * Set view
     */
    set: function(req, res) {
      res.render("set.html", informationArchitecture);
    },

    /**
     * Collection view
     */
    collection: function(req, res) {
      res.render("collection.html", informationArchitecture);
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
