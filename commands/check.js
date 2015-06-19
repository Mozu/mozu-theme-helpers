"use strict";

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var path = _interopRequire(require("path"));

var os = _interopRequire(require("os"));

var fs = _interopRequire(require("fs"));

var colors = _interopRequire(require("colors"));

var semver = _interopRequire(require("semver"));

var slug = _interopRequire(require("slug"));

var getThemeDir = _interopRequire(require("../utils/get-theme-dir"));

var metadataHandler = _interopRequire(require("../utils/metadata"));

var getLatestGithubRelease = _interopRequire(require("../utils/get-latest-github-release"));

var check = function check(_ref, log, cb) {
  var dir = _ref.dir;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  var themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("Not inside theme directory. Please supply a theme directory for reference check."));
  }

  var pkg = metadataHandler.read(themeDir, "package");
  var theme = metadataHandler.read(themeDir, "theme");

  if (theme.about["extends"] !== pkg.config.baseTheme) {
    return cb(new Error("Theme extends " + theme.about["extends"] + " but package.json instead refers to a repo for " + pkg.config.baseTheme + "."));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  var baseThemeDir = path.join(themeDir, "references", slug(pkg.config.baseTheme));
  if (!fs.existsSync(path.join(baseThemeDir, "package.json"))) {
    return cb(new Error("A reference directory or package.json for " + pkg.config.baseTheme + " does not exist in ./references, so it cannot be updated."));
  }

  var currentBaseThemeVersion = metadataHandler.read(baseThemeDir, "package").version;

  getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function (release) {
    if (!release) {
      return cb(new Error("No releases found in " + pkg.config.baseThemeRepo));
    }
    var latest = semver.clean(release.tag_name);
    if (semver.gt(latest, currentBaseThemeVersion)) {
      if (semver.satisfies(latest, pkg.config.baseThemeVersion)) {
        cb(new Error(("\nYour theme extends " + theme.about["extends"] + ", and its repository,\n" + pkg.config.baseThemeRepo + ", has reported a newer version!\nUse your build tools (`grunt updatereferences`) to update\nyour local references from " + pkg.config.baseThemeVersion + " \nto " + latest + ", and check the repository for release notes.").replace(/\n/g, " ").bold));
      } else if (semver.ltr(latest, pkg.config.baseThemeVersion)) {
        cb(new Error(("\nNo available version of " + theme.about["extends"] + " satisfies your specified\nversion range " + pkg.config.baseThemeVersion + ". The newest available \nversion is " + latest + ".").replace(/\n/g, " ").bold));
      } else {
        log.info(("A version of " + theme.about["extends"] + " is available that is newer than\nyour specified version range " + pkg.config.baseThemeVersion + ". Visit\nthe repository homepage " + pkg.config.baseThemeRepo + " for details.").replace(/\n/g, " "));
        cb(null);
      }
    } else {
      log.info("Current version of base theme " + pkg.config.baseTheme + ", " + latest + ", is the latest.");
      cb(null);
    }
  })["catch"](cb);
};

check.transformArguments = function (_ref) {
  var options = _ref.options;
  var _args = _ref._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check if references are up to date.",
  options: {
    "--no-cache": "Skip the local cache. This results in a call out to the remote repository every time, instead of relying on cache."
  }
};

module.exports = check;