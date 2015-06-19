import getGithubReleases from "./get-github-releases";
import concat from "concat-stream";
import semver from "semver";

export default function(repo, { versionRange = '*', cache = true }) {
  return new Promise(function(resolve, reject) {
    var releaseStream = getGithubReleases(repo, { versionRange: versionRange, cache: cache });
    releaseStream.on('error', reject);
    releaseStream.pipe(concat(function(releases) {
      if (!releases || releases.length === 0) {
        return resolve(null);
      }
      let qualifyingVersions = releases.map( ({ tag_name }) => semver.clean(tag_name))
      let maxVersion = semver.maxSatisfying(qualifyingVersions, versionRange.toString());
      // send back the release object matching the max satisfying version,
      // and the version string itself
      resolve(releases[qualifyingVersions.indexOf(maxVersion)]);
    }));
  });
}