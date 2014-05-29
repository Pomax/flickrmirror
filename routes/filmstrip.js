/**
 * Filmstrip routing
 */
module.exports = function(store, routeUtils, Flickr) {

  var getia = function(req, res) {
    if(!res.locals.user) { return res.redirect("/notfound"); }
    var ia = routeUtils.getIA(res.locals.user);
    if(!ia) { ia = false; res.redirect("/notfound"); }
    return ia;
  };

  var filmstrip = function(req, res, ia) {
    res.render("filmstrip_collection.html", ia);
  };

  return {
    set: function(req, res) {
    /*
      var ia = getia(req, res);
      if(!ia) return;
      // find all photos involved in this collection
      var set = ia.set[res.locals.set];

      // render film strip
      filmstrip(req, res, ia);
    */
    },
    collection: function(req, res) {
      var ia = getia(req, res);
      if(!ia) return;
      // find all photos involved in this collection
      var photos = [];
      var collection = ia.collections[res.locals.collection];
      collection.set.forEach(function(set) {
        var photoset = ia.photosets[set.id];
        photos = photos.concat(photoset.photos);
      });
      options = routeUtils.buildOptions(req, photos);
      res.locals.collection = collection;
      res.locals.filmstrip = photos;
      // render film strip
      filmstrip(req, res, ia.enrich(options));
    }
  };

};
