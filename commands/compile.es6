import path from "path";
import zubat from "zubat";
import colors from "colors";
import slug from "../utils/slug";
import getThemeDir from "../utils/get-theme-dir";
import metadata from "../utils/metadata";

var compile = function(opts, log, cb) {

  opts.ignore = opts.ignore || [];

  var themeDir = getThemeDir(opts.dir);

  if (!themeDir) {
    return log.fail("Not inside a theme directory. Please supply a theme directory to compile.");
  }

  var base = metadata.read(themeDir, 'theme').about.extends;

  if (base) opts.manualancestry = [path.resolve(themeDir, 'references', slug(base))];

  opts.ignore.push('/references','\\.git','node_modules','^/resources','^/tasks','\\.zip$');

  var job = zubat(themeDir, opts, err => {
    console.log('ack');
    if (!err) log.info("Theme compilation complete.");
    cb(err);
  });

  job.on('log', function(str, sev) {
    console.log('pth');
    switch(sev) {
      case "error":
        job.cleanup(() => cb(new Error(`Zubat fainted. ${str}`)));
        break;
      case "warning":
        job.cleanup(() => cb(new Error(`zubat: ${str}`)));
        break;
      default:
        log.info(`zubat: ${str}`);
    }
  });

};

compile.transformArguments = function({ options, _args }) {
  options.dir = _args[0] || process.cwd();
};

compile._doc = {
  args: '<path>',
  description: 'Compile theme scripts, respecting inheritance.',
  options: {
    '--ignore': 'Speed up! Specify a pattern of files and directories to ignore when copying, relative to root. Defaults to ".git, node_modules"',
    '--dest': 'Specify a destination other than the default /compiled/scripts directory of your theme.',
    '--verbose': 'Talk a lot.',
    '--quiet': 'Don\'t talk at all.'
  }
}

export default compile;