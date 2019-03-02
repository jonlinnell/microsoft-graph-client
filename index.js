require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const { get } = require('./helpers/api');

const tokenRoute = require('./routes/token');

const { PORT } = process.env;

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use('/token', tokenRoute);

app.get('/me', (req, res) => {
  get('/me')
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Listening on ${PORT}...`));
