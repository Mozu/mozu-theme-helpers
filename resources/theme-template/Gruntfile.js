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
            '**',
            '!node_modules/**',
            '!references/**',
            '!.inherited',
            '!*.zip'
          ],
          dest: '/'
        }]
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
        opts: function(callback) {
          getVersion(function(err, ver) {
            callback(err, {
              version: ver,
              'no-bower': true,
              'no-package': true
            });
          });
        }
      },
      releasever: {
        command: 'set-version',
        opts: function(callback) {
          getVersion(function(err, ver) {
            callback(err, {
              version: ver
            });
          });
        }
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
    if (!versionCmd) return cb(null, pkg.version);
    var cmd = versionCmd.split(' ');
    grunt.util.spawn({
      cmd: cmd[0],
      args: cmd.slice(1)
    }, function(err, res) {
      lastVersionGot = res.stdout.replace(/^v/,'');
      cb(err, lastVersionGot);
    });
  }

  var pkg = grunt.file.readJSON('package.json');

// auto-load all package.json dependencies with names starting with 'grunt-'
  Object.keys(pkg.devDependencies)
    .filter(function(dep) { return dep.indexOf('grunt-') === 0; })
    .forEach(grunt.loadNpmTasks);
// and load thmaa task
  grunt.loadNpmTasks('thmaa');

  grunt.registerTask('build', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:quickcompile', 'thmaa:buildver', 'compress']);
  grunt.registerTask('release', ['jsonlint', 'jshint', 'thmaa:check', 'thmaa:compile', 'thmaa:releasever', 'compress']);
  grunt.registerTask('default', ['build']);
};
