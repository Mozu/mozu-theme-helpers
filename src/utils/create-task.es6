import { EventEmitter } from "events";

export default function createTask() {
  var l = new EventEmitter();
  l.info = str => l.emit('info', str);
  l.warn = str => l.emit('warn', str);
  l.fail = str => {
    let msg = 'mozu-theme-helpers: '
    if (str && str.message) {
      msg += str.message;
    }
    if (str && str.stack) {
      msg += "\n" + str.stack;
    }
    l.emit('error', new Error(msg));
  };
  l.done = x => l.emit('done', x);
  return l;
}
