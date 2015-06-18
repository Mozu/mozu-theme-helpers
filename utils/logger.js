"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = require("events").EventEmitter;

var Logger = (function (EventEmitter) {
  function Logger(config, callback) {
    _classCallCheck(this, Logger);

    this.config = config;
    this.callback = callback;
  }

  _inherits(Logger, EventEmitter);

  _prototypeProperties(Logger, null, {
    info: {
      value: function info(str) {
        this.emit("info", str);
        return this;
      },
      writable: true,
      configurable: true
    },
    warn: {
      value: function warn(str) {
        this.emit("warn", str);
        return this;
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    }
  });

  return Logger;
})(EventEmitter);

function createLogger(config, callback) {
  return new Logger(config, callback);
}

module.exports = createLogger;