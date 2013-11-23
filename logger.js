/**
 * Log rotation for express.js
 */

var dateFormat = require("dateformat"),
    fs = require("fs"),
    zlib = require("zlib"),
    zipper = zlib.createGzip();

function getFileStream() {
  var now = new Date(),
      suffix = dateFormat(now, "yyyy-mm-dd HH-MM-ss"),
      logfile = "./logs/" + suffix + ".log",
      stream = fs.createWriteStream(logfile, { flags: 'a+' });

  stream.archive = function() {
    console.log("archiving "+logfile);
    stream.on("finish", function() {
      stream.removeAllListeners();
      var input = fs.createReadStream(logfile, {autoClose: true}),
           output = fs.createWriteStream(logfile + ".gz");
      input.pipe(zipper).pipe(output);
      output.on("close", function() {
        console.log("unlinking"+logfile);
        fs.unlink(logfile);
        zipper.unpipe(output);
        input.unpipe(zipper);
        // clear listeners
        output.removeAllListeners();
        zipper.removeAllListeners();
        input.removeAllListeners();
      });
    });
    stream.end();
  };

  return stream;
}

module.exports = {
  log: function(express, app, env) {
    var logstream = getFileStream(),
        logger = express.logger({
          format: env.get("logformat", "short"),
          stream: logstream
        }),
        forward = function() {
          var newlogstream = getFileStream();
          logger.setStream({stream: newlogstream});
          logstream.archive();
          logstream = newlogstream;
        };
    // forward the
    setInterval(forward, env.get("LOGCYCLE", 86400000)); // default to 24 hours
    app.use(logger);
  }
}