'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _semver = require("semver");

var _semver2 = _interopRequireDefault(_semver);

var _getThemeDir = require("../utils/get-theme-dir");

var _getThemeDir2 = _interopRequireDefault(_getThemeDir);

var _metadata = require("../utils/metadata");

var _metadata2 = _interopRequireDefault(_metadata);

var _git = require("../utils/git");

var _git2 = _interopRequireDefault(_git);

var _gitFetchRemoteTags = require("../utils/git-fetch-remote-tags");

var _gitFetchRemoteTags2 = _interopRequireDefault(_gitFetchRemoteTags);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var check = function check(task, _ref) {
  var dir = _ref.dir;

  var themeDir = (0, _getThemeDir2.default)(dir);

  var pkg = _metadata2.default.read(themeDir, 'package');
  var theme = _metadata2.default.read(themeDir, 'theme');

  if (theme.about.extends) {
    return task.fail('Themes that use the `about.extends` legacy option are ' + 'not compatible with this version of the theme helpers.');
  }

  var gopts = {
    logger: function logger(x) {
      return task.info(x);
    },
    quiet: true
  };

  var prerelease = theme.about.baseThemeChannel === 'prerelease';

  (0, _git2.default)('remote show basetheme', 'Checking if base theme remote exists...', gopts).catch(function () {
    if (!theme.about.baseTheme) {
      throw new Error("No theme repo specified; cannot check for updates.");
    } else {
      return (0, _git2.default)('remote add basetheme ' + theme.about.baseTheme, 'Base theme specified in theme.json. Adding remote to ' + 'git repository', gopts);
    }
  }).then(function () {
    return (0, _git2.default)('config remote.basetheme.tagopt --no-tags', 'Ensuring that no tags are downloaded from base theme', gopts);
  }).then(function () {
    return (0, _git2.default)('remote update basetheme', 'Updating basetheme remote', gopts);
  }).then(function () {
    return (0, _git2.default)('merge-base master basetheme/master', 'Getting most recently merged basetheme commit', gopts);
  }).then(function (mergeBase) {
    return (0, _git2.default)("--no-pager log --date=iso-strict --pretty=%ad||||%H||||%s " + (mergeBase.trim() + "..basetheme/master"), "Getting all commits since most recent merge base", gopts);
  }).then(function (newCommitsRaw) {
    return newCommitsRaw.split('\n').filter(function (line) {
      return !!line.trim();
    }).map(function (line) {
      var parts = line.split('||||').map(function (p) {
        return p.trim();
      });
      if (parts.length > 3) {
        // must have had a delimiter char in the commit message. fix it:
        parts = [parts[0], parts[2], parts.slice(2).join('||||')];
      }
      return {
        date: new Date(parts[0]),
        commit: parts[1],
        name: parts[2]
      };
    });
  }).then(function (allNewCommits) {
    if (prerelease) {
      task.warn('This theme is configured in `theme.json` to be connected ' + 'to the "prerelease" channel of its base theme. This means ' + 'that its build process will notify about any new commits ' + 'in the base theme, instead of just any new versions.');
      return allNewCommits;
    } else {
      return (0, _gitFetchRemoteTags2.default)({ prerelease: prerelease, logger: gopts.logger }).then(function (remoteTags) {
        return allNewCommits.filter(function (c) {
          return remoteTags.some(function (t) {
            return t.commit === c.commit;
          });
        });
      });
    }
  }).then(function (newCommits) {
    var normalizeDateLength = function normalizeDateLength(s, l) {
      while (s.length < l) s += ' ';
      return s;
    };
    if (newCommits.length > 0) {
      var formattedCommits = newCommits.map(function (t) {
        return _chalk2.default.cyan(normalizeDateLength(t.date.toLocaleString(), 23)) + ("  " + _chalk2.default.bold.yellow(t.name) + " (commit: " + t.commit.slice(0, 9) + ")");
      });
      if (prerelease) {
        task.warn(_chalk2.default.green.bold("\nThis theme is " + newCommits.length + " " + "commits behind its base theme.") + "\n\n##  Unmerged commits: \n\n" + formattedCommits.join('\n') + _chalk2.default.green.bold("\n\n Run `git merge basetheme/master` to " + "merge these commits."));
      } else {
        task.warn(_chalk2.default.green.bold('\nThere are new versions available! \n\n') + formattedCommits.join('\n') + '\n\nTo merge a new version, run `git merge <commit>`, where ' + '<commit> is the commit ID corresponding to the version you ' + 'would like to begin to merge.\n');
        task.warn(_chalk2.default.gray('You cannot merge the tag directly, because the default ' + 'configuration does not fetch tags from the base theme ' + 'repository, to avoid conflicts with your own tags.'));
      }
    }
    task.done();
  }).catch(task.fail);

  return task;
};

check.transformArguments = function (_ref2) {
  var options = _ref2.options;
  var _args = _ref2._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check for new versions of the base theme..",
  options: {}
};

exports.default = check;