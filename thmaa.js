var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    die = require('./utils/die'),
    argv = require('minimist')(process.argv.slice(2)),
    command = argv._[0],

    commands = [
      'help',
      'new',
      'override',
      'update',
      'check'
    ];

  function printHelp() {
    color = require('cli-color'),
    headerTxt = fs.readFileSync(path.resolve(__dirname, './resources/header.txt'), 'utf-8')
    .split('\n')
    .map(function(line) {
      while (line.length < 80) line += " ";
      return line;
    }).join('\n'),
    usageTxt = fs.readFileSync(path.resolve(__dirname, './resources/usage.txt'), 'utf-8');

    util.puts("\n");
    util.puts(color.black.bgWhiteBright(headerTxt));
    util.puts("\n");
    util.puts(color.yellowBright(usageTxt));
    util.puts("\n");
  }

  module.exports = function() {
    if (argv.help || command === "help" || process.argv.length === 2) {
      printHelp();
      process.exit(0);
    }

    if (commands.indexOf(command) === -1) {
      die("Unrecognized command `" + command + "`. Run `thmaa help` for a list of commands.");
    }

    require('./commands/' + command)(argv, function(err) {
      if (err) die(err.message);
      console.log('Done!');
      process.exit(0);
    });

  }
