var path = require('path'),
    tmp = require('os').tmpdir(),
    fs = require('fs'),
    color = require('colors'),
    semver = require('semver'),
    getThemeDir = require('../utils/get-theme-dir'),
    metadata = require('thmaa-metadata'),
    getLatestGithubRelease = require('../utils/get-latest-github-release'),
    die = require('../utils/die'),

    coreMajorVersions = [4,5,6],

    today = new Date(),

    getLatestCoreVersion = function(major, cb) {
      getLatestGithubRelease('mozu/core-theme', major, function(release, ver) {
        cb(ver);
      });
    },

    getLatestCoreVersionWithCache = function(major, cb) {
      var cacheFile = path.resolve(tmp, 'thmaa-' + today.getFullYear() + (today.getMonth() + 1) + today.getDate() + "-core" + major + "-version.cache")
      fs.readFile(cacheFile, { encoding: 'utf8' }, function(err, v) {
        if (err) {
          getLatestCoreVersion(major, function(v) {
            fs.writeFile(cacheFile, v, { encoding: 'utf8' }, function(err) {
              //it would be weird, but okay, if this didn't work, since it's just a performance cache to avoid an http call
              cb(v);
            });
          });
        } else {
          cb(v);
        }
      });
    },


check = function(opts, cb) {
  var dir = opts.dir;
  var themeDir = getThemeDir(dir);
  if (!themeDir) {
    die("Not inside a theme directory. Please supply a theme directory whose references I should check.");
  }
  var themejson = metadata.read(themeDir, 'theme');
  var activeMajor = coreMajorVersions.filter(function(major) {
    return themejson.about.extends.toLowerCase().trim() === "core" + major;
  })[0];
  if (!activeMajor) {
    console.log('This theme does not extend a Core theme directly, so a reference check is unnecessary.\nIf you extend a Core theme in the upstream theme ' + themejson.about.extends + ', then keep references current in that theme.');
    cb();
  }

  var majors = coreMajorVersions.slice();

  if (!opts || !opts.all) {
    majors = [activeMajor];
  }

  majors.forEach(function(major) {
    var installedVersion;
    try {
      installedVersion = JSON.parse(fs.readFileSync(path.resolve(themeDir, 'references', 'core' + major,  'bower.json'), 'utf-8')).version;
    } catch(e) {
      die('Core' + major + ' theme must be installed in order to check references. Run `thmaa update`.');
    }
    var getLatest = (opts['cache'] === false) ? getLatestCoreVersion : getLatestCoreVersionWithCache;

    getLatest(major, function(latestVersion) {
      console.log('Installed version of Core' + major + ' is ' + installedVersion);
      console.log('Current version of Core' + major + ' is ' + latestVersion);
      if (semver.gt(latestVersion, installedVersion)) {
        if (major === activeMajor) {
          console.log('\nYour theme extends Core' + major + ' and Core' + major + ' has updated in production!\nRun `thmaa update` to update your local reference and check\nthe repository for release notes.'.bold);
          process.exit(1);
        } else {
          console.log('\nCore' + major + ' has updated in production.\nYour theme does not extend Core' + major + ', so no action is necessary,\nbut if you want to maintain a current copy of Core' + major + ' for reference,\nrun `thmaa update`.'.bold);
        }
      }
      majors = majors.slice(1);
      if (majors.length === 0) cb();
    });

  });

};

check.transformArguments = function(conf) {
  var opts = conf.options;
  opts.dir = conf._args[0] || process.cwd();
  return opts;
};

check._doc = {
  args: "<path>",
  description: "Check if references are up to date.",
  options: {
    '--all': 'Check all supported versions of the Core theme instead of just the one this theme extends.',
    '--no-cache': 'Skip the local cache. This results in a call out to the remote repository every time, instead of every day.'
  }
};

check.coreMajorVersions = coreMajorVersions;

module.exports = check;
