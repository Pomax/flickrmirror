var validators = {
  email: {
    label: "your persona email address",
    type: "text",
    disabled: true,
    // note: we're not relying on the 'email' type simply because
    //       browsers consider a@b a legal address. For the purpose
    //       of a FlickrMirror, this is patent nonsense.
    pattern: "[0-9a-zA-Z\\uC0-\\uFFFF]+@[0-9a-zA-Z\\uC0-\\uFFFF]+(\\.[0-9a-zA-Z\\uC0-\\uFFFF]+)+",
    check: function(v) {
      return v.match(new RegExp(this.pattern)) !== null;
    }
  },
  user_name: {
    label: "your Flickr name (the human-readable one)",
    type: "text",
    check: function() { return true; }
  },
  permissions: {
    label: "permission level",
    type: "select",
    options: ["read", "write", "delete"],
    check: function(v) { return this.options.indexOf(v) > -1; }
  },
  user_id: {
    label: "your Flickr user id (e.g. 123456789@N01)",
    type: "text",
    machinevalue: true,
    check: function(v) { return v.indexOf("%40") > -1; }
  },
  api_key: {
    label: "The Flickr API key you want to use with your mirror",
    hint: "This needs to be a 32 hexadecimal number string",
    type: "text",
    pattern: "[0-9a-fA-F]{32}",
    check: function(v) { return v.match(new RegExp(this.pattern)) !== null; }
  },
  secret: {
    label: "The secret number associated with your Flickr API key",
    hint: "This needs to be a 16 hexadecimal number string",
    type: "text",
    pattern: "[0-9a-fA-F]{16}",
    check: function(v) { return v.match(new RegExp(this.pattern)) !== null; }
  },
  access_token: {
    label: "This value will be machine generated",
    type: "text",
    machinevalue: true,
    pattern: "[0-9]{17}-[0-9a-fA-F]{16}",
    check: function(v) { return v.match(new RegExp(this.pattern)) !== null; }
  },
  access_token_secret: {
    label: "This value will be machine generated",
    type: "text",
    machinevalue: true,
    pattern: "[0-9a-fA-F]{16}",
    check: function(v) { return v.match(new RegExp(this.pattern)) !== null; }
  }
};

var UserModel = function(properties, datastore) {
  var model = this;
  this.store = datastore;

  Object.keys(validators).forEach(function(property) {
    var value;
    Object.defineProperty(model, property, {
      get: function() { return value; },
      set: function(v) {
        if(property === "persona" && value) {
          throw new Error("cannot change a user's principal identifier.");
        }
        if(validators[property].check(v)) {
          // if this usermodel is tied to an object store, we should update
          // the store if we change (but not set) a value.
          var toupdate = !!value;
          value = v;
          if(toupdate && datastore) {
            datastore.update(model);
          }
        }
        else { throw new Error("cannot set "+property+" to "+v+"; validation failed."); }
      }
    });
  });

  Object.keys(properties).forEach(function(p) {
    if(validators[p]) {
      model[p] = properties[p];
    }
  });
};

UserModel.prototype.asData = function() {
  var obj = {}, model = this;
  Object.keys(validators).forEach(function(v) {
    obj[v] = model[v];
  });
  return obj;
};

UserModel.prototype.save = function() {
  if (this.store) {
    this.store.save(this);
  }
};

UserModel.validators = validators;

module.exports = UserModel;
