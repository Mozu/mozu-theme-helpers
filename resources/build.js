var path = require('path'),
    fs = require('fs'),
    https = require('https'),
    rimraf = require('rimraf'),
    getLatestGithubRelease = require('../utils/get-latest-github-release'),
    extractTarballStream = require('../utils/extract-tarball-stream');


// add .inherited files to theme template
    ignore = [
      ".DS_Store",
      ".git",
      ".inherited",
      ".npmignore",
      ".gitignore",
      "CHANGELOG.md",
      "Gruntfile.js",
      "README.md",
      "RELEASE_NOTES.md",
      "bower.json",
      "core-thumb.png",
      "node_modules",
      "npm-shrinkwrap.json",
      "tasks",
      "vendor"
    ].reduce(function(m, n) {
      m[n] = true;
      return m;
    }, {});

var corePath = path.resolve(__dirname, 'core-for-template');

function writeTarball(res) {
  extractTarballStream(res, { path: corePath, strip: 1 }, function() {
    console.log('Downloaded and extracted core theme. Writing .inherited files...');
    (function walk(coredir, templatedir) {
      var inheritedDir, fileList = fs.readdirSync(coredir).map(function(filename) {
        if (ignore[filename]) return false;
        var stats = fs.statSync(path.resolve(coredir, filename));
        if (stats.isDirectory()) {
          var dir = path.resolve(templatedir, filename);
          rimraf(dir, function(err) {
            if (err) throw err;
            fs.mkdirSync(dir);
            walk(path.resolve(coredir, filename), dir);
          });
          return false;
        } else if (stats.isFile() && !fs.existsSync(path.resolve(templatedir, filename))) {
          return filename;
        }
      }).filter(function(x) { return x; });

      if (fileList.length > 0) {
        fs.writeFileSync(path.resolve(templatedir, '.inherited'), fileList.join('\n'));
      }
    })(corePath, path.resolve(__dirname, './theme-template'));

  });
}

getLatestGithubRelease('mozu/core-theme', '6', function(release) {
  https.get({
    host: 'api.github.com',
    path: release.tarball_url.replace('https://api.github.com', ''),
    headers: {
      'User-Agent': 'thmaa-build'
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

// copy usage txt into readme
require('../commands/help')({ 'no-tty': true, forcewidth: 89}, function(err, txt) {
  fs.writeFileSync(path.resolve(__dirname, '../README.md'), [fs.readFileSync(path.resolve(__dirname, './README.tpt.md'), 'utf-8'), txt, '\n'].join("\n```\n"));
  console.log('wrote README.md');
});