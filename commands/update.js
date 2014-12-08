var path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    shellOut = require('../utils/shell-out'),
    getThemeDir = require('../utils/get-theme-dir'),
    editThemeJson = require('../utils/edit-theme-json'),
    die = require('../utils/die');

var coreMajorVersions = require('./check').coreMajorVersions.slice();
var update = function(dir, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = dir;
    dir = process.cwd();
  }
  var themeDir = getThemeDir(dir);
  if (!themeDir) {
    die("Not inside a theme directory. Please supply a theme directory whose references I should update.");
  }
  shellOut('bower cache clean', function(err) {
    if (err) die('Cache clean failed: ' + err.message);
    if (!opts || !opts.all) {
      coreMajorVersions = [editThemeJson.read(themeDir, 'theme.json').about.extends.replace(/core/i,'')];
    }
    coreMajorVersions.forEach(function(ver) {
      rimraf(path.resolve(themeDir, 'references', 'core' + ver), function(err) {
        if (err) die(err.message);
        var json = '';
        var child = shellOut('bower install core' + ver + '=mozu/core-theme#^' + ver + ' -j --production --config.directory=references', function() {
          if (err) throw err;
          JSON.parse(json).filter(function(log) { return log.id === "resolved" }).forEach(function(log) {
            console.log("Your reference to Core Theme version " + ver + " is now at version " + log.message.split('#').pop());
          });
          coreMajorVersions = coreMajorVersions.slice(1);
          if (coreMajorVersions.length === 0) cb();
        }, { stdio: 'pipe', cwd: themeDir });
        child.stderr.setEncoding('utf8')
        child.stderr.on('data', function(chunk) {
          json += chunk;
        });
      });
    });
  }, { cwd: themeDir } );
};

update._doc = {
  args: '<path>',
  description: 'Update references folder.',
  options: {
    "--all": "Download all versions of the Core theme instead of just the version this theme extends."
  }
}

module.exports = update;