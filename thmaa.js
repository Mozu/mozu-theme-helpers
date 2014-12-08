var die = require('./utils/die'),

    commands = [
      'help',
      'new',
      'override',
      'update',
      'check'
    ];

module.exports = function(command) {

  if (commands.indexOf(command) === -1) {
    die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  require('./commands/' + command).apply(this, [].slice.call(arguments, 1));

};
