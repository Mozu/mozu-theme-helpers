var path = require('path'),
    fs = require('fs'),
    rimraf = require('rimraf'),


// add .inherited files to theme template
    ignore = [
      ".DS_Store",
      ".git",
      ".inherited",
      ".npmignore",
      "CHANGELOG.md",
      "Gruntfile.js",
      "README.md",
      "RELEASE_NOTES.md",
      "bower.json",
      "core-thumb.png",
      "node_modules",
      "npm-shrinkwrap.json",
      "vendor"
    ].reduce(function(m, n) {
      m[n] = true;
      return m;
    }, {});

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
    console.log('writing .inherited file to ./' + path.relative('./',templatedir));
    fs.writeFileSync(path.resolve(templatedir, '.inherited'), fileList.join('\n'));
  }
})(path.resolve('./node_modules/mozu-core-theme'), path.resolve('./resources/theme-template'));

// copy usage txt into readme
fs.writeFileSync('./README.md', [fs.readFileSync('./resources/README.tpt.md', 'utf-8'), fs.readFileSync('./resources/usage.txt'), '\n'].join("\n```\n"));
