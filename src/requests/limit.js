import rp from 'request-promise';

import limitQuery from '../graphql/limit.graphql';

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

function requestLimit(req, res) {
    return rp(options)
        .then(function (payload) {
            res.json(payload)
        })
        .catch(function (err) {
            console.log(err);
            res.json({ good: false })
        });
}

export { requestLimit }
