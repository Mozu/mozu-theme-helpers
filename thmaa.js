var path = require('path'),
    fs = require('fs'),
    die = require('./utils/die'),

    commands = fs.readdirSync(path.resolve(__dirname, 'commands')).map(function(f) {
      return path.basename(f, '.js');
    });

module.exports = function(command) {

  if (commands.indexOf(command) === -1) {
    die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  require('./commands/' + command).apply(this, [].slice.call(arguments, 1));

};
