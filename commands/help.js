var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    color = require('cli-color'),
    termwidth = process.stdout.columns,
    termheight = process.stdout.rows;

function pad(txt) {
  return txt.split('\n').map(function(str) {
    while (str.length < termwidth) str += " ";
    return str;
  }).join('\n');
}

var shortHeader = "\n    Theme Helper for Mozu and Associated Assets\n"

module.exports = function printHelp(argv) {
  var headerTxt = (argv.splash && termwidth >= 80 && termheight >= 30) ? fs.readFileSync(path.resolve(__dirname, '../resources/header.txt'), 'utf-8') : shortHeader,
    usageTxt = fs.readFileSync(path.resolve(__dirname, '../resources/usage.txt'), 'utf-8');

  util.puts(color.black.bgWhiteBright(pad(headerTxt)));
  util.puts(color.yellowBright(pad(usageTxt)));
};