var Datastore = require("nedb"),
    filename = "./data/users.datastore",
    fs = require("fs"),
    firsttime = !fs.existsSync(filename),
    db = new Datastore({ filename: filename, autoload: true}),
    UserModel = require("./models/UserModel.js");

// Let's wrap the fairly ridiculously named persistence function
db.flush = function() {
  db.persistence.compactDatafile(function(err) {
    if(err) console.error("compacting the database after saving the record for " + user.email + " failed!");
  });
};

var store = {
  UserModel: UserModel,
  save: function(user, oninsert) {
    oninsert = oninsert || function() {};
    db.insert(user.asData(), function(err, result) { db.flush(); oninsert(err, result); });
  },
  update: function(user) {
    db.update({ email: user.email }, user.asData(), function(err, numreplaced) { db.flush(); });
  },
  find: function(email, resultHandler) {
    db.find({ email: email}, function(err, result) {
      if(result.length === 0) {
        resultHandler(false, false);
        return;
      }
      if(result.length > 1) {
        resultHandler("more than one result for "+email, false);
        return;
      }
      resultHandler(false, new UserModel(result[0], this));
    });
  },
  findBy: function(query, resultHandler) {
    db.find(query, function(err, docs) {
      docs = docs.map(function(doc) {
        return new UserModel(doc, store);
      });
      resultHandler(false, docs);
    });
  },
  findAll: function(resultHandler) {
    db.find({}, function(err, docs) {
      docs = docs.map(function(doc) {
        return new UserModel(doc, this);
      });
      resultHandler(false, docs);
    });
  },
  firsttime: !firsttime ? false : function(finished) {
    require("./firsttime.js")(store, finished);
  }
};

module.exports = store;
