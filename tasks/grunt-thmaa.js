"use strict";
var gCommands = [
    'new',
    'override',
    'update',
    'check',
    'set-version',
    'compile'
  ],
  thmaa = require('thmaa');

module.exports = function(grunt) {

  grunt.registerMultiTask('thmaa', function() {
    var me = this;
    var done = this.async();
    var target = (this.data && this.data.command) || this.target || this.args[0];
    var args = this.data && this.data.params;
    if (gCommands.indexOf(target) === -1) {
      grunt.fail.warn('Unrecognized thmaa command `' + target + '`.');
      return false;
    }
    switch(target) {
      case "new":
      case "override":
      case "set-version": 
        if (!(args && args.length > 0)) {
          grunt.fail.warn('The thmaa command `' + target + '` requires at least one argument, or a function that takes a callback.');
        }
        break;
    }
    if (typeof args === "function") {
      args(run);
    } else {
      run(null, args);
    }
    function run(err, params) {
      if (err) {
        grunt.fail.warn(err);
        return false;
      }
      try {
        thmaa.apply(me, [target].concat(params).concat([me.data && me.data.opts, done]));
      } catch(e) {
        grunt.fail.warn(e.message);
      }
    }
  });

};