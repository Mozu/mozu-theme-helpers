"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = getGithubResource;

var path = _interopRequire(require("path"));

var fs = _interopRequire(require("fs"));

var https = _interopRequire(require("https"));

var slug = _interopRequire(require("slug"));

var stream = _interopRequire(require("stream"));

var rimraf = _interopRequire(require("rimraf"));

var DIRNAME = ".mozu.gh-cache";
var HOMEDIR = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

var USER_AGENT = "Mozu Theme Utilities";

function getGithubResource(_ref) {
  var pathname = _ref.pathname;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  var outStream = new stream.PassThrough();
  var cacheDir = path.join(HOMEDIR, DIRNAME, slug(pathname));
  var cacheFile = null;
  var etag = null;
  var fileContentsStream = null;
  try {
    cacheFile = fs.readdirSync(cacheDir).filter(function (f) {
      return f.indexOf("etag-") === 0;
    })[0];
    etag = cacheFile.replace(/^etag-/, "");
    fileContentsStream = fs.createReadStream(path.join(cacheDir, cacheFile));
  } catch (e) {}
  var config = {
    host: "api.github.com",
    path: pathname,
    headers: {
      "User-Agent": USER_AGENT
    }
  };
  if (cache && fileContentsStream && etag) {
    config.headers["If-None-Match"] = etag;
  }
  https.get(config, function (res) {
    res.on("error", function (err) {
      outStream.emit("error", err);
    });
    if (res.statusCode === 403 && res.headers["x-ratelimit-remaining"].toString() === "0") {
      outStream.emit("error", new Error("GitHub rate limit exceeded. Please report this issue to Mozu Enterprise Support. You may try again in " + Math.ceil((Number(res.headers["x-ratelimit-reset"]) * 1000 - new Date().getTime()) / 60000) + " minutes."));
    } else if (res.statusCode === 304) {
      fileContentsStream.pipe(outStream);
    } else {
      if (cacheFile && fileContentsStream) rimraf(cacheFile);
      res.pipe(fs.createWriteStream(path.join(cacheDir, "etag-" + res.headers.etag)));
      res.pipe(outStream);
    }
  });
  return outStream;
}