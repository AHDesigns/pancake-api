import express from 'express';
import {
    requestLimit,
    requestReviews,
    requestIssues,
    requestIssueProjects,
} from '../requests';

export const githubRouter = express.Router();

githubRouter.use('/limit', requestLimit);
githubRouter.use('/reviews', requestReviews);
githubRouter.use('/issues', requestIssues);
githubRouter.use('/issueProjects', requestIssueProjects);
