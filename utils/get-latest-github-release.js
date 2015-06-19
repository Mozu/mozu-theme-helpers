"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var getGithubReleases = _interopRequire(require("./get-github-releases"));

var concat = _interopRequire(require("concat-stream"));

var semver = _interopRequire(require("semver"));

module.exports = function (repo, _ref) {
  var _ref$versionRange = _ref.versionRange;
  var versionRange = _ref$versionRange === undefined ? "*" : _ref$versionRange;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  return new _core.Promise(function (resolve, reject) {
    var releaseStream = getGithubReleases(repo, { versionRange: versionRange, cache: cache });
    releaseStream.on("error", reject);
    releaseStream.pipe(concat(function (releases) {
      if (!releases || releases.length === 0) {
        return resolve(null);
      }
      var qualifyingVersions = releases.map(function (_ref2) {
        var tag_name = _ref2.tag_name;
        return semver.clean(tag_name);
      });
      var maxVersion = semver.maxSatisfying(qualifyingVersions, versionRange.toString());
      // send back the release object matching the max satisfying version,
      // and the version string itself
      resolve(releases[qualifyingVersions.indexOf(maxVersion)]);
    }));
  });
};