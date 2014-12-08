var path = require('path'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    getThemeDir = require('../utils/get-theme-dir'),
    editThemeJson = require('../utils/edit-theme-json'),
    die = require('../utils/die');

var override = function(name, opts, cb) {
  if (!cb || !name) {
    die("Please specify a file path to override from the base theme.");
  }
  if (!opts) opts = {};

  var pathName = path.resolve(name);

  if (fs.existsSync(pathName) && !opts.force) {
    die("The file `" + name + "` already exists in your theme at `" + pathName + "`. Copying it again from the base theme would overwrite any changes you made!\nTo do this anyway, run again with the --force flag.")
  }

  var themeDir = getThemeDir();
  if (!themeDir) die("No theme.json found in a parent directory. We do not appear to be inside a Mozu theme.");

  var base = editThemeJson.read(themeDir, 'theme.json').about.extends;

  if (!base) {
    die("Did not detect a base theme for this theme. Cannot override from anything.");
  }

  var referredThemes = fs.readdirSync(path.resolve(themeDir, 'references')),
      baseThemeDirName = referredThemes[referredThemes.map(function(f) { return f.toLowerCase(); }).indexOf(base.toLowerCase())];

  if (baseThemeDirName === -1) {
    die("This theme extends `" + base + "` but a directory for `" + base + "` was not found in your theme references folder.");
  }

  var referredFile = path.resolve(themeDir, 'references', baseThemeDirName, path.relative(themeDir, pathName));

  // TODO: support multilevel inheritance
  if (!fs.existsSync(referredFile)) {
    die("The file `" + pathName + "` was not found in your base theme.")
  }

  console.log('Creating override for ' + name);
  mkdirp(path.dirname(pathName), function(err) {
    if (err) die(err.message);
    fs.writeFileSync(pathName, fs.readFileSync(referredFile));
    cb();
  });
};

override._doc = {
  args: '<path>',
  description: 'Create an override, copying from your base theme.',
  options: {
    '--force': 'Force overwrite if an override already exists.'
  }
};

module.exports = override;
