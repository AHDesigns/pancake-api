import express from 'express';
import bodyParser from 'body-parser';
import rp from 'request-promise';
// import  githubLimit  from './api';

const app = express();

var options = {
    method: 'POST',
    uri: 'https://api.github.com/graphql',
    body: {
        query: 'query { rateLimit(dryRun: true) { cost limit nodeCount remaining resetAt } viewer { login } }'
    },
    headers: {
        'User-Agent': 'Request-Promise',
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`
    },
    json: true
};

const stuff = (req, res) => rp(options)
    .then(function (htmlString) {
        res.json({ good: true })
        console.log(htmlString);
        // Process html...
    })
    .catch(function (err) {
        console.log(err);
        res.json({ good: false })
    });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use('/limit', githubLimit);
app.use('/limit', stuff);

app.all('*', (req, res) => {
    res.json({ page: 'loads' });
});

export default app;

