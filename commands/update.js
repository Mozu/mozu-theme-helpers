var path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    shellOut = require('../utils/shell-out'),
    getThemeDir = require('../utils/get-theme-dir')
    die = require('../utils/die');

var coreVersions = require('./check').coreVersions.slice();
module.exports = function(argv, done) {
    var themeDir = argv._[1] || getThemeDir(process.cwd()), themePath;
    if (!themeDir) {
      die("Please supply a theme directory whose references I should check.");
    }
    themePath = path.resolve(process.cwd(), themeDir);
    if (!fs.existsSync(themePath)) {
      die("Theme directory " + themeDir + " not found.")
    }
    shellOut('bower cache clean', function(err) {
      if (err) die('Cache clean failed: ' + err.message);
      coreVersions.forEach(function(ver) {
        rimraf(path.resolve(themePath, 'references', 'core' + ver), function(err) {
          if (err) die(err.message);
          var json = '';
          var child = shellOut('bower install core' + ver + '=mozu/core-theme#^' + ver + ' -j --production --config.directory=references', function() {
            if (err) throw err;
            JSON.parse(json).filter(function(log) { return log.id === "resolved" }).forEach(function(log) {
              console.log("Your reference to Core Theme version " + ver + " is now at version " + log.message.split('#').pop());
            });
            coreVersions = coreVersions.slice(1);
            if (coreVersions.length === 0) done();
          }, { stdio: 'pipe', cwd: themePath });
          child.stderr.setEncoding('utf8')
          child.stderr.on('data', function(chunk) {
            json += chunk;
          });
        });
      });
    }, { cwd: themePath } );
  }
