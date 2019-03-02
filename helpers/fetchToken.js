const axios = require('axios');
const qs = require('querystringify');
const fs = require('fs');

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
    if (!request || (!request.code && !request.refreshToken)) {
      reject(
        new Error(
          "fetchToken() called with no argument. Must have {code: 'OAA...'} or { refreshToken: 'OAA...' }"
        )
      );
    } else if (request.code) {
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
          writeToken(response.data.access_token);
          writeRefreshToken(response.data.refresh_token);
          resolve(response.token);
        })
        .catch(error => {
          if (error.response && error.response.data) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    } else if (request.refreshToken) {
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
          writeToken(response.data.access_token);
          writeRefreshToken(response.data.refresh_token);
          resolve(response.token);
        })
        .catch(error => {
          if (error.response && error.response.data) {
            reject(error.response.data);
          } else {
            reject(error);
          }
        });
    }
  });
