"use strict";

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var path = _interopRequire(require("path"));

var fs = _interopRequire(require("fs"));

var colors = _interopRequire(require("colors"));

var termwidth = process.stdout.columns || 80;
var termheight = process.stdout.rows || 30;

var format = {
  header: function (str) {
    return str.black.bgWhite;
  },
  usage: function (str) {
    return str.yellow;
  }
};

function pad(txt, n) {
  return txt.split("\n").map(function (str) {
    while (str.length < n) str += " ";
    return str;
  }).join("\n");
}

var shortHeader = "\n  Theme Helper for Mozu and Associated Assets\n";

var usageTxt = "\n  The <path> parameter defaults to the current directory.\n";

var printHelp = function printHelp(_ref, log, cb) {
  var splash = _ref.splash;
  var forcewidth = _ref.forcewidth;
  var tty = _ref.tty;

  var headerTxt = splash && termwidth >= 80 && termheight >= 30 ? fs.readFileSync(path.resolve(__dirname, "../resources/header.txt"), "utf-8") : shortHeader;

  if (forcewidth) termwidth = forcewidth;

  var colwidth = Math.floor(termwidth / 2) - 2;

  var colwidthRE = new RegExp(".{1," + colwidth + "}\\W", "g");

  var leftPad = pad("", colwidth);

  var methodsText = fs.readdirSync(__dirname).map(function (cmdFile) {
    var doc,
        str = "",
        cmd = path.basename(cmdFile, ".js"),
        columnified;
    if (path.extname(cmdFile) === ".js") {
      doc = require("./" + cmd)._doc;
      if (doc) {
        columnified = doc.description.length < colwidth ? [doc.description] : doc.description.match(colwidthRE);
        str = pad("  " + cmd + " " + doc.args, colwidth) + columnified.shift() + "\n";
        str += columnified.map(function (ln) {
          return leftPad + ln;
        }).join("\n");
        if (columnified.length > 0) str += "\n";
        for (var i in doc.options) {
          columnified = doc.options[i].match(colwidthRE);
          str += pad("\n    " + i, colwidth) + columnified.shift() + "\n";
          str += columnified.map(function (ln) {
            return leftPad + ln;
          }).join("\n") + "\n";
        }
        str += "\n";
      }
    }
    return str;
  }).join("");

  if (tty === false) {
    cb(null, "\n" + pad(headerTxt, termwidth) + "\n" + pad(usageTxt, termwidth) + "\n" + methodsText);
  } else {
    process.stdout.write(format.header(pad(headerTxt, termwidth)) + "\n");
    process.stdout.write(format.usage(pad(usageTxt, termwidth)) + "\n");
    process.stdout.write(format.usage(methodsText) + "\n");
  }
};

printHelp.transformArguments = function (_ref) {
  var options = _ref.options;
  return options;
};

printHelp._doc = {
  args: "",
  description: "Print this very message",
  options: {
    "--splash": "Display a fancy logo.",
    "--forcewidth <n>": "Force display at a certain number of columns. Defaults to terminal width."
  }
};

module.exports = printHelp;