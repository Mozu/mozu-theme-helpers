"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var path = _interopRequire(require("path"));

var zubat = _interopRequire(require("zubat"));

var colors = _interopRequire(require("colors"));

var getThemeDir = _interopRequire(require("../utils/get-theme-dir"));

var metadata = _interopRequire(require("../utils/metadata"));

var compile = function compile(opts, log, cb) {
  var dir = opts.dir;
  var manualancestry = opts.manualancestry;
  var _opts$ignore = opts.ignore;
  var ignore = _opts$ignore === undefined ? [] : _opts$ignore;
  var _opts$logLevel = opts.logLevel;
  var logLevel = _opts$logLevel === undefined ? 2 : _opts$logLevel;

  var themeDir = getThemeDir(dir);

  if (themeDir) {
    return log.fail("Not inside a theme directory. Please supply a theme directory to compile.");
  }

  var base = metadata.read(themeDir, "theme").about["extends"];

  if (base) manualancestry = [path.resolve(themeDir, "references", base)];

  ignore.push("/references", "\\.git", "node_modules", "^/resources", "^/tasks", "\\.zip$");

  var job = zubat(themeDir, opts, function (err) {
    if (!err) log.info("Theme compilation complete.");
    cb(err);
  });

  job.on("log", function (str, sev) {
    switch (sev) {
      case "error":
        job.cleanup(function () {
          return cb(new Error("Zubat fainted. " + str));
        });
        break;
      case "warning":
        job.cleanup(function () {
          return cb(new Error("zubat: " + str));
        });
        break;
      default:
        log.info("zubat: " + str);
    }
  });
};

compile.transformArguments = function (_ref) {
  var options = _ref.options;
  var _args = _ref._args;

  options.dir = _args[0] || process.cwd();
};

compile._doc = {
  args: "<path>",
  description: "Compile theme scripts, respecting inheritance.",
  options: {
    "--ignore": "Speed up! Specify a pattern of files and directories to ignore when copying, relative to root. Defaults to \".git, node_modules\"",
    "--dest": "Specify a destination other than the default /compiled/scripts directory of your theme.",
    "--verbose": "Talk a lot.",
    "--quiet": "Don't talk at all."
  }
};

module.exports = compile;