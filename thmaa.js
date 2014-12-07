var die = require('./utils/die'),
    argv = require('minimist')(process.argv.slice(2)),
    command = argv._[0] || 'help',

    commands = [
      'help',
      'new',
      'override',
      'update',
      'check'
    ];

module.exports = function() {
  if (commands.indexOf(command) === -1) {
    die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  require('./commands/' + command)(argv, function(err) {
    if (err) die(err.message);
    process.exit(0);
  });

}
