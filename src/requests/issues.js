import { send } from '../helpers/send';
import { issuesQuery } from '../graphql/queries';
import { gitGQL } from '../shared/endpoints';

// move this out of file
const variables = {
    name: 'skyport-graphql',
    owner: 'sky-uk',
};
// -------------------

function seperateByColumn(issues) {
    const issueByColumn = {};
    issues.forEach((issue) => {
        const labels = issue.labels.nodes;

        if (labels.length === 0) {
            const currentIssues = issueByColumn.inbox || [];
            issueByColumn.inbox = [...currentIssues, issue];
        } else {
            const column = issue.labels.nodes[0].name;
            const currentIssues = issueByColumn[column] || [];
            issueByColumn[column] = [...currentIssues, issue];
        }
    });
    return issueByColumn;
}

async function requestIssues(req, res) {
    try {
        const data = await send(issuesQuery, variables)(gitGQL);
        res.json(seperateByColumn(data.data.repository.issues.nodes));
    } catch (err) {
        res.json({ errors: err.message });
    }
}

export { requestIssues };
