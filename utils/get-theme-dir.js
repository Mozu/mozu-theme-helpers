var path = require('path'),
    fs = require('fs');

module.exports = function(starting) {
  var lastThemeDir, themeDir = lastThemeDir = starting || process.cwd();
  while (themeDir && !fs.existsSync(path.resolve(themeDir, 'theme.json')) && (themeDir = path.resolve(themeDir, '../'))) {
    if (themeDir === lastThemeDir) { // we made it to root without finding theme.json
      return undefined;
    }
    lastThemeDir = themeDir;
  }
  return themeDir;
}
