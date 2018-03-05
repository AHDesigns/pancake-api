export function gitGQL({ operationName = '', query, variables = '{}' }) {
    return {
        method: 'POST',
        uri: 'https://api.github.com/graphql',
        body: {
            query,
            variables,
        },
        headers: {
            'User-Agent': 'Pancake',
            Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
        },
        json: true,
    };
}
