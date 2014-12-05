var path = require('path'),
    fs = require('fs'),
    shellOut = require('../utils/shell-out'),
    editThemeJson = require('../utils/edit-theme-json'),
    die = require('../utils/die'),
    update = require('./update'),
    ncp = require('ncp').ncp;

ncp.limit = 16;

module.exports = function(argv, cb) {
  var themeName = argv._[1];
  if (!themeName) {
    die("Please supply a directory name for your new theme.");
  }
  var newThemeDir = path.resolve(process.cwd, themeName);
  ncp(path.resolve(__dirname, '../resources/theme-template'), newThemeDir, function (err) {
    if (err) die(err.message);

    console.log("Copied theme template into " + newThemeDir);

    var provisionalThemeName = argv.name || path.basename(themeName);

    editThemeJson.modify(newThemeDir, 'package.json', function(pkg) {
      pkg.name = provisionalThemeName;
      console.log("Modified package.json");
      return pkg;
    });

    editThemeJson.modify(newThemeDir, 'theme.json', function(tj) {
      tj.about.name = argv['friendly-name'] || provisionalThemeName;
      if (argv.base) tj.about.extends = argv.base;
      console.log("Modified theme.json");
      return tj;
    });

    shellOut('npm install', function(err){
      if (err) throw err;
      console.log("Installed node modules");
      update(argv, function(err) {
        if (err) throw err;
        console.log("\nCreated new theme " + themeName + " in " + newThemeDir);
        cb();
      });
    }, { cwd: newThemeDir });

  });

};
