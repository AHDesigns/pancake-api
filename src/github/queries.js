const gql = str => str[0].replace(/\n/g, '').replace(/ +/g, ' ');

const reviewsQuery = gql`
query reviewsQuery ($name: String!, $owner: String!, $prCount: Int = 5, $reviewsCount: Int = 5) {
    rateLimit {
        limit
        cost
        nodeCount
        remaining
        resetAt
    }
    repository(name: $name, owner: $owner) {
        name
        ...pullRequests
    }
}

fragment pullRequests on Repository {
    pullRequests(first: $prCount, states: [OPEN]) {
        nodes {
            author {
                login
            }
            title
            reviews(first: $reviewsCount, states: [CHANGES_REQUESTED, APPROVED]) {
                nodes {
                    author {
                        login
                    }
                    createdAt
                    state
                }
            }
        }
    }
}
`;

module.exports = {
    reviewsQuery,
};
