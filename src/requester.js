const { env } = require('./helpers/config');
const getReviews = require('./github/reviews');

module.exports = ({
    cache, reviewEmitter, log, watchedRepos,
}) => {
    let runs = 0;

    if (env === 'production') {
        setInterval(() => { pollForReviews(); }, 30 * 1000);
    } else {
        const processId = setInterval(() => {
            pollForReviews();
            runs += 1;
            if (runs > 1) { clearInterval(processId); }
        }, 3 * 1000);
    }


    function pollForReviews() {
        const requests = Object.values(watchedRepos).reduce(dedupe, []);

        log.info('fetching data', requests);

        requests.forEach(repo => getReviews(cache, repo, () => {
            log.info(`emitting data for ${repo}`);

            const data = cache.get([repo, 'value']);
            reviewEmitter.emit('new-reviews', { repo, data });
        }));
    }
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
