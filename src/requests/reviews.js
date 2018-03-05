import { send } from '../helpers/send';
import { reviews } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';


async function requestReviews(req, res) {
    const variables = {
        name: 'skyport-graphql',
        owner: 'sky-uk',
    };

    try {
        const data = await send(reviews, variables)(gitGQL);

        res.json(data);
    } catch (err) {
        res.json({ errors: err.message });
    }
}

export { requestReviews };
