import { EventEmitter } from "events";

export default function createTask() {
  var l = new EventEmitter();
  l.info = str => l.emit('info', str);
  l.warn = str => l.emit('warn', str);
  l.fail = str => {
    l.emit('error', new Error(`mozu-theme-helpers: ${str}`));
  };
  l.done = x => l.emit('done', x);
  return l;
}
