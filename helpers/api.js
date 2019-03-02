const axios = require('axios');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');

const paths = require('../paths');

const { HOST, PORT } = process.env;

const fetchToken = require('./fetchToken');

const api = 'https://graph.microsoft.com/v1.0';

const getToken = () =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(paths.token)) {
      reject(
        new Error(
          `No saved token.\nPlease reinitialise authorisation by going to http://${HOST}:${PORT}/token/initialiseAuthorisationFlow .`
        )
      );
    } else {
      const token = fs.readFileSync(paths.token);
      const decodedToken = jwt.decode(token);

      if (moment(decodedToken.exp).isAfter(moment())) {
        if (!fs.existsSync(paths.refreshToken)) {
          reject(
            new Error(
              `No saved refresh token.\nPlease reinitialise authorisation by going to http://${HOST}:${PORT}/token/initialiseAuthorisationFlow .`
            )
          );
        }

        const refreshToken = fs.readFileSync(paths.refreshToken);

        if (!refreshToken) {
          reject(
            new Error(
              `Token has expired and there is no refresh token available.\nPlease reinitialise authorisation by going to http://${HOST}:${PORT}/token/initialiseAuthorisationFlow .`
            )
          );
        } else {
          fetchToken({ refreshToken })
            .then(newToken => resolve(newToken))
            .catch(error => {
              reject(new Error(`Unable to get token.\n${error}`));
            });
        }
      } else {
        resolve(token);
      }
    }
  });

const get = endpoint =>
  new Promise((resolve, reject) => {
    getToken()
      .then(token =>
        axios
          .get(`${api}${endpoint}`, {
            headers: { authorization: `Bearer ${token}` },
            debug: process.env.NODE_ENV === 'development',
          })
          .then(response => resolve(response.data))
          .catch(error => reject(error))
      )
      .catch(error => reject(error));
  });

// const post = (endpoint, body) => new Promise((resolve, reject) => {});

module.exports = {
  get,
  //  post,
};
