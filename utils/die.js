var util = require('util'),
    color = require('cli-color').redBright;

module.exports = function(str, code) {
  util.puts(color(str));
  process.exit(code || 1);
}
