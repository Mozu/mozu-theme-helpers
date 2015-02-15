var getThemeDir = require('../utils/get-theme-dir'),
    metadata = require('thmaa-metadata'),
    die = require('../utils/die');

var setVersion = function(opts, cb) {

  var dir = opts.dir,
      version = opts.version;

  var toUpdate = ['package','bower'];

  if (opts['no-package'] || (opts.package === false)) toUpdate.shift();
  if (opts['no-bower'] || (opts.bower === false)) toUpdate.pop();
  var themeDir = getThemeDir(dir);
  if (!themeDir) die("No theme detected. Cannot set version.");
  if (!version) die("Please supply a version string to set.");
  version = version.toString();
  toUpdate.forEach(function(filename) {
    try {
      metadata.modify(themeDir, filename, function(json) {
        json.version = version;
        return json;
      });
      console.log('Updated ' + filename + ' file to version ' + version);
    } catch(e) {}
  });
  metadata.modify(themeDir, 'theme', function(json) {
    json.about.version = version;
    return json;
  });
  console.log('Updated theme.json to version ' + version);
  cb();
};

setVersion.transformArguments = function(conf) {
  var opts = conf.options;
  opts.dir = conf._args[0];
  if (conf._args.length > 1) {
    opts.dir = conf._args[0]
    opts.version = conf._args[1];
  } else {
    opts.dir = process.cwd();
    opts.version = conf._args[0];
  }
  return opts;
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