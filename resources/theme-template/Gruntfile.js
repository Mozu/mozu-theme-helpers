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

versionCmd = ':'; // e.g. 'git describe --tags --always' or 'svn info'

function getVersion(cb) {
  grunt.util.spawn(versionCmd, cb);
}

grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    theme: grunt.file.readJSON('theme.json'),
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
    zubat: {
      main: {
        dir: '.',
        manualancestry: ['./references/<%= theme.about.extends %>'],
        ignore: ['/references','\\.git','node_modules','^/resources','^/tasks','\\.zip$']
      }
    },
    compress: {
      build: {
        options: {
          archive: '<%= pkg.name %>.zip',
          pretty: true
        },
        files: [{
          src: filesToArchive,
          dest: '/'
        }]
      }
    },
    thmaa: {
      check: {}
    },
    watch: {
      json: {
        files: jsonFiles,
        tasks: ['jsonlint']
      },
      javascript: {
        files: jsFiles,
        tasks: ['jshint','zubat']
      },
      compress: {
        files: filesToArchive,
        tasks: ['compress']
      }
    },
    setver: {
      release: {
        cmd: versionCmd,
        themejson: true,
        packagejson: true,
        readmemd: true
      },
      build: {
        cmd: versionCmd,
        themejson: true,
      },
      renamezip: {
        cmd: versionCmd,
        filenames: ["<%= pkg.name %>.zip"]
      }
    }
  });

  [
   'grunt-jsonlint',
   'grunt-contrib-jshint',
   'grunt-contrib-watch',
   'grunt-contrib-compress',
   'grunt-zubat'
  ].forEach(grunt.loadNpmTasks);


  var gCommands = [
    'new',
    'override',
    'update',
    'check'
  ],
  thmaa = require('thmaa');
  grunt.registerTask('thmaa', function() {
    var done = this.async();
    var target = this.target || this.args[0];
    var args = this.data && this.data.params;
    if (gCommands.indexOf(target) === -1) {
      grunt.fail.warn('Unrecognized thmaa command `' + target + '`.');
      return false;
    }
    switch(target) {
      case "new":
      case "override":
        if (!(args && args.length > 0)) {
          grunt.fail.warn('The thmaa command `' + target + '` requires at least one argument, or a function that takes a callback.')
        }
        break;
    }
    if (typeof args === "function") {
      args(run);
    } else {
      run(null, args)
    }
    function run(err, params) {
      if (err) {
        grunt.fail.warn(err);
        return false;
      }
      try {
        thmaa.apply(this, [target].concat(params).concat([this.data && this.data.options, done]));
      } catch(e) {
        grunt.fail.warn(e.message);
      }
    }
  });

  grunt.registerTask('build', ['jsonlint', 'jshint', 'checkreferences', 'zubat', 'setver:build', 'compress', 'setver:renamezip']);
  grunt.registerTask('release', ['jsonlint', 'jshint', 'zubat', 'setver:release', 'compress', 'setver:renamezip']);
  grunt.registerTask('default', ['build']);
};
