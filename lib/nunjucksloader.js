module.exports = function(app) {
  var nunjucks = require("nunjucks"),
      fsl = new nunjucks.FileSystemLoader('views'),
      env = new nunjucks.Environment(fsl);
  env.express(app);
  return env;
};
