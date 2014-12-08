var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    color = require('colors'),
    termwidth = process.stdout.columns || 80,
    termheight = process.stdout.rows || 30;

var format = (process.stdout.isTTY) ? 
  {
    header: function(str) { return str.black.bgWhite; },
    usage: function(str) { return str.yellow }
  } :
  {
    header: function(str) { return str },
    usage: function(str) { return str }
  };

function pad(txt, n) {
  return txt.split('\n').map(function(str) {
    while (str.length < n) str += " ";
    return str;
  }).join('\n');
}

var shortHeader = "\n  Theme Helper for Mozu and Associated Assets\n"

var printHelp = function(opts, cb) {
  if (!opts) opts = {};
  var headerTxt = (opts.splash && termwidth >= 80 && termheight >= 30) ? fs.readFileSync(path.resolve(__dirname, '../resources/header.txt'), 'utf-8') : shortHeader,
    usageTxt = fs.readFileSync(path.resolve(__dirname, '../resources/usage.txt'), 'utf-8'),
    colwidth = Math.floor(termwidth/2)-2,
    colWidthRE = new RegExp('.{1,' + colwidth + '}', 'g'),
    leftPad = pad("", colwidth),
    methodsText = fs.readdirSync(__dirname).map(function(cmdFile) {
      var doc,
          str = '',
          cmd = path.basename(cmdFile, '.js'),
          columnified;
      if (path.extname(cmdFile) === ".js") {
        doc = require('./' + cmd)._doc;
        if (doc) {
          columnified = doc.description.match(colWidthRE);
          str = pad("  " + cmd + " " + doc.args, colwidth) + columnified.shift() + "\n";
          str += columnified.map(function(ln) {
            return leftPad + ln;
          }).join('\n');
          for (var i in doc.options) {
            columnified = doc.options[i].match(colWidthRE);
            str += pad("\n    " + i, colwidth) + columnified.shift() + "\n";
            str += columnified.map(function(ln) {
              return leftPad + ln;
            }).join('\n') + "\n";
          }
          str += "\n";
        }
      }
      return str;
    }).join('');

  if (!opts['no-tty']) {
    util.puts(format.header(pad(headerTxt, termwidth)));
    util.puts(format.usage(pad(usageTxt, termwidth)));
    util.puts(format.usage(methodsText));
    cb();
  } else {
    cb(null, [pad(headerTxt, termwidth), pad(usageTxt, termwidth), methodsText].join('\n') );
  }
};

printHelp._doc = {
  args: '',
  description: 'Print this help',
  options: {
    "--splash": "Display a fancy logo."
  }
};

module.exports = printHelp;