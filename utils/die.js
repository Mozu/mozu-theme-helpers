var die = module.exports = function(str, code) {
  var err;
  if (die.cb) {
    err = new Error(str);
    err.code = code;
    return die.cb(err);
  }
  return process.stderr.write(str);
}
