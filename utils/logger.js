"use strict";

module.exports = createLogger;

var EventEmitter = require("events").EventEmitter;

function createLogger(config, callback) {
  var l = new EventEmitter();
  l.info = function (str) {
    return l.emit("info", str);
  };
  l.warn = function (str) {
    return l.emit("warn", str);
  };
  l.fail = function (str) {
    l.emit("fail", str);
    var err = new Error(str);
    if (callback) {
      setImmediate(callback.bind(err));
    } else {
      throw err;
    }
  };
  return l;
}