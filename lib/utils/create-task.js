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
    l.emit('error', new Error('mozu-theme-helpers: ' + str));
  };
  l.done = function (x) {
    return l.emit('done', x);
  };
  return l;
}