module.exports = function(grunt) {

  var jsonFiles = [
    'theme.json',
    'theme-ui.json',
    'package.json',
    'labels/*.json'
  ],
    jsFiles = [
    'Gruntfile.js',
    'scripts/**/*.js'
  ],
    filesToArchive = [
    'compiled/**',
    'labels/**',
    'resources/**',
    'scripts/**',
    'stylesheets/**',
    'templates/**',
    'build.js',
    'CHANGELOG.md',
    'Gruntfile.js',
    'LICENSE',
    'package.json',
    'README.md',
    'theme.json',
    'theme-ui.json',
    '*.ico',
    '*.png'
  ],

versionCmd = 'git describe --tags --always'; // e.g. 'git describe --tags --always' or 'svn info'

function getVersion(cb) {
  if (!versionCmd) return cb(null, '0.1.0');
  var cmd = versionCmd.split(' ');
  grunt.util.spawn({
    cmd: cmd[0],
    args: cmd.slice(1)
  }, function(err, res) {
    cb(err, res.stdout);
  });
}

var pkg = grunt.file.readJSON('package.json');

grunt.initConfig({
    pkg: pkg,
    jsonlint: {
      theme_json: {
        src: jsonFiles
      }
    },
    jshint: {
      theme_js: jsFiles,
      options: {
        ignores: ['scripts/vendor/**/*.js'],
        undef: true,
        laxcomma: true,
        unused: false,
        globals: {
          console: true,
          window: true,
          document: true,
          setTimeout: true,
          clearTimeout: true,
          module: true,
          define: true,
          require: true,
          Modernizr: true,
          process: true
        }
      }
    },
    compress: {
      build: {
        options: {
          archive: '<%= pkg.name %>-<%= pkg.version %>.zip',
          pretty: true
        },
        files: [{
          src: filesToArchive,
          dest: '/'
        }]
      }
    },
    thmaa: {
      check: {},
      update: {},
      compile: {},
      buildver: {
        command: 'set-version',
        params: getVersion,
        opts: {
          'no-bower': true,
          'no-package': true
        }
      },
      releasever: {
        command: 'set-version',
        params: getVersion
      }
    },
    watch: {
      json: {
        files: jsonFiles,
        tasks: ['jsonlint']
      },
      javascript: {
        files: jsFiles,
        tasks: ['jshint','thmaa:compile']
      },
      compress: {
        files: filesToArchive,
        tasks: ['compress']
      }
    }
  });

// auto-load all package.json dependencies with names starting with 'grunt-'
  Object.keys(pkg.devDependencies)
    .filter(function(dep) { return dep.indexOf('grunt-') === 0; })
    .forEach(grunt.loadNpmTasks);


  var gCommands = [
    'new',
    'override',
    'update',
    'check',
    'set-version',
    'compile'
  ],
  thmaa = require('thmaa');
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

  grunt.registerTask('build', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:compile', 'thmaa:buildver', 'compress']);
  grunt.registerTask('release', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:compile', 'thmaa:releasever', 'compress']);
  grunt.registerTask('default', ['build']);
};
