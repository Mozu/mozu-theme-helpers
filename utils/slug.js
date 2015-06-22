"use strict";

var _slicedToArray = require("babel-runtime/helpers/sliced-to-array")["default"];

module.exports = slug;
var REs = [[/[\/\\\.~`#\$%\^&\*\+=]/g, "-"], [/['"]/g, ""]];

function slug(str) {
  if (typeof str !== "string") throw new Error("Cannot slugify " + str);
  return REs.reduce(function (s, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var re = _ref2[0];
    var sub = _ref2[1];
    return s.replace(re, sub);
  }, str);
}