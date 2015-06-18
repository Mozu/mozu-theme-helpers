"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = expandTarball;

var zlib = _interopRequire(require("zlib"));

var tar = _interopRequire(require("tar"));

var pipe = _interopRequire(require("multipipe"));

function expandTarball(opts) {
  return pipe(zlib.createGunzip(), tar.Extract(opts));
}