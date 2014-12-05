var childProcess = require('child_process'),
    windows = /^win/.test(process.platform);

module.exports = function(command, cb, opts) {
  var cmd = command.split(' ');
  if (windows) cmd = ['cmd','/c'].concat(cmd);
  opts = opts || {};
  if (!opts.stdio) opts.stdio = "inherit";
  var p = childProcess.spawn(cmd[0], cmd.slice(1), opts);
  p.on('close', function(code) {
    if (code !== 0) {
      cb(new Error("Command `" + command  + "` exited abnormally with code " + code + "."));
    } else {
      cb();
    }
  });
  return p;
}
