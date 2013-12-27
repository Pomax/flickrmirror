// FIXME: organise routing on a "per page" basis instead of routes vs. route handling

module.exports = function(env, store, Flickr) {
  var fs = require("fs");
  var userdir = env.get("userdir");

  var setSize = 18;
  var ias = {};
  var recent = {};

  var utils =  {

    /**
     * Find correct spelling for the username
     */
    findSpelling: function(user) {
      var dirs = fs.readdirSync(userdir);
      for(var i = dirs.length-1; i >=0; i--) {
        name = dirs[i].trim();
        if(name.toLowerCase() === user.toLowerCase()) {
          return name;
        }
      }
      return false;
    },

    /**
     * build a user's information architecture
     */
    getIA: function(user) {
      if(ias[user]) {
        return ias[user];
      }
      var ia;
      if(!ias[user]) {
        var loc = userdir + "/" + user;
        // don't load IA for unknown user
        if (!fs.existsSync(loc)) {
          return false;
        }
        // know user
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
    },

    /**
     * grab the user's information
     */
    getUser: function(user) {
      var data = fs.readFileSync(userdir + "/" + user + "/"+ user + ".json");
      try {
        var obj = JSON.parse(data);
        delete obj.password;
        return obj;
      } catch (e) { return {}; }
    },

    /**
     * Refresh a user's information architecture
     */
    reloadIA: function(user) {
      delete ias[user];
      utils.getIA(user);
    },

    /**
     * List of recently uploaded photos
     */
    getRecentPhotos: function(ia, req, res) {
      ia = ia || utils.getIA(res.locals.userdir);
      if(!ia) { return res.redirect("/notfound"); }
      var user = res.locals.user;
      var batch = recent[user];
      var keys = ia.photo_keys;
      if(!batch || batch.length === 0 || batch[0].id !== keys[0]) {
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
    },

    /**
     * Multi-page pages like the photostream and set-views
     * require some "page" handling.
     */
    buildOptions: function(req, container) {
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
    },

    /**
     * To get to actual sets contained by collections,
     * we may need to resolve nested collections of
     * arbitrary depth.
     */
    getSetsInCollection: function(collection, safety_catch) {
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
          sets = sets.concat(utils.getSetsInCollection(c, safety_catch + 1));
        });
        return sets;
      }
      // collection of ???
      return sets;
    },

    /**
     * Search all known photographs
     */
    searchPhotos: function(req, res, next) {
      var terms = res.locals.searchterm.toLowerCase(),
          results = [],
          ia, photo, tags,
          username,
          add = function(u, p) { results.push({user: u, photo: p}); };
      store.findAll(function(err, result) {
        result.forEach(function(user) {
          username = user.user_name;
          ia = utils.getIA(username);
          Object.keys(ia.photos).forEach(function(photoid) {
            photo = ia.photos[photoid];
            tags = photo.tags.tag.map(function(t) { return t.raw.toLowerCase(); });
            // Get matching
            if(photo.description._content.toLowerCase().match(new RegExp("\\b"+terms+"\\b")) !== null) { add(username, photo); }
            else if (photo.title._content.toLowerCase().match(new RegExp("\\b"+terms+"\\b")) !== null) { add(username, photo); }
            else if (tags.indexOf(terms) > -1) { add(username, photo); }
          });
        });
        res.locals.results = results;
        next();
      });
    }
  };

  return utils;

};
