import path from "path";
import os from "os";
import fs from "fs";
import colors from "colors";
import semver from "semver";
import getThemeDir from "../utils/get-theme-dir";
import metadataHandler from "../utils/metadata";
import getLatestGithubRelease from "../utils/get-latest-github-release";

let check = function({ dir, cache = true}, log, cb) {

  let themeDir = getThemeDir(dir);

  if (!themeDir) {
    return cb(new Error("Not inside theme directory. Please supply a theme directory for reference check."));
  }

  let pkg = metadata.read(themeDir, 'package');
  let theme = metadata.read(themeDir, 'theme');

  if (theme.about.extends !== pkg.config.baseTheme) {
    return cb(new Error(`Theme extends ${theme.about.extends} but package.json instead refers to a repo for ${pkg.config.baseTheme}.`));
  }

  if (!pkg.config.baseThemeRepo) {
    return cb(new Error("No theme repo specified; cannot check for updates."));
  }

  getLatestGithubRelease(pkg.config.baseThemeRepo, { cache: cache }).then(function(release) {
    let latest = semver.clean(release.tag_name);
    if (semver.gt(latest, pkg.config.baseThemeVersion)) {
      cb(new Error(`
Your theme extends ${theme.about.extends}, and its repository,
${pkg.config.baseThemeRepo}, has reported a newer version!
Use your build tools (\`grunt updatereferences\`) to update
your local references from ${pkg.config.baseThemeVersion} 
to ${latest}, and check the repository for release notes.`.bold));
    } else {
      log.info("Theme compilation complete.");
      cb(null);
    }
  }, cb);

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