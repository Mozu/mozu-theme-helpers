var zlib = require('zlib'),
    tar = require('tar');

module.exports = function expandTarball(stream, opts, cb) {
  stream.pipe(zlib.createGunzip()).pipe(tar.Extract(opts)).on('end', cb);  
}