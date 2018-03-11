import { send } from '../helpers/send';
import { reviewsQuery } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';

const reviewStates = {
    PENDING: 'PENDING',
    COMMENTED: 'COMMENTED',
    APPROVED: 'APPROVED',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    DISMISSED: 'DISMISSED',
};

// move this out of file
const variables = {
    name: 'skyport-graphql',
    owner: 'sky-uk',
};
// -------------------

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

function calcReviewState(rawReviews) {
    const latestReviewStates = getLatestReviewStates(rawReviews);

    const reviewState = latestReviewStates.reduce(reviewStateFromReviews, reviewStates.PENDIING);

    return { reviews: latestReviewStates, state: reviewState };
}

function transformPrs(prs) {
    return prs.map(pr => (
        {
            title: pr.title,
            author: pr.author.login,
            reviews: calcReviewState(pr.reviews.nodes),
        }
    ));
}


async function requestReviews(req, res) {
    return send(reviewsQuery, variables)(gitGQL)
        .then(({ data: { repository } }) => {
            const { pullRequests: { nodes: prs } } = repository;

            res.json({
                name: repository.name,
                pullRequests: transformPrs(prs),
            });
        })
        .catch((err) => {
            res.json({ errors: err.message });
        });
}

export { requestReviews };
