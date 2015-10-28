"use strict";
var gCommands = [
    // 'override',
    'update',
    'check',
    'set-version',
    'compile'
  ],
  thmaa = require('../');

module.exports = function(grunt) {

  grunt.registerMultiTask('mozutheme', function() {
    var done = this.async();
    var opts = this.data && this.data.opts || {};
    var target = (this.data && this.data.command) || this.target || this.args[0];
    if (gCommands.indexOf(target) === -1) {
      grunt.fail.warn('Unrecognized mozutheme command `' + target + '`.');
      return false;
    }
    grunt.verbose.ok('Recognized command ' + target);
    if (typeof opts === "function") {
      opts(run);
    } else {
      run(null, opts);
    }
    function run(err, opts) {
      if (err) {
        grunt.fail.warn(err);
        return false;
      }
      try {
        thmaa(target, opts, done)
          .on('info', grunt.log.oklns.bind(grunt.log))
          .on('warn', grunt.log.writelns.bind(grunt.log));
      } catch(e) {
        grunt.fail.warn(e.message);
      }
    }
  });

};
