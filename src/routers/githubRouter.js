import express from 'express';
import { requestLimit } from '../requests';

export const githubRouter = express.Router();

githubRouter.use('/limit', requestLimit);
