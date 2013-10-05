module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    cssmin: {
      combine: {
        files: {
          'dist/style.css': ['style/*.css'],
          'dist/style_unstable.css': ['style_unstable/*.css']
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task(s).
  grunt.registerTask('default', ['cssmin']);

};
