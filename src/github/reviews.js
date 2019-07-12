const send = require('../helpers/send');
const { gitGQL } = require('../helpers/endpoints');
const { reviewsQuery } = require('./queries');

module.exports = (req, res, next) => send(gitGQL({
    query: reviewsQuery,
    variables: req.body,
}))
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

