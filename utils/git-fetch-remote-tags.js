"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

module.exports = fetchRemoteTags;

var semver = _interopRequire(require("semver"));

var git = _interopRequire(require("./git"));

function fetchRemoteTags() {
  var opts = arguments[0] === undefined ? {} : arguments[0];

  return git("ls-remote --tags basetheme", "Detecting base theme versions", {
    quiet: opts.hasOwnProperty("quiet") ? opts.quiet : true,
    logger: opts.logger
  }).then(function (tags) {
    var uniques = new _core.Set();
    return tags.trim().split("\n").map(function (l) {
      var m = l.match(/([0-9A-Fa-f]+)\trefs\/tags\/v?([^\^]+)\^\{\}/i);
      if (m) {
        var version = semver.clean(m[2]);
        if (!uniques.has(version)) {
          uniques.add(version);
          return {
            commit: m[1],
            version: version
          };
        }
      }
    }).filter(opts.prerelease ? function (x) {
      return !!x && !!x.version;
    } : function (x) {
      return !!x && !!x.version && ! ~x.version.indexOf("-");
    }).sort(function (x, y) {
      return semver.rcompare(x.version, y.version);
    });
  });
}