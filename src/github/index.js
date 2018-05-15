import express from 'express';

import requestLimit from './limit';
import requestReviews from './reviews';
import requestIssues from './issues';
import requestIssueProjects from './issueProjects';

export const githubRouter = express.Router();

githubRouter.use('/limit', requestLimit);
githubRouter.use('/reviews', requestReviews);
githubRouter.use('/issues', requestIssues);
githubRouter.use('/issueProjects', requestIssueProjects);
