import getThemeDir from "../utils/get-theme-dir";
import metadata from "../utils/metadata";

var setVersion = function({ dir, version, bower }, log, cb) {
  var toUpdate = ['package','bower'];
  var pkg = arguments[0].package;
  if (pkg === false) toUpdate.shift();
  if (bower === false) toUpdate.pop();

  var themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("No theme detected. Cannot set version."));
  }

  if (!version) {
    return cb(new Error("Please supply a version string to set."));
  }

  version = version.toString();

  toUpdate.forEach(function(filename) {
    try {
      metadata.modify(themeDir, filename, json => {
        json.version = version;
        return json;
      });
      log.info(`Updated ${filename} file to version ${version}`);
    } catch(e) {}
  });

  metadata.modify(themeDir, 'theme', json => {
    json.about.version = version;
    json;
  });
  log.info(`Update theme.json to version ${version}`);
  cb();

};

var cwd = process.cwd();
setVersion.transformArguments = function({ options, _args }) {
  var [dir, version] = _args;
  options.dir = version ? dir : cwd;
  options.version = version || dir || cwd;
  return options;
}

setVersion._doc = {
  args: '<path> <version>',
  description: 'Set and synchronize the version number across all config files.',
  options: {
    '--no-package': 'Do not update package.json.',
    '--no-bower': 'Do not update bower.json.'
  }
};

export default setVersion;