const path = require('path');

module.exports = {
  token: path.resolve(`${__dirname}/.token`),
  refreshToken: path.resolve(`${__dirname}/.refreshToken`),
};
