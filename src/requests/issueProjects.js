import { send } from '../helpers/send';
import { issueProjectsQuery } from '../graphql/queries';
import moveCardMutation from '../graphql/mutations/moveCard.graphql';
import { gitGQL } from '../shared/endpoints';

// move this out of file
const variables = {
    name: 'skymobile-service',
    owner: 'sky-uk',
    // labels: ['chuftey'],
    count: 100,
};
// -------------------

const chosenColumn = '🚀';
const isInColumn = ({ column: { name } }) => name === chosenColumn;
const moveTo = 'MDEzOlByb2plY3RDb2x1bW4yNTY2MTA3';

const issueIsReady = issue => issue.projectCards.nodes
    .some(isInColumn);

const findCardsToMove = issues => issues.filter(issueIsReady);

const getAllIssues = async (issues = [], after) => {
    const issueVars = {
        ...variables,
        after, // defaults to undefined and starts at 0
    };

    const { data } = await send(issueProjectsQuery, issueVars)(gitGQL);
    const { totalCount, pageInfo: { endCursor }, nodes } = data.repository.issues;
    const totalIssues = issues.concat(nodes);

    if (totalCount !== totalIssues.length) {
        return getAllIssues(totalIssues, endCursor);
    }

    return totalIssues;
};

const moveCard = async ([card, ...cards], responses = []) => {
    if (!card) return responses;

    const mutVars = {
        projectColumnId: moveTo,
        issueId: card.issueId,
        cardId: card.cardId,
    };

    const response = await send(moveCardMutation, mutVars)(gitGQL);
    return moveCard(cards, responses.concat(response));
};

export async function requestIssueProjects(req, res) {
    try {
        const issues = await getAllIssues();

        const cardsToMove = findCardsToMove(issues)
            .map(issue => ({
                issueId: issue.id,
                cardId: issue.projectCards.nodes.find(isInColumn).id,
            }));

        if (!cardsToMove) {
            res.send({ data: 'no cards found to move' });
        } else {
            const responses = await moveCard(cardsToMove);
            res.send(responses);
        }
    } catch (err) {
        res.json({ errors: err.message });
    }
}
