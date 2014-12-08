module.exports = function(grunt) {

var versionCmd = ''; // e.g. 'git describe --tags --always' or 'svn info'

grunt.initConfig({
    jsonlint: {
      theme_json: {
        src: [
          './*.json',
          'labels/*.json'
        ]
      }
    },
    jshint: {
      theme_js: [
        'Gruntfile.js',
        'scripts/**/*.js'
      ],
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
    thmaa: {
      check: {},
      update: {},
      compile: {},
      quickcompile: {
        command: 'compile',
        opts: {
          'skipminification': true
        }
      },
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
    compress: {
      build: {
        options: {
          archive: function() {
            return pkg.name + '-' + (lastVersionGot || pkg.version) + '.zip';
          },
          pretty: true
        },
        files: [{
          src: [
            'compiled/**',
            'labels/**',
            'resources/**',
            'scripts/**',
            'stylesheets/**',
            'templates/**',
            '*.js',
            '*.json',
            '*.ico',
            '*.png'
          ],
          dest: '/'
        }]
      }
    },
    watch: {
      json: {
        files: '{<%= jsonlint.theme_json.src %>}',
        tasks: ['jsonlint']
      },
      javascript: {
        files: '{<%= jshint.theme_js %>}',
        tasks: ['jshint','thmaa:quickcompile']
      },
      compress: {
        files: '{<%= compress.build.files[0].src %>}',
        tasks: ['thmaa:check','compress']
      }
    }
  });

  var lastVersionGot;
  function getVersion(cb) {
    if (!versionCmd) return cb(null, '0.1.0');
    var cmd = versionCmd.split(' ');
    grunt.util.spawn({
      cmd: cmd[0],
      args: cmd.slice(1)
    }, function(err, res) {
      cb(err, lastVersionGot = res.stdout.replace(/^v/,''));
    });
  }

  var pkg = grunt.file.readJSON('package.json');

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

  grunt.registerTask('build', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:quickcompile', 'thmaa:buildver', 'compress']);
  grunt.registerTask('release', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:compile', 'thmaa:releasever', 'compress']);
  grunt.registerTask('default', ['build']);
};
