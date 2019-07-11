const send = require('../helpers/send');
const { gitGQL } = require('../shared/endpoints');
const { reviewsQuery } = require('./queries');

const variables = {
    name: 'skyport-graphql',
    owner: 'sky-uk',
    prCount: 26,
    reviewsCount: 10,
};
// -------------------

module.exports = async (req, res, next) => send(gitGQL({ query: reviewsQuery, variables }))
    .then(({ data: { repository, rateLimit } }) => {
        const { name, pullRequests: { nodes: prs } } = repository;

        res.json({
            name,
            pullRequests: prs.map(pr => (
                {
                    title: pr.title,
                    author: pr.author.login,
                    reviews: calcReviewState(pr.reviews.nodes),
                }
            )),
            rateLimit,
        });
    })
    .catch(next);
    // .catch((err) => {
    //     next(err);
    //     // res.json({ errors: err.message });
    // });

const reviewStates = {
    PENDING: 'PENDING',
    COMMENTED: 'COMMENTED',
    APPROVED: 'APPROVED',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    DISMISSED: 'DISMISSED',
};

function calcReviewState(rawReviews) {
    const latestReviewStates = getLatestReviewStates(rawReviews);

    const reviewState = latestReviewStates.reduce(reviewStateFromReviews, reviewStates.PENDIING);

    return { reviews: latestReviewStates, state: reviewState };

    function getLatestReviewStates(reviews) {
        return reviews.reduceRight((allReviews, { state, author: { login: reviewer } }) => {
            const hasAlreadyReviewed = allReviews
                .find(({ reviewer: currentReviewer }) => currentReviewer === reviewer);

            if (!hasAlreadyReviewed) {
                allReviews.push({ reviewer, state });
            }
            return allReviews;
        }, []);
    }

    function reviewStateFromReviews(state, review) {
        if (state === reviewStates.CHANGES_REQUESTED) {
            return state;
        }

        if (review.state === reviewStates.CHANGES_REQUESTED) {
            return reviewStates.CHANGES_REQUESTED;
        }

        return reviewStates.APPROVED;
    }
}

