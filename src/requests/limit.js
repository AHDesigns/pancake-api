import rq from 'request-promise';
import { githubRequestMaker } from '../helpers/githubRequestMaker';
import { limitQuery } from '../graphql/queries';


async function requestLimit(req, res) {
    try {
        const data = await rq(githubRequestMaker(limitQuery));

        res.json(data)
    } catch (err) {
        res.json({ good: false })
    }
}

export { requestLimit };
