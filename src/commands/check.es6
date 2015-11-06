'use strict';
import chalk from "chalk";
import semver from "semver";
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
    () => git('merge-base master basetheme/master',
          'Getting most recently merged basetheme commit', gopts)
  )
  .then(
    mergeBase => git(
      `--no-pager log --date=iso-strict --pretty=%ad||||%H||||%s ` +
      `${mergeBase.trim()}..basetheme/master`,
      `Getting all commits since most recent merge base`, gopts
    )
  )
  .then(
    newCommitsRaw =>
      newCommitsRaw
      .split('\n')
      .filter(line => !!line.trim())
      .map(line => {
        let parts = line.split('||||').map(p => p.trim());
        if (parts.length > 3) {
          // must have had a delimiter char in the commit message. fix it:
          parts = [parts[0],parts[2],parts.slice(2).join('||||')];
        }
        return {
          date: new Date(parts[0]),
          commit: parts[1],
          name: parts[2]
        };
      })
  )
  .then(
    allNewCommits => {
      if (prerelease) {
        task.warn('This theme is configured in `theme.json` to be connected ' +
                  'to the "prerelease" channel of its base theme. This means ' +
                  'that its build process will notify about any new commits ' +
                  'in the base theme, instead of just any new versions.');
        return allNewCommits;
      } else {
        return gitFetchRemoteTags({ prerelease, logger: gopts.logger })
          .then(
            remoteTags => allNewCommits.filter(c =>
              remoteTags.some(t => t.commit === c.commit))
          )
      }
  })
  .then(
    newCommits =>  {
      let normalizeDateLength = (s, l) => {
        while (s.length < l) s += ' ';
        return s;
      }
      if (newCommits.length > 0) {
        let formattedCommits =
          newCommits
          .map(t => 
               chalk.cyan(normalizeDateLength(t.date.toLocaleString(), 23)) + 
               `  ${chalk.bold.yellow(t.name)} (commit: ${t.commit.slice(0,9)})`);
        if (prerelease) {
          task.warn(chalk.green.bold(`\nThis theme is ${newCommits.length} ` +
            `commits behind its base theme.`) +
              `\n\n##  Unmerged commits: \n\n` +
              formattedCommits.join('\n') +
              chalk.green.bold(`\n\n Run \`git merge basetheme/master\` to ` +
                                `merge these commits.`));

        } else {
        task.warn(
            chalk.green.bold('\nThere are new versions available! \n\n') + 
                 formattedCommits.join('\n') +
            '\n\nTo merge a new version, run `git merge <commit>`, where ' +
            '<commit> is the commit ID corresponding to the version you ' +
            'would like to begin to merge.\n');
        task.warn(
          chalk.gray('You cannot merge the tag directly, because the default ' +
                 'configuration does not fetch tags from the base theme ' +
                 'repository, to avoid conflicts with your own tags.'));
      }
    }
    task.done();
  }).catch(task.fail);

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
