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

function usersLatestReview(latestReview, review) {
    return latestReview.createdAt > review.createdAt ? latestReview : review;
}

function calcReviewState({ nodes: rawReviews = [] }) {
    if (rawReviews.length === 0) {
        return reviewStates.PENDING;
    }

    const reviewsByUser = {};

    rawReviews.forEach((review) => {
        if ([reviewStates.APPROVED, reviewStates.CHANGES_REQUESTED].includes(review.state)) {
            const user = review.author.login;
            const formatedReview = { createdAt: Date.parse(review.createdAt), state: review.state };

            if (reviewsByUser[user]) {
                reviewsByUser[user].push(formatedReview);
            } else {
                reviewsByUser[user] = [formatedReview];
            }
        }
    });

    if (Object.keys(reviewsByUser).length === 0) {
        return reviewStates.PENDING;
    }

    const reviewSummary = Object.entries(reviewsByUser).map(([author, reviews]) => {
        const { state } = reviews.reduce(usersLatestReview, {});

        return { author, state };
    });

    const reviewState = reviewSummary.reduce((state, review) => {
        if (state === reviewStates.CHANGES_REQUESTED) {
            return state;
        }

        if (review.state === reviewStates.CHANGES_REQUESTED) {
            return reviewStates.CHANGES_REQUESTED;
        }

        return reviewStates.APPROVED;
    }, '');

    return { summary: reviewSummary, state: reviewState };
}

async function requestReviews(req, res) {
    const variables = {
        name: 'skyport-graphql',
        owner: 'sky-uk',
    };

    try {
        const data = await send(reviewsQuery, variables)(gitGQL);
        const {
            data: {
                repository: {
                    name,
                    pullRequests,
                },
            },
        } = data;

        const prs = pullRequests.nodes.map(pr => (
            {
                title: pr.title,
                author: pr.author.login,
                reviews: calcReviewState(pr.reviews),
            }
        ));

        res.json({ name, prs });
    } catch (err) {
        res.json({ errors: err.message });
    }
}

export { requestReviews };
