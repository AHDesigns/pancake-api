const getReviews = require('./github/reviews');

module.exports = ({
    cache, reviewEmitter, log, watchedRepos,
}) => {
    const requests = Object.values(watchedRepos).reduce(dedupe, []);

    log.info('fetching data', requests);

    Promise.all(
        requests.map(repo => getReviews(repo, cache.get([repo, 'params']))
            .then((data) => {
                cache.set([repo, 'value'], data);
                log.info(`emitting data for ${repo}`);

                reviewEmitter.emit('new-reviews', { repo, data });
            })
            .catch(() => {})),
    );
};


const dedupe = (all, curr) => {
    curr.forEach((repo) => {
        if (all.includes(repo)) {
            return;
        }
        all.push(repo);
    });
    return all;
};
