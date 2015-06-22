import { EventEmitter } from "events";

export default function createLogger(config, callback) {
  var l = new EventEmitter();
  l.info = (str) => l.emit('info', str);
  l.warn = (str) => l.emit('warn', str);
  l.fail = (str) => {
    l.emit('fail', str);
    var err = new Error(str);
    if (callback) {
      setImmediate(callback.bind(err));
    } else {
      throw err;
    }
  };
  return l;
}
