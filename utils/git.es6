import childProcess from 'child_process';
import colors from 'colors';

export default function git(command, reason, options) {
  let text;
  let args;
  if (Array.isArray(command)) {
    text = command.join(' ');
    args = command;
  } else {
    text = command;
    args = command.split(' ');
  }
  let log = options && options.logger || console.log;
  return new Promise((resolve, reject) => {
    try {
      log(reason + ': \n      ' + ('git ' + text).yellow, {
        markdown: false
      });
      let opts = Object.assign({
        encoding: 'utf8',
      }, options);
      let quiet = opts.quiet;
      delete opts.quiet; // in case that option ever affects node
      let proc = childProcess.spawn(
        'git',
        args,
        opts
      );
      let output = '';
      let errput = '';
      if (proc.stdout) {
        proc.stdout.on('data', chunk => output += chunk)
      }
      if (proc.stderr) {
        proc.stderr.on('data', chunk => errput += chunk)
      }
      proc.on('close', code => {
        if (code !== 0) {
          reject(new Error(errput));
        } else {
          if (!quiet) log(output);
          resolve(output);
        }
      });
    } catch(e) {
      reject(e);
    }
  });
}
