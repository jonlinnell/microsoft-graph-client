const axios = require('axios');
const qs = require('querystringify');
const fs = require('fs');

const debug = require('./debugMessages');

const { CLIENT_ID, CLIENT_SECRET, HOST, PORT } = process.env;
const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

const requestBody = {
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  scope: 'user.read calendars.read.shared',
  redirect_uri: `http://${HOST}:${PORT}/token/receive_code`,
};

const writeToken = token => fs.writeFileSync(`${__dirname}/../.token`, token, 'utf8');
const writeRefreshToken = refreshToken =>
  fs.writeFileSync(`${__dirname}/../.refreshToken`, refreshToken, 'utf8');

module.exports = request =>
  new Promise((resolve, reject) => {
    debug('fetchToken() called. Fetching a new token from the endpoint.');
    if (!request || (!request.code && !request.refreshToken)) {
      debug('fetchToken() was called without a code or a refresh token.');
      reject(
        new Error(
          "fetchToken() called with no argument. Must have {code: 'OAA...'} or { refreshToken: 'OAA...' }"
        )
      );
    } else if (request.code) {
      debug('Requesting an access token using an authorisation code.');
      axios
        .post(
          tokenEndpoint,
          qs.stringify(
            Object.assign({}, requestBody, {
              code: request.code,
              grant_type: 'authorization_code',
            })
          ),
          config
        )
        .then(response => {
          debug(`Received token ${response.data.access_token.slice(0, 32)}...`);
          writeToken(response.data.access_token);
          writeRefreshToken(response.data.refresh_token);
          resolve(response.data.access_token);
        })
        .catch(error => {
          debug(`Failed to receive token: ${error.response.data}`);
          if (error.response && error.response.data) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    } else if (request.refreshToken) {
      debug('Requesting an access token using a refresh token.');
      axios
        .post(
          tokenEndpoint,
          qs.stringify(
            Object.assign({}, requestBody, {
              refresh_token: request.refreshToken,
              grant_type: 'refresh_token',
            })
          ),
          config
        )
        .then(response => {
          debug(`Received token. ${response.data.access_token.slice(0, 32)}...`);
          writeToken(response.data.access_token);
          writeRefreshToken(response.data.refresh_token);
          resolve(response.data.access_token);
        })
        .catch(error => {
          debug(`Failed to receive token: ${error.response.data}`);
          if (error.response && error.response.data) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    }
  });
