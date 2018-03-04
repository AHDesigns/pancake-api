import express from 'express';
import bodyParser from 'body-parser';
import rp from 'request-promise';
// import  githubLimit  from './api';
import limitQuery from './graphql/limit.graphql';

const app = express();

var options = {
    method: 'POST',
    uri: 'https://api.github.com/graphql',
    body: {
        query: `${limitQuery}`
    },
    headers: {
        'User-Agent': 'Request-Promise',
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`
    },
    json: true
};

const stuff = (req, res) => rp(options)
    .then(function (payload) {
        res.json(payload)
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

