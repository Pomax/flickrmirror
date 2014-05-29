module.exports = function(app, store, routeUtils) {


  /**
   * set up URL parameter parsing
   */
  (function(app) {
    // user parameter
    app.param("user", function(req, res, next, user) {
      res.locals.user = user;
      res.locals.userdir = routeUtils.findSpelling(user);
      // check authentication status
      if(req.session && req.session.email) {
        store.find(req.session.email, function(err, result) {
          res.locals.ownpage = (result && result.user_name === user);
          next();
        });
      }
      else { res.locals.ownpage = false; next(); }
    });

    // search terms
    app.param("searchterm", function(req, res, next, searchterm) {
      res.locals.searchterm = decodeURIComponent(searchterm.replace(/\+/g,' '));
      routeUtils.searchPhotos(req, res, next);
    });

    // content parameters
    ["photo", "set", "collection"].forEach(function(param) {
      app.param(param, function(req, res, next, value) {
        res.locals[param] = value;
        next();
      });
    });
  }(app));


  /**
   * Set up route handling
   */

  app.get('/',                              this.index);

  app.get('/notfound',                      this.notfound);

  app.get('/signup',                        this.signup);
  app.post('/signup',                       this.processSignup);

  app.get("/search/:searchterm",            this.search);

  app.get('/:user',                         this.user);
  app.get('/:user/reload',                  this.reload);
  app.get('/:user/profile',                 this.profile);
  app.get('/:user/recent',                  this.recent);
  app.get('/:user/photos/:photo',           this.photo);
  app.get('/:user/photos/:photo/lightbox',  this.lightbox);

  app.get('/:user/sets',                    this.sets);
  app.get('/:user/sets/:set',               this.set);

  app.get('/:user/collections',             this.collections);
  app.get('/:user/collections/:collection', this.collection);

  app.get('/:user/filmstrip/set/:set',               this.filmstrip.set);
  app.get('/:user/filmstrip/collection/:collection', this.filmstrip.collection);


};
