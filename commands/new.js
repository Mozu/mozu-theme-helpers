var path = require('path'),
    fs = require('fs'),
    shellOut = require('../utils/shell-out'),
    editThemeJson = require('../utils/edit-theme-json'),
    die = require('../utils/die'),
    update = require('./update'),
    ncp = require('ncp').ncp;

ncp.limit = 16;

var newTheme = function(opts, cb) {
  if (!opts.themeName) {
    die("Please supply a directory name for your new theme.");
  }
  var themeName = opts.themeName;
  var newThemeDir = path.resolve(process.cwd(), themeName);
  ncp(path.resolve(__dirname, '../resources/theme-template'), newThemeDir, function (err) {
    if (err) die(err.message);

    console.log("Copied theme template into " + newThemeDir);

    var provisionalThemeName = opts.name || path.basename(themeName);

    editThemeJson.modify(newThemeDir, 'package.json', function(pkg) {
      pkg.name = provisionalThemeName;
      console.log("Modified package.json");
      return pkg;
    });

    editThemeJson.modify(newThemeDir, 'theme.json', function(tj) {
      tj.about.name = opts['friendly-name'] || provisionalThemeName;
      if (opts.base) tj.about.extends = opts.base;
      console.log("Modified theme.json");
      return tj;
    });

    // install grunt-cli if it's not installed already
    console.log('Detecting grunt-cli...');
    shellOut((/^win/.test(process.platform) ? "where grunt" : "which grunt"), function(err) {
      if (err) {
        console.log('No global grunt detected. Installing grunt-cli...');
        shellOut('npm install -g grunt-cli', function(err) {
          if (err) die(err);
          finish();
        });
      } else {
        finish();
      }
    });

    function finish() {
      shellOut('npm install', function(err){
        if (err) throw err;
        console.log("Installed node modules");
        update({ dir: newThemeDir }, function(err) {
          if (err) throw err;

          // TODO: factor out as soon as we can install thmaa from npm
          shellOut('npm link thmaa', function(err) {
            if (err) throw new Error("If you're on Windows 7 please run this command as an administrator, because we need to make a symlink");
            console.log("\nCreated new theme " + themeName + " in " + newThemeDir);
            cb();
          }, { cwd: newThemeDir });
        });
      }, { cwd: newThemeDir });
    }

  });

};

newTheme.transformArguments = function(conf) {
  var opts = conf.options;
  opts.themeName = conf._args[0];
  return opts;
}

newTheme._doc = {
  args: '<path>',
  description: 'Create a new theme based on the Core theme.',
  options: {
    '--name': 'Specify a unique package name. Defaults to directory name.',
    '--friendly-name': 'Specify a display name for SiteBuilder. Defaults to directory name.'
  }
}

module.exports = newTheme;
