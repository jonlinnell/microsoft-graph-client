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

process.env.TEST = 'hi';

app.get('/test', (req, res) => {
  get('/users/rsrc.cal.ll.lulevnts@lboro.ac.uk/calendar/events')
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.json(error);
    });
});

app.listen(PORT, () => console.log(`listening on ${PORT}...`));
