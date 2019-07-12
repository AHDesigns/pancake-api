require('dotenv').config();
const express = require('express');
const { port } = require('./helpers/config');
const reviews = require('./github/reviews');
const log = require('./helpers/logger');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/reviews', reviews);

app.all('*', (req, res) => {
    log.info('middleware.invalid.route', req.path);
    res.status(404);
    res.json({ message: `invalid.route ${req.path}` });
});

// need four args to identify error middleware 🤷🏽‍♂️
// eslint-disable-next-line
app.use((err, req, res, next) => {
    log.error('middleware.error.log', err.stack);
    res.status(500).json({ error: err.message });
});

app.listen(port, () => {
    log.info('app.start', {
        port, logLevel: log.level, env: process.env.NODE_ENV,
    });
});
