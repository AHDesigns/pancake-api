require('dotenv').config();
const express = require('express');
const { port } = require('./helpers/config');
const { githubRouter } = require('./github');

const app = express();

app.use('/git', githubRouter);

app.all('*', (req, res) => {
    res.json({ page: 'loads' });
});

app.use(function (err, req, res, next) {
    console.error(err);
    next(err);
});
app.use(function (err, req, res, next) {
    res.status(500).json({
        error: err.message,
    });
});

app.listen(port, () => { console.log('running'); });
