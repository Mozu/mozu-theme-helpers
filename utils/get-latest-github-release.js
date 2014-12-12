var path = require('path'),
    fs = require('fs'),
    https = require('https'),
    tmpdir = require('os').tmpdir(),
    semver = require('semver'),
    streamToCallback = require('./stream-to-callback'),
    die = require('./die');

module.exports = function getLatestGithubRelease(repo, versionRange, cb, noCache) {
  var lastCache, cacheFile = path.resolve(tmpdir, 'thmaa-cache-core' + versionRange + ".json");
  var headers = {
    'User-Agent': 'thmaa'
  };
  if (!noCache) { // call getLatestGithubRelease with a fourth argument of "true" to bypass

    fs.readFile(cacheFile, { encoding: 'utf8' },  function(err, json) {
      var cache;
      if (err) {
        // no cache file yet
        callGH();
      } else {
        try {
          // the cache is an object: keys are ETag strings, values are releases objects
          cache = JSON.parse(json);
          // use this header to ask github for a 304 if nothing has changed since our cache
          headers['If-None-Match'] = Object.keys(cache)[0];
          // and set the last cache value in the closure to the actual cache itself
          lastCache = cache[headers['If-None-Match']];
        } catch(e) {}
        // the cache was unparseable so just go
        callGH();
      }
    });
  } else {
    // called with noCache
    callGH();
  }

  function callGH() {
    https.get({
      host: 'api.github.com',
      path: '/repos/' + repo + '/releases',
      headers: headers
    }, function(res) {
      streamToCallback(res, function(err, json) {
        var cache = {}, releases, etag;
        if (err) die(err);
        if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'].toString() === "0") {
          die("GitHub rate limit exceeded. Please report this issue to Mozu Enterprise Support. You may try again in " + Math.ceil(((Number(res.headers['x-ratelimit-reset']) * 1000) - (new Date().getTime())) / 60000) + " minutes.");
        }

        if (res.statusCode === 304 && lastCache) {
          // we sent an If-None-Match header and got a "not modified" response. safe to use cache
          releases = lastCache;
        } else {
          releases = JSON.parse(json);
          etag = res.headers.etag;
          if (etag) {
            // store this response in the cache by etag value
            cache[etag] = releases;
            fs.writeFileSync(cacheFile, JSON.stringify(cache), { encoding: 'utf8' });
          }
        }
        qualifyingVersions = releases.map(function(r) {
          // yanks the "v" off, so semver can parse
          return semver.clean(r.tag_name)
        }),
        maxVersion = semver.maxSatisfying(qualifyingVersions, versionRange.toString());
        // send back the release object matching the max satisfying version,
        // and the version string itself
        cb(releases[qualifyingVersions.indexOf(maxVersion)], maxVersion);
      });
    });
  }
}