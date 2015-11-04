'use strict';
import chalk from "chalk";
import getThemeDir from "../utils/get-theme-dir";
import metadataHandler from "../utils/metadata";
import git from "../utils/git";
import gitFetchRemoteTags from '../utils/git-fetch-remote-tags';

let check = function(task, { dir }) {

  let themeDir = getThemeDir(dir);

  let pkg = metadataHandler.read(themeDir, 'package');
  let theme = metadataHandler.read(themeDir, 'theme');

  if (theme.about.extends) {
    return task.fail('Themes that use the `about.extends` legacy option are ' +
               'not compatible with this version of the theme helpers.');
  }

  let gopts = {
    logger: x => task.info(x),
    quiet: true
  };

  let prerelease = theme.about.baseThemeChannel === 'prerelease';

  git('remote show basetheme', 'Checking if base theme remote exists...',
    gopts)
  .catch(
    () => {
      if (!theme.about.baseTheme) {
        throw new Error("No theme repo specified; cannot check for updates.");
      } else {
        return git('remote add basetheme ' + theme.about.baseTheme,
          'Base theme specified in theme.json. Adding remote to ' +
          'git repository', gopts);
      }
    }
  )
  .then(
    () => git('config remote.basetheme.tagopt --no-tags',
              'Ensuring that no tags are downloaded from base theme', gopts)
  )
  .then(
    () => git('remote update basetheme', 'Updating basetheme remote', gopts)
  )
  .then(
    () => Promise.all([
      gitFetchRemoteTags({ prerelease, logger: gopts.logger }),
      git('merge-base master basetheme/master',
          'Getting most recently merged basetheme commit', gopts)
    ])
  ).then(
    ([remoteTags, mergeBase]) => {
      mergeBase = mergeBase.trim();
      let tagIndex = remoteTags.reduce(
        (target, tag, i) => {
          return (tag.commit === mergeBase) ? i : target;
        }, -1);
      if (tagIndex === -1) {
        task.warn('No merge base found among tags! You may have merged an ' +
            'unreleased commit.');
      }
      let newVersions = remoteTags.slice(0, tagIndex)
          .map(t => `${chalk.bold.yellow(t.version)} (commit: ${t.commit})`);
      if (newVersions.length > 0) {
        task.warn(
            chalk.green.bold('\nThere are new versions available! \n\n') + 
                 newVersions.join('\n') +
            '\n\nTo merge a new version, run `git merge <commit>`, where ' +
            '<commit> is the commit ID corresponding to the version you ' +
            'would like to begin to merge.\n');
        task.warn(
          chalk.gray('You cannot merge the tag directly, because the default ' +
                 'configuration does not fetch tags from the base theme ' +
                 'repository, to avoid conflicts with your own tags.'));
        task.done();
      }
    }
  ).catch(task.fail);

  return task;

};

check.transformArguments = function({ options, _args }) {
  options.dir = _args[0] || process.cwd();
  return options;
};

check._doc = {
  args: "<path>",
  description: "Check for new versions of the base theme..",
  options: {
  }
};

export default check;
