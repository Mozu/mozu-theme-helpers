var path = require('path'),
    zubat = require('zubat'),
    color = require('colors'),
    getThemeDir = require('../utils/get-theme-dir'),
    editThemeJson = require('../utils/edit-theme-json')

var compile = function(dir, opts, cb) {
  if (!cb) {
    cb = opts;
    opts = dir;
    dir = process.cwd();
  }
  var themeDir = getThemeDir(dir);
  if (!themeDir) {
    die("Not inside a theme directory. Please supply a theme directory to compile.");
  }

  if (!opts) opts = {};

  var base = editThemeJson.read(themeDir, 'theme.json').about.extends;

  if (base) opts.manualancestry = [path.resolve(themeDir, 'references', base)]; 

  opts.ignore = (opts.ignore || []).concat(['/references','\\.git','node_modules','^/resources','^/tasks','\\.zip$']);

  opts.logLevel = opts.logLevel || 2;
  
  var job = zubat(themeDir, opts, function(err) {
    if (!err) console.log("Theme compilation complete.");
    cb(err);
  });

  job.on('log', function(str, sev) {
    switch(sev) {
      case "error":
      job.cleanup(function() {
        die("Zubat fainted. " + str);
      });
      break;
      case "warning":
      console.log(("zubat: " +str).yellow);
      job.cleanup(function() {
        done(false);
      });
      break;
      default:
      console.log("zubat: " +str);
    }
  });

}

compile._doc = {
  args: '<path>',
  description: 'Compile theme scripts, respecting inheritance.',
  options: {
    '--ignore': 'Speed up! Specify a pattern of files and directories to ignore when copying, relative to root. Defaults to .git, node_modules',
    '--dest': 'Specify a destination other than the default /compiled/scripts directory of your theme.',
    '--verbose': 'Talk a lot.',
    '--quiet': 'Don\'t talk at all.'
  }
}

module.exports = compile;