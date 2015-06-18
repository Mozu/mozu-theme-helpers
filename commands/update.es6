import path from "path";
import fs from "fs";
import rimraf from "rimraf";
import extractTarballStream from "../utils/extract-tarball-stream";
import getThemeDir from "../utils/get-theme-dir";
import metadata from "../utils/metadata";
import getGithubResource from "../utils/get-github-resource";
import getLatestGithubRelease from "../utils/get-latest-github-release";

let update = function({ dir, cache = true }, log, cb) {

  let themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("Not inside a theme directory. Please supply a theme directory whose references I should update."));
  }

  let pkg = metadata.read(themeDir, 'package');
  let theme = metadata.read(themeDir, 'theme');

  if (theme.about.extends !== pkg.config.baseTheme) {
    return cb(new Error(`Theme extends ${theme.about.extends} but package.json instead refers to a repo for ${pkg.config.baseTheme}.`));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  let refDir = path.resolve(themeDir, 'references', slug(pkg.config.baseTheme));

  rimraf(refDir, function(err) {

    fs.mkdirSync(refDir);
    if (err) return cb(err);

    getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function(release) {
      let releaseUrl = release.tarball_url.replace('https://api.github.com', '');

      let tarballStream = getGithubResource({
        pathname: releaseUrl
      }, { cache: cache });

      tarballStream.on('error', cb);

      let fileStream = tarballStream.pipe(extractTarballStream({ dir: refDir, strip: 1}));

      fileStream.on('error', cb);

      fileStream.on('end', function() {
        (function walk(referenceDir, templatedir) {
          var inheritedDir, fileList = fs.readdirSync(referenceDir).map(function(filename) {
            if (ignore[filename]) return false;
            let stats = fs.statSync(path.resolve(referenceDir, filename));
            if (stats.isDirectory()) {
              let dir = path.resolve(templatedir, filename);
              if (!fs.existsSync(dir)) fs.mkdirSync(dir);
              walk(path.resolve(referenceDir, filename), dir);
              return false;
            } else if (stats.isFile() && !fs.existsSync(path.resolve(templatedir, filename))) {
              return filename;
            }
          }).filter(function(x) { return x; });

          if (fileList.length > 0) {
            fs.writeFileSync(path.resolve(templatedir, '.inherited'), fileList.join('\n'));
          }
        })(refDir, themeDir);

        log.info("Base theme update complete.");
        cb(null, "Base theme update complete.");

      })

    }, cb);
  });

};

update.transformArguments = function({ options, _args }) {
  options.dir = _args[0] || process.cwd();
  return options;
}

update._doc = {
  args: '<path>',
  description: 'Update base theme in references folder.',
  options: {
    '--no-cache': 'Skip the local cache. This results in a call out to the remote repository every time, instead of relying on cache.'
  }
}

export default update;