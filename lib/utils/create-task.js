'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createTask;

var _events = require('events');

function createTask() {
  var l = new _events.EventEmitter();
  l.info = function (str) {
    return l.emit('info', str);
  };
  l.warn = function (str) {
    return l.emit('warn', str);
  };
  l.fail = function (str) {
    var msg = 'mozu-theme-helpers: ';
    if (str && str.message) {
      msg += str.message;
    }
    if (str && str.stack) {
      msg += "\n" + str.stack;
    }
    l.emit('error', new Error(msg));
  };
  l.done = function (x) {
    return l.emit('done', x);
  };
  return l;
}