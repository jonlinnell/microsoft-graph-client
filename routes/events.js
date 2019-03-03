const moment = require('moment-timezone');

const router = require('express').Router();

const { get } = require('../helpers/api');

moment.tz.setDefault('Europe/London');

const summariseEvent = event => ({
  title: event.subject,
  start: event.start.dateTime,
  end: event.end.dateTime,
  location: event.location.displayName,
  organiser: event.organizer.emailAddress.name,
});

router.get('/today', (req, res) => {
  get('/Users/rsrc.cal.ll.lulevnts@lboro.ac.uk/calendar/events')
    .then(data =>
      res.json(
        data.value
          .filter(event => moment(event.start.dateTime).isSame(moment(), 'day'))
          .map(event => summariseEvent(event))
      )
    )
    .catch(error => res.status(500).send(error));
});

router.get('/date/:date', (req, res) => {
  const date = moment(req.params.date);

  if (!date.isValid()) {
    res.status(400).send('Date not valid.');
  } else {
    get('/Users/rsrc.cal.ll.lulevnts@lboro.ac.uk/calendar/events')
      .then(data =>
        res.json(
          data.value
            .filter(event => moment(event.start.dateTime).isSame(moment(date), 'day'))
            .map(event => summariseEvent(event))
        )
      )
      .catch(error => res.status(500).send(error));
  }
});

module.exports = router;
