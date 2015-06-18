"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var path = _interopRequire(require("path"));

var os = _interopRequire(require("os"));

var fs = _interopRequire(require("fs"));

var colors = _interopRequire(require("colors"));

var semver = _interopRequire(require("semver"));

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

  var pkg = metadata.read(themeDir, "package");
  var theme = metadata.read(themeDir, "theme");

  if (theme.about["extends"] !== pkg.config.baseTheme) {
    return cb(new Error("Theme extends " + theme.about["extends"] + " but package.json instead refers to a repo for " + pkg.config.baseTheme + "."));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function (release) {
    var latest = semver.clean(release.tag_name);
    if (semver.gt(latest, pkg.config.baseThemeVersion)) {
      cb(new Error(("\nYour theme extends " + theme.about["extends"] + ", and its repository,\n" + pkg.config.baseThemeRepo + ", has reported a newer version!\nUse your build tools (`grunt updatereferences`) to update\nyour local references from " + pkg.config.baseThemeVersion + " \nto " + latest + ", and check the repository for release notes.").bold));
    } else {
      log.info("Theme compilation complete.");
      cb(null);
    }
  }, cb);
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