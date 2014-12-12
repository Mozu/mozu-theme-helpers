var path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),
    https = require('https'),
    extractTarballStream = require('../utils/extract-tarball-stream'),
    getThemeDir = require('../utils/get-theme-dir'),
    editThemeJson = require('../utils/edit-theme-json'),
    getLatestGithubRelease = require('../utils/get-latest-github-release'),
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
  
  if (!opts || !opts.all) {
    coreMajorVersions = [editThemeJson.read(themeDir, 'theme.json').about.extends.replace(/core/i,'')];
  }

  coreMajorVersions.forEach(function(ver) {
    var refdir = path.resolve(themeDir, 'references', 'core' + ver);
    rimraf(refdir, function(err) {
      if (err) die(err.message);
      getLatestGithubRelease('mozu/core-theme', ver, function(release, newVer) {
        console.log('Found release ' + newVer + ' on GitHub. Downloading and extracting to ' + path.relative(themeDir, process.cwd()) + 'references/core' + ver + '...');

        function writeTarball(res) {
          extractTarballStream(res, { path: refdir, strip: 1 } , function() {
            console.log("Your reference to Core Theme version " + ver + " is now at version " + newVer);
            console.log('Finishing extraction...');
            coreMajorVersions = coreMajorVersions.slice(1);
            if (coreMajorVersions.length === 0) {
              cb(null);
            }
          });
        }

        https.get({
          host: 'api.github.com',
          path: release.tarball_url.replace('https://api.github.com', ''),
          headers: {
            'User-Agent': 'thmaa'
          }
        }, function(res) {
          if (res.statusCode === 301 || res.statusCode === 302) {
            // it often will, this is a CDN redirect
            https.get(res.headers.location, writeTarball);
          } else {
            writeTarball(res);
          }
        });
      });
    });  
  });
};

update._doc = {
  args: '<path>',
  description: 'Update references folder.',
  options: {
    "--all": "Download all versions of the Core theme instead of just the version this theme extends."
  }
}

module.exports = update;