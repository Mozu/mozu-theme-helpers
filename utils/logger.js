"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var EventEmitter = require("events").EventEmitter;

var Logger = (function (_EventEmitter) {
  function Logger(config, callback) {
    _classCallCheck(this, Logger);

    this.config = config;
    this.callback = callback;
  }

  _inherits(Logger, _EventEmitter);

  _createClass(Logger, {
    info: {
      value: function info(str) {
        this.emit("info", str);
        return this;
      }
    },
    warn: {
      value: function warn(str) {
        this.emit("warn", str);
        return this;
      }
    },
    fail: {
      value: function fail(str) {
        var _this = this;

        this.emit("fail", str);
        var err = new Error(str);
        if (this.callback) {
          process.nextTick(function () {
            return _this.callback(err);
          });
        } else if (this.config.debug) {
          throw err;
        }
        return this;
      }
    }
  });

  return Logger;
})(EventEmitter);

function createLogger(config, callback) {
  return new Logger(config, callback);
}

module.exports = createLogger;