const send = require('../helpers/send');
const { gitGQL } = require('../helpers/endpoints');
const { reviewsQuery } = require('./queries');

module.exports = (req, res, next) => send(gitGQL({
    query: reviewsQuery,
    variables: req.body,
}))
    .then(({ repository, rateLimit }) => {
        const { name, pullRequests: { nodes: prs } } = repository;

        res.json({
            name,
            pullRequests: prs.map(pr => (
                {
                    title: pr.title,
                    isDraft: pr.isDraft,
                    isFailing: pr.mergeStateStatus !== 'BEHIND',
                    url: pr.url,
                    author: pr.author,
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
    const uniqueReviews = getLatestReviewStates(rawReviews);

    const state = uniqueReviews.reduce(reviewStateFromReviews, reviewStates.PENDIING);

    return { uniqueReviews, state };

    function getLatestReviewStates(reviews) {
        return reviews.reduceRight((allReviews, review) => {
            const hasAlreadyReviewed = allReviews
                .find(({ author }) => author.login === review.author.login);

            if (!hasAlreadyReviewed) {
            // TODO: authorAssociation NONE should be removed (as they have left sky)
                allReviews.push({
                    ...review,
                    onBehalfOf: review.onBehalfOf.nodes[0],
                });
            }
            return allReviews;
        }, []);

        function reviewerTeam({ nodes }) {
            // TODO: could be on behalf of more than one team but unlikely
            return nodes[0] && nodes[0].name;
        }
    }

    function reviewStateFromReviews(currState, review) {
        if (currState === reviewStates.CHANGES_REQUESTED) {
            return currState;
        }

        if (review.currState === reviewStates.CHANGES_REQUESTED) {
            return reviewStates.CHANGES_REQUESTED;
        }

        return reviewStates.APPROVED;
    }
}
