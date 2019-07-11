const express = require('express');
const requestReviews = require('./reviews');

const githubRouter = express.Router();

githubRouter.use('/reviews', requestReviews);

module.exports = { githubRouter };
