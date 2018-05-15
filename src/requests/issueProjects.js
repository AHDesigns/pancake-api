import { send } from '../helpers/send';
import { issueProjectsQuery } from '../graphql/queries';
import moveCardMutation from '../graphql/mutations/moveCard.graphql';
import { gitGQL } from '../shared/endpoints';

// utils
let chosenColumn;
let chosenBoard;
const moveTo = 'MDEzOlByb2plY3RDb2x1bW4yNTY2MTA3';

const isInColumn = ({ column: { name } }) => name === chosenColumn;
const isInBoard = ({ project: { name } }) => name === chosenBoard;

const filter = issues => cardLocation => issues.filter(issue =>
    issue.projectCards.nodes.some(cardLocation));

const desiredCardDetails = issue => ({
    issueId: issue.id,
    cardId: issue.projectCards.nodes.find(isInColumn).id,
});

const getAllIssues = async (queryVariables, issues = [], after) => {
    const issueVars = {
        ...queryVariables,
        after, // defaults to undefined and starts at 0
    };

    const { data } = await send(issueProjectsQuery, issueVars)(gitGQL);
    const { totalCount, pageInfo: { endCursor }, nodes } = data.repository.issues;
    const totalIssues = issues.concat(nodes);

    return totalCount === totalIssues.length
        ? totalIssues
        : getAllIssues(queryVariables, totalIssues, endCursor);
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

export async function requestIssueProjects({ query }, res) {
    chosenColumn = query.moveFromColumn || '🚀';// bit hacky
    chosenBoard = query.moveFromBoard || 'Backlog';

    const queryVariables = {
        labels: query.labels && query.labels.split(','),
        name: 'skymobile-service',
        owner: 'sky-uk',
        count: 100,
    };

    try {
        const issues = await getAllIssues(queryVariables);

        const byLocation = queryVariables.labels ? isInBoard : isInColumn;
        const cardsToMove = filter(issues)(byLocation).map(desiredCardDetails);

        // res.json(cardsToMove);
        res.json(cardsToMove.length ? await moveCard(cardsToMove) : { data: 'no cards found to move' });
    } catch (err) {
        res.json({ errors: err.message });
    }
}
