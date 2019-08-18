const gql = str => str[0].replace(/\n/g, '').replace(/ +/g, ' ');

// TODO: deal with reviewRequests needing variable
// TODO: deal with onBahalfOf needing variable
const reviewsQuery = gql`
query reviewsQuery($name: String!, $owner: String!, $prCount: Int = 5, $reviewsCount: Int = 5) {
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
      url
      title
      isDraft
      mergeStateStatus
      mergeable

      ...commits

      author {
        login
        avatarUrl
      }

      reviewRequests(first: 1) {
        nodes {
          requestedReviewer {
            ... on User {
              userName: name
            }
            ... on Team {
              teamName: name
            }
          }
        }
      }

      reviews(first: $reviewsCount, states: [CHANGES_REQUESTED, APPROVED]) {
        nodes {
          url
          createdAt
          state
          authorAssociation

          author {
            login
            avatarUrl
          }

          onBehalfOf(first: 1) {
            nodes {
              login: name
              avatarUrl
            }
          }
        }
      }
    }
  }
}

fragment commits on PullRequest {
  commits(last: 1) {
    nodes {
      commit {
        commitUrl
        message
        status {
          contexts {
            description
            avatarUrl
            state
          }
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
