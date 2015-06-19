import path from "path";
import os from "os";
import fs from "fs";
import colors from "colors";
import semver from "semver";
import slug from "slug";
import getThemeDir from "../utils/get-theme-dir";
import metadataHandler from "../utils/metadata";
import getLatestGithubRelease from "../utils/get-latest-github-release";

let check = function({ dir, cache = true}, log, cb) {

  let themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("Not inside theme directory. Please supply a theme directory for reference check."));
  }

  let pkg = metadataHandler.read(themeDir, 'package');
  let theme = metadataHandler.read(themeDir, 'theme');

  if (theme.about.extends !== pkg.config.baseTheme) {
    return cb(new Error(`Theme extends ${theme.about.extends} but package.json instead refers to a repo for ${pkg.config.baseTheme}.`));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  let baseThemeDir = path.join(themeDir, 'references', slug(pkg.config.baseTheme));
  if (!fs.existsSync(path.join(baseThemeDir, 'package.json'))) {
    return cb(new Error(`A reference directory or package.json for ${pkg.config.baseTheme} does not exist in ./references, so it cannot be updated.`));
  }

  let currentBaseThemeVersion = metadataHandler.read(baseThemeDir, 'package').version;

  getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function(release) {
    if (!release) {
      return cb(new Error("No releases found in " + pkg.config.baseThemeRepo));
    }
    let latest = semver.clean(release.tag_name);
    if (semver.gt(latest, currentBaseThemeVersion)) {
      if (semver.satisfies(latest, pkg.config.baseThemeVersion)) {
        cb(new Error(`
Your theme extends ${theme.about.extends}, and its repository,
${pkg.config.baseThemeRepo}, has reported a newer version!
Use your build tools (\`grunt updatereferences\`) to update
your local references from ${pkg.config.baseThemeVersion} 
to ${latest}, and check the repository for release notes.`.replace(/\n/g,' ').bold));
      } else if (semver.ltr(latest, pkg.config.baseThemeVersion)) {
        cb(new Error(`
No available version of ${theme.about.extends} satisfies your specified
version range ${pkg.config.baseThemeVersion}. The newest available 
version is ${latest}.`.replace(/\n/g,' ').bold));
      } else {
        log.info(
`A version of ${theme.about.extends} is available that is newer than
your specified version range ${pkg.config.baseThemeVersion}. Visit
the repository homepage ${pkg.config.baseThemeRepo} for details.`.replace(/\n/g,' '));
        cb(null);
      }
    } else {
      log.info(`Current version of base theme ${pkg.config.baseTheme}, ${latest}, is the latest.`);
      cb(null);
    }
  }).catch(cb);

};

check.transformArguments = function({ options, _args }) {
  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check if references are up to date.",
  options: {
    '--no-cache': 'Skip the local cache. This results in a call out to the remote repository every time, instead of relying on cache.'
  }
};

export default check;