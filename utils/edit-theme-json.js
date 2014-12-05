var path = require('path'),
    fs = require('fs');
var edit = module.exports = {
  read: function(themePath, filename) {
    var filePath = path.resolve(themePath, filename);
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch(e) {
      throw new Error("Could not read " + filePath + ": " + e.message);
    }
  },
  write: function(themePath, filename, contents) {
    return fs.writeFileSync(path.resolve(themePath, filename), JSON.stringify(contents, null, 2));
  },
  modify: function(themePath, filename, transform) {
    return edit.write(themePath, filename, transform(edit.read(themePath, filename)));
  }
}
