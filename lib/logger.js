/**
 * Log rotation for express.js
 */
var dateFormat = require("dateformat"),
    fs = require("fs"),
    zlib = require("zlib"),
    stream = require("stream"),
    through = new stream.PassThrough(),
    output;

/**
 * Cycle to the next file
 */
function cycleLogFile() {
  if (output) {
    through.unpipe(output);
    output.archive();
  }

  var now = new Date(),
      suffix = dateFormat(now, "yyyy-mm-dd HH-MM-ss"),
      logfile = "./logs/" + suffix + ".log";

  output = fs.createWriteStream(logfile, { flags: 'a+' });
  through.pipe(output);

  output.archive = (function(oldlog) {
    return function() {
      var data = fs.readFileSync(oldlog);
      zlib.gzip(data, function(err, data) {
        var packed = oldlog + ".gz";
        fs.writeFile(packed, data, function(err, result){
          fs.unlink(oldlog, function(err, result) {
            output.end();
          });
        });
      });
    };
  }(logfile));
}

// unsure directory exists
(function() {
  if(!fs.existsSync("./logs")) {
    fs.mkdirSync("logs");
  }
}());

/**
 * Call as require("logger").log(app)
 *
 * Environment flags
 *  - LOGCYCLE: the number of milliseconds between cycling log files
 *  - LOGFORMAT: the data to log, see http://www.senchalabs.org/connect/logger.html
 */
module.exports = {
  log: function(express, app, env) {
    env = env || { get: function(key, fallback) { return fallback; }};
    setInterval(cycleLogFile, env.get("logcycle", 86400000));
    cycleLogFile();
    app.use(express.logger({
      format: env.get("logformat", "short"),
      stream: through
    }));
  }
};
