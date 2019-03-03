const moment = require('moment');
require('colors');

module.exports = (message, suppressNewline) => {
  if (process.env.DEBUG) {
    process.stdout.write(`[debug] (${moment().format('HH:mm:ss')}) `.cyan);
    process.stdout.write(message);
    process.stdout.write(suppressNewline ? '' : '\n');
  }
};
