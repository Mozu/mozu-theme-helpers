"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var path = _interopRequire(require("path"));

var fs = _interopRequire(require("fs"));

var rimraf = _interopRequire(require("rimraf"));

var extractTarballStream = _interopRequire(require("../utils/extract-tarball-stream"));

var getThemeDir = _interopRequire(require("../utils/get-theme-dir"));

var metadata = _interopRequire(require("../utils/metadata"));

var getGithubResource = _interopRequire(require("../utils/get-github-resource"));

var getLatestGithubRelease = _interopRequire(require("../utils/get-latest-github-release"));

var update = function update(_ref, log, cb) {
  var dir = _ref.dir;
  var _ref$cache = _ref.cache;
  var cache = _ref$cache === undefined ? true : _ref$cache;

  var themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("Not inside a theme directory. Please supply a theme directory whose references I should update."));
  }

  var pkg = metadata.read(themeDir, "package");
  var theme = metadata.read(themeDir, "theme");

  if (theme.about["extends"] !== pkg.config.baseTheme) {
    return cb(new Error("Theme extends " + theme.about["extends"] + " but package.json instead refers to a repo for " + pkg.config.baseTheme + "."));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  var refDir = path.resolve(themeDir, "references", slug(pkg.config.baseTheme));

  rimraf(refDir, function (err) {

    fs.mkdirSync(refDir);
    if (err) return cb(err);

    getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function (release) {
      var releaseUrl = release.tarball_url.replace("https://api.github.com", "");

      var tarballStream = getGithubResource({
        pathname: releaseUrl
      }, { cache: cache });

      tarballStream.on("error", cb);

      var fileStream = tarballStream.pipe(extractTarballStream({ dir: refDir, strip: 1 }));

      fileStream.on("error", cb);

      fileStream.on("end", function () {
        (function walk(referenceDir, templatedir) {
          var inheritedDir,
              fileList = fs.readdirSync(referenceDir).map(function (filename) {
            if (ignore[filename]) return false;
            var stats = fs.statSync(path.resolve(referenceDir, filename));
            if (stats.isDirectory()) {
              var _dir = path.resolve(templatedir, filename);
              if (!fs.existsSync(_dir)) fs.mkdirSync(_dir);
              walk(path.resolve(referenceDir, filename), _dir);
              return false;
            } else if (stats.isFile() && !fs.existsSync(path.resolve(templatedir, filename))) {
              return filename;
            }
          }).filter(function (x) {
            return x;
          });

          if (fileList.length > 0) {
            fs.writeFileSync(path.resolve(templatedir, ".inherited"), fileList.join("\n"));
          }
        })(refDir, themeDir);

        log.info("Base theme update complete.");
        cb(null, "Base theme update complete.");
      });
    }, cb);
  });
};

update.transformArguments = function (_ref) {
  var options = _ref.options;
  var _args = _ref._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

update._doc = {
  args: "<path>",
  description: "Update base theme in references folder.",
  options: {
    "--no-cache": "Skip the local cache. This results in a call out to the remote repository every time, instead of relying on cache."
  }
};

module.exports = update;