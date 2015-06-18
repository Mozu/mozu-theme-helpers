import zlib from "zlib";
import tar from "tar";
import pipe from "multipipe";

export default function expandTarball(opts) {
  return pipe(zlib.createGunzip(), tar.Extract(opts));
}