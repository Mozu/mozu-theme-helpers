var path = require('path'),
    fs = require('fs');

// copy usage txt into readme
require('../commands/help')({ tty: false, forcewidth: 89}, null, function(err, txt) {
  fs.writeFileSync(path.resolve(__dirname, '../README.md'), [fs.readFileSync(path.resolve(__dirname, './README.tpt.md'), 'utf-8'), txt, '\n'].join("\n```\n"));
  console.log('wrote README.md');
});