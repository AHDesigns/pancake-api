require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { port } = require('./helpers/config');
const reviews = require('./github/reviews');
const log = require('./helpers/logger');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// TODO: deal with ddos / greedy clients
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
