module.exports = function(app) {
  var nunjucks = require("nunjucks"),
      fsl = new nunjucks.FileSystemLoader('views'),
      env = new nunjucks.Environment(fsl);

  env.addFilter('nlbr', function(str) {
    return str.replace(/\n/g,"<br>");
  });

  env.express(app);


  return env;
};
