const qs = require('querystringify');
const crypto = require('crypto');
const { Router } = require('express');

const fetchToken = require('../helpers/fetchToken');

const state = crypto.randomBytes(64).toString('hex');

const { CLIENT_ID, HOST, PORT } = process.env;

const router = Router();

router.get('/initialiseAuthorisationFlow', (req, res) => {
  const query = qs.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: `http://${HOST}:${PORT}/token/receive_code`,
    response_mode: 'query',
    scope: 'offline_access User.Read Calendars.Read.Shared',
    state,
  });

  res.redirect(`https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?${query}`);
});

router.get('/receive_code', (req, res) => {
  fetchToken({ code: req.query.code })
    .then(() => res.render('tokenSuccess'))
    .catch(error => {
      if (error.error) {
        res.render('tokenError', { ...error });
      } else {
        res.status(500).json(error);
      }
    });
});

module.exports = router;
