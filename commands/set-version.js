"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var getThemeDir = _interopRequire(require("../utils/get-theme-dir"));

var metadata = _interopRequire(require("../utils/metadata"));

var setVersion = function setVersion(_ref, log, cb) {
  var dir = _ref.dir;
  var version = _ref.version;
  var bower = _ref.bower;

  var toUpdate = ["package", "bower"];
  var pkg = arguments[0]["package"];
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

  toUpdate.forEach(function (filename) {
    try {
      metadata.modify(themeDir, filename, function (json) {
        json.version = version;
        return json;
      });
      log.info("Updated " + filename + " file to version " + version);
    } catch (e) {}
  });

  metadata.modify(themeDir, "theme", function (json) {
    json.about.version = version;
    return json;
  });
  log.info("Update theme.json to version " + version);
  cb();
};

var cwd = process.cwd();
setVersion.transformArguments = function (_ref) {
  var options = _ref.options;
  var _args = _ref._args;

  var _args2 = _slicedToArray(_args, 2);

  var dir = _args2[0];
  var version = _args2[1];

  options.dir = version ? dir : cwd;
  options.version = version || dir || cwd;
  return options;
};

setVersion._doc = {
  args: "<path> <version>",
  description: "Set and synchronize the version number across all config files.",
  options: {
    "--no-package": "Do not update package.json.",
    "--no-bower": "Do not update bower.json."
  }
};

module.exports = setVersion;