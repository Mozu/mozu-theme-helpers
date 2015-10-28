"use strict";

var _slicedToArray = require("babel-runtime/helpers/sliced-to-array")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var colors = _interopRequire(require("colors"));

var getThemeDir = _interopRequire(require("../utils/get-theme-dir"));

var metadataHandler = _interopRequire(require("../utils/metadata"));

var git = _interopRequire(require("../utils/git"));

var gitFetchRemoteTags = _interopRequire(require("../utils/git-fetch-remote-tags"));

var check = function check(_ref, log, cb) {
  var dir = _ref.dir;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  var themeDir = getThemeDir(dir);

  var pkg = metadataHandler.read(themeDir, "package");
  var theme = metadataHandler.read(themeDir, "theme");

  if (theme.about["extends"]) {
    return cb(new Error("Themes that use the `about.extends` legacy option " + "are not compatible with this version of the " + "theme helpers."));
  }

  var gopts = {
    logger: function (x) {
      return log.info(x);
    },
    quiet: true
  };

  var prerelease = theme.about.baseThemeChannel === "prerelease";

  git("remote show basetheme", "Checking if base theme remote exists...", gopts)["catch"](function () {
    if (!theme.about.baseTheme) {
      return cb(new Error("No theme repo specified; cannot check for updates."));
    } else {
      return git("remote add basetheme " + theme.about.baseTheme, "Base theme specified in theme.json. Adding remote to " + "git repository", gopts);
    }
  }).then(function () {
    return git("config remote.basetheme.tagopt --no-tags", "Ensuring that no tags are downloaded from base theme", gopts);
  }).then(function () {
    return git("remote update basetheme", "Updating basetheme remote", gopts);
  }).then(function () {
    return _core.Promise.all([gitFetchRemoteTags({ prerelease: prerelease, logger: gopts.logger }), git("merge-base master basetheme/master", "Getting most recently merged basetheme commit", gopts)]);
  }).then(function (_ref2) {
    var _ref22 = _slicedToArray(_ref2, 2);

    var remoteTags = _ref22[0];
    var mergeBase = _ref22[1];

    mergeBase = mergeBase.trim();
    var tagIndex = remoteTags.reduce(function (target, tag, i) {
      return tag.commit === mergeBase ? i : target;
    }, -1);
    if (tagIndex === -1) {
      log.warn("No merge base found among tags! You may have merged an " + "unreleased commit.");
    }
    var newVersions = remoteTags.slice(0, tagIndex).map(function (t) {
      return "" + t.version.bold.yellow + " (commit: " + t.commit + ")";
    });
    if (newVersions.length > 0) {
      log.warn("\nThere are new versions available! \n\n".green.bold + newVersions.join("\n") + "\n\nTo merge a new version, run `git merge <commit>`, where " + "<commit> is the commit ID corresponding to the version you " + "would like to begin to merge.\n");
      log.warn(("You cannot merge the tag directly, because the default " + "configuration does not fetch tags from the base theme " + "repository, to avoid conflicts with your own tags.").gray);
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
  description: "Check for new versions of the base theme..",
  options: {}
};

module.exports = check;