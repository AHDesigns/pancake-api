import express from 'express';
import bodyParser from 'body-parser';

import { githubRouter } from './routers';

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/git', githubRouter);

app.all('*', (req, res) => {
    res.json({ page: 'loads' });
});

export default app;

