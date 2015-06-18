import { EventEmitter } from "events";

class Logger extends EventEmitter {
  constructor(config, callback) {
    this.config = config;
    this.callback = callback;
  }
  info(str) {
    this.emit('info', str);
    return this;
  }
  warn(str) {
    this.emit('warn', str);
    return this;
  }
  fail(str) {
    this.emit('fail', str);
    var err = new Error(str);
    if (this.callback) {
      process.nextTick(() => this.callback(err))
    } else if (this.config.debug) {
      throw err;
    }
    return this;
  }
}


function createLogger(config, callback) {
  return new Logger(config, callback);
}

export default createLogger;