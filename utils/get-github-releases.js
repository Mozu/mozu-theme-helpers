"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = getReleases;

var getGithubResource = _interopRequire(require("./get-github-resource"));

var parse = require("JSONStream").parse;

function getReleases(repo, _ref) {
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  return getGithubResource({
    pathname: "/repos/" + repo + "/releases",
    cache: cache
  }).pipe(parse());
}