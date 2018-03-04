export function gitGQL(query) {
    return {
        method: 'POST',
        uri: 'https://api.github.com/graphql',
        body: {
            query: `${query}`
        },
        headers: {
            'User-Agent': 'Pancake',
            Authorization: `bearer ${process.env.GITHUB_TOKEN}`
        },
        json: true
    }
}
