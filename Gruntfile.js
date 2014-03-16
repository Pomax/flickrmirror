module.exports = function( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    jshint: {
      options: {
        "-W054": true,  // The Function constructor is a form of eval
        "-W069": true   // thing["property"] is better written in dot notation
      },
      files: [
        "Gruntfile.js",
        "app.js",
        "lib/**/*.js",
        "public/js/**/*.js",
        "routes/*.js"
      ]
    }
  });

  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.registerTask( "default", [ "jshint" ]);
};
