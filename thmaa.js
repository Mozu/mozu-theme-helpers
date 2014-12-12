var path = require('path'),
    fs = require('fs'),
    die = require('./utils/die'),

    // dynamically read the available commands out of the commands directory
    commands = fs.readdirSync(path.resolve(__dirname, 'commands')).map(function(f) {
      return path.basename(f, '.js');
    });

module.exports = function(command) {

  var args = [].slice.call(arguments, 1),
      // different commands take different numbers of required arguments,
      // but the last two have to be opts and cb
      cb = args[args.length-1],
      opts = args[args.length-2];

  // tell die to throw errors with stacktraces if debug mode
  die.debug = opts && opts.debug;

  if (commands.indexOf(command) === -1) {
    die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
  }

  if ((typeof cb) !== "function" ) {
    die("You must pass a callback as the last argument to thmaa.");
  }

  // give die the final callback to call with any errors
  die.cb = cb;

  if ((typeof opts) !== "object") {
    // add an empty object of arguments in the right spot
    args.splice(args.length-1, 0, {});
  }

  require('./commands/' + command).apply(this, args);

};
