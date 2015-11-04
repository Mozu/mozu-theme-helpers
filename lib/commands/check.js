'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

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
    return Promise.all([(0, _gitFetchRemoteTags2.default)({ prerelease: prerelease, logger: gopts.logger }), (0, _git2.default)('merge-base master basetheme/master', 'Getting most recently merged basetheme commit', gopts)]);
  }).then(function (_ref2) {
    var _ref3 = _slicedToArray(_ref2, 2);

    var remoteTags = _ref3[0];
    var mergeBase = _ref3[1];

    mergeBase = mergeBase.trim();
    var tagIndex = remoteTags.reduce(function (target, tag, i) {
      return tag.commit === mergeBase ? i : target;
    }, -1);
    if (tagIndex === -1) {
      task.warn('No merge base found among tags! You may have merged an ' + 'unreleased commit.');
    }
    var newVersions = remoteTags.slice(0, tagIndex).map(function (t) {
      return _chalk2.default.bold.yellow(t.version) + " (commit: " + t.commit + ")";
    });
    if (newVersions.length > 0) {
      task.warn(_chalk2.default.green.bold('\nThere are new versions available! \n\n') + newVersions.join('\n') + '\n\nTo merge a new version, run `git merge <commit>`, where ' + '<commit> is the commit ID corresponding to the version you ' + 'would like to begin to merge.\n');
      task.warn(_chalk2.default.gray('You cannot merge the tag directly, because the default ' + 'configuration does not fetch tags from the base theme ' + 'repository, to avoid conflicts with your own tags.'));
      task.done();
    }
  }).catch(task.fail);

  return task;
};

check.transformArguments = function (_ref4) {
  var options = _ref4.options;
  var _args = _ref4._args;

  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check for new versions of the base theme..",
  options: {}
};

exports.default = check;