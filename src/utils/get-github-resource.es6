"use strict";

import path from "path";
import fs from "fs";
import request from "request";
import slug from "./slug";
import stream from "stream";
import rimraf from "rimraf";
// import tunnelAgent from "tunnel-agent";
import mkdirp from "mkdirp";

var DIRNAME = ".mozu.gh-cache";
var HOMEDIR = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

var USER_AGENT = "Mozu Theme Utilities";

export default function getGithubResource({ pathname, cache = true }) {

  let outStream = new stream.PassThrough();
  let cacheDir = path.join(HOMEDIR, DIRNAME, slug(pathname));
  let cacheFile = null;
  let etag = null;
  let fileContentsStream = null;
  try {
    cacheFile = fs.readdirSync(cacheDir).filter(f => f.indexOf('etag-') === 0)[0];
    etag = cacheFile.replace(/^etag-/,'');
    fileContentsStream = fs.createReadStream(path.join(cacheDir, cacheFile))
  } catch(e) {}
  var config = {
    url: 'https://api.github.com' + pathname,
    headers: {
      'User-Agent': USER_AGENT
    }
  };
  if (process.env.USE_FIDDLER) {
    config.proxy = 'http://127.0.0.1:8888'
    config.strictSSL = false;
  }
  if (cache && fileContentsStream && etag) {
    config.headers['If-None-Match'] = `"${etag}"`;
  }
  var req = request(config);

  req.on('error', function(err) {
    outStream.emit('error', err);
  });

  req.on('response', function(res) {
    if (res.statusCode === 403 && res.headers['x-ratelimit-remaining'].toString() === "0") {
      outStream.emit('error', new Error(`GitHub rate limit exceeded. Please report this issue to Mozu Enterprise Support. You may try again in ${Math.ceil(((Number(res.headers['x-ratelimit-reset']) * 1000) - (new Date().getTime())) / 60000)} minutes.`));
    } else if (res.statusCode === 304) {
      fileContentsStream.pipe(outStream);
    } else {
      if (cacheFile && fileContentsStream) rimraf.sync(path.join(cacheDir, cacheFile));
      let newCacheFileName = path.join(cacheDir, 'etag-' + res.headers.etag.replace(/"/g,''));
      mkdirp.sync(cacheDir);
      req.pipe(fs.createWriteStream(newCacheFileName)).on('end', function() {
        fs.chmodSync(newCacheFileName, '666');
        if (process.env.DEBUG && process.env.DEBUG.indexOf('thmaa') !== -1) console.log('cache complete');
      })
      req.pipe(outStream);
    }
  });

  return outStream;
}