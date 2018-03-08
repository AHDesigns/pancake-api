import { send } from '../helpers/send';
import { reviewsQuery } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';
import { reverse } from 'dns';

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

function groupReviewsByUser(reviews) {
    const reviewsByUser = {};

    reviews.forEach((review) => {
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

    return Object.entries(reviewsByUser);
}

function deriveReviewStateFromReviews(state, review) {
    if (state === reviewStates.CHANGES_REQUESTED) {
        return state;
    }

    if (review.state === reviewStates.CHANGES_REQUESTED) {
        return reviewStates.CHANGES_REQUESTED;
    }

    return reviewStates.APPROVED;
}

function calcReviewState( rawReviews ) {
    const allReviewsGroupedByUser = groupReviewsByUser(rawReviews);

    const reviewSummary = allReviewsGroupedByUser.map(([author, reviews]) => {
        const { state } = reviews.reduce(usersLatestReview, {});

        return { author, state };
    });

    const reviewState = reviewSummary.reduce(deriveReviewStateFromReviews, reviewStates.PENDIING);

    return { summary: reviewSummary, state: reviewState };
}

const variables = {
    name: 'skyport-graphql',
    owner: 'sky-uk',
};


function transformPrs(pr) {
    return {
        title: pr.title,
        author: pr.author.login,
        reviews: calcReviewState(pr.reviews)
    };
}

async function requestReviews(req, res) {
    return send(reviewsQuery, variables)(gitGQL)
        .then(({ data: { repository } }) => {
            const prs = dig('repository', 'pullRequests', 'node', repository);

            res.json({
                name : String = repository.name,
                pullRequests : PullRequestSummary = transformPrs(prs)
            });
        })
        .catch((err) => {
            res.json({ errors: err.message });
        });
}

export { requestReviews };
