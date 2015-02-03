var path = require('path'),
    fs = require('fs'),
    die = require('./utils/die'),

    // dynamically read the available commands out of the commands directory
    commands = fs.readdirSync(path.resolve(__dirname, 'commands')).map(function(f) {
      return path.basename(f, '.js');
    });

module.exports = function(command, config, cb) {


  // tell die to throw errors with stacktraces if debug mode
  die.debug = config && config.debug;

  if (commands.indexOf(command) === -1) {
    die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  if ((typeof config) !== "object" ) {
    die("You must pass a config object as the second argument to thmaa.");
  }

  if ((typeof cb) !== "function") {
    cb = config.callback;
  }

  if ((typeof cb) !== "function") {
    die("You must pass a callback as the last argument to thmaa.");
  }

  // give die the final callback to call with any errors
  die.cb = cb;

  var command = require('./commands/' + command);
  if (config._args) {
    return command(command.transformArguments(config), cb);
  } else {
    return command(config, cb);
  }

};
