import express from 'express';
import bodyParser from 'body-parser';
import api from './api';

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/limit', api.githubLimit);

app.all('*', (req, res) => {
    res.json({ page: 'loads' });
});

export default app;

