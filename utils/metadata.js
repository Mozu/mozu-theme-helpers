"use strict";

var path = require("path"),
    fs = require("fs");

var namesToFilenames = {
  theme: "theme.json",
  "package": "package.json",
  bower: "bower.json"
};

var metadata = {
  read: function read(themePath, name) {
    var filePath = path.resolve(themePath, namesToFilenames[name]);
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      throw new Error("Could not read " + filePath + ": " + e.message);
    }
  },
  write: function write(themePath, name, contents) {
    return fs.writeFileSync(path.resolve(themePath, namesToFilenames[name]), JSON.stringify(contents, null, 2));
  },
  modify: function modify(themePath, name, transform) {
    return metadata.write(themePath, name, transform(metadata.read(themePath, name)));
  }
};

module.exports = metadata;