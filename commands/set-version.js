var getThemeDir = require('../utils/get-theme-dir'),
    editThemeJson = require('../utils/edit-theme-json'),
    die = require('../utils/die');

var setVersion = function(dir, version, opts, cb) {

  var toUpdate = ['package.json','bower.json'];
  if (arguments.length === 3 && typeof opts === "function") {
    cb = opts;
    opts = version;
    version = dir;
    dir = process.cwd();
  }
  opts = opts || {};
  if (opts['no-package']) toUpdate.shift();
  if (opts['no-bower']) toUpdate.pop();
  var themeDir = getThemeDir(process.cwd());
  if (!themeDir) die("No theme detected. Cannot set version.");
  if (!version) die("Please supply a version string to set.");
  version = version.toString();
  toUpdate.forEach(function(filename) {
    try {
      editThemeJson.modify(themeDir, filename, function(json) {
        json.version = version;
        return json;
      });
      console.log('Updated ' + filename + ' to version ' + version);
    } catch(e) {}
  });
  editThemeJson.modify(themeDir, 'theme.json', function(json) {
    json.about.version = version;
    return json;
  });
  console.log('Updated theme.json to version ' + version);
  cb();
};

setVersion._doc = {
  args: '<path> <version>',
  description: 'Set and synchronize the version number across all config files.',
  options: {
    '--no-package': 'Do not update package.json.',
    '--no-bower': 'Do not update bower.json.'
  }
};

module.exports = setVersion;