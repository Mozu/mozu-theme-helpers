var path = require('path'),
    fs = require('fs'),
    semver = require('semver'),
    color = require('cli-color'),
    shellOut = require('../utils/shell-out'),
    getThemeDir = require('../utils/get-theme-dir'),
    die = require('../utils/die'),

    coreVersions = [4,5,6],

check = function(argv, cb) {
  var themeDir = argv._[1] || getThemeDir(process.cwd()), themePath;
  if (!themeDir) {
    die("Please supply a theme directory whose references I should check.");
  }
  themePath = path.resolve(process.cwd(), themeDir);
  if (!fs.existsSync(themePath)) {
    die("Theme directory " + themeDir + " not found.")
  }

  var themejson = JSON.parse(fs.readFileSync(path.resolve(themePath, 'theme.json'), 'utf-8'));
  var activeVersion = coreVersions.filter(function(ver) {
    return themejson.about.extends.toLowerCase().trim() === "core" + ver;
  })[0];
  if (!activeVersion) {
    console.log('This theme does not extend a Core theme directly, so a reference check is unnecessary.\nIf you extend a Core theme in the upstream theme ' + themejson.about.extends + ', then keep references current in that theme.');
    cb();
  }

  var vers = coreVersions.slice();

  vers.forEach(function(ver) {
    var installedVersion;
    try {
      installedVersion = JSON.parse(fs.readFileSync(path.resolve(themeDir, 'references', 'core' + ver,  'bower.json'), 'utf-8')).version;
    } catch(e) {
      die('Core' + ver + ' theme must be installed in order to check references. Run `thmaa update`.');
    }
    var json = '';
    var child = shellOut("bower info mozu/core-theme#^" + ver + ' -j', function(err) {
      if (err) die(err.message);
      var currentVersion = JSON.parse(json).version;
      console.log('Installed version of Core' + ver + ' is ' + installedVersion);
      console.log('Current version of Core' + ver + ' is ' + currentVersion);
      if (semver.gt(currentVersion, installedVersion)) {
        if (ver === activeVersion) {
          console.log(color.bold('\nYour theme extends Core' + ver + ' and Core' + ver + ' has updated in production!\nRun `thmaa update` to update your local reference and check\nthe repository for release notes.'));
          process.exit(1);
        } else {
          console.log(color.bold('\nCore' + ver + ' has updated in production.\nYour theme does not extend Core' + ver + ', so no action is necessary,\nbut if you want to maintain a current copy of Core' + ver + ' for reference,\nrun `thmaa update`.'));
        }
      }
      vers = vers.slice(1);
      if (vers.length === 0) cb();
    }, { stdio: 'pipe', cwd: themePath });
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', function(chunk) {
      json += chunk;
    });
  });

};

check.coreVersions = coreVersions;

module.exports = check;
