"use strict";

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var path = _interopRequire(require("path"));

var fs = _interopRequire(require("fs"));

var logger = _interopRequire(require("./utils/logger"));

// dynamically read the available commands out of the commands directory
var commands = fs.readdirSync(path.resolve(__dirname, "commands")).map(function (f) {
  return path.basename(f, ".js");
});

module.exports = function (command, config, cb) {

  if (commands.indexOf(command) === -1) {
    throw new Error("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  if (typeof config !== "object") {
    throw new Error("You must pass a config object as the second argument to thmaa.");
  }

  if (typeof cb !== "function") {
    cb = config.callback;
  }

  if (typeof cb !== "function") {
    throw new Error("You must pass a callback as the last argument to thmaa.");
  }

  var log = logger(config, cb);

  var command = require("./commands/" + command);

  if (config._args) {
    command(command.transformArguments(config), log, cb);
  } else {
    command(config, log, cb);
  }

  return log;
};