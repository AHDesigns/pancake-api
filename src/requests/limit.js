import { send } from '../helpers/send';
import { limit } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';


async function requestLimit(req, res) {
    try {
        const data = await send(limit)(gitGQL);

        res.json(data)
    } catch (err) {
        res.json({ good: false })
    }
}

export { requestLimit };
