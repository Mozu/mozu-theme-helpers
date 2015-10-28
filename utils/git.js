"use strict";

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

module.exports = git;

var childProcess = _interopRequire(require("child_process"));

var colors = _interopRequire(require("colors"));

function git(command, reason, options) {
  var text = undefined;
  var args = undefined;
  if (Array.isArray(command)) {
    text = command.join(" ");
    args = command;
  } else {
    text = command;
    args = command.split(" ");
  }
  var log = options && options.logger || console.log;
  return new _core.Promise(function (resolve, reject) {
    try {
      (function () {
        log(reason + ": \n      " + ("git " + text).yellow, {
          markdown: false
        });
        var opts = _core.Object.assign({
          encoding: "utf8" }, options);
        var quiet = opts.quiet;
        delete opts.quiet; // in case that option ever affects node
        var proc = childProcess.spawn("git", args, opts);
        var output = "";
        var errput = "";
        if (proc.stdout) {
          proc.stdout.on("data", function (chunk) {
            return output += chunk;
          });
        }
        if (proc.stderr) {
          proc.stderr.on("data", function (chunk) {
            return errput += chunk;
          });
        }
        proc.on("close", function (code) {
          if (code !== 0) {
            reject(new Error(errput));
          } else {
            if (!quiet) log(output);
            resolve(output);
          }
        });
      })();
    } catch (e) {
      reject(e);
    }
  });
}