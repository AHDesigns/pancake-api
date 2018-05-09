import { send } from '../helpers/send';
import { projectsQuery } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';

// move this out of file
const variables = {
    name: 'skymobile-service',
    owner: 'sky-uk',
    labels: ['Tech Debt'],
    count: 20,
};
// -------------------

export async function requestProjects(req, res) {
    try {
        const data = await send(projectsQuery, variables)(gitGQL);
        res.json({
            issues: data.data.repository.issues.nodes.map(({ projectCards: { nodes } }) => ({
                id: nodes[0].id,
                project: nodes[0].project.name,
                column: nodes[0].column.name,
            })),
            count: data.data.repository.issues.totalCount,
        });
        // DELETE /projects/columns/cards/:card_id
        // POST /projects/columns/:column_id/cards?content_id
    } catch (err) {
        res.json({ errors: err.message });
    }
}
