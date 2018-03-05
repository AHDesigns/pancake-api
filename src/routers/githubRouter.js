import express from 'express';
import {
    requestLimit,
    requestReviews,
} from '../requests';

export const githubRouter = express.Router();

githubRouter.use('/limit', requestLimit);
githubRouter.use('/reviews', requestReviews);
